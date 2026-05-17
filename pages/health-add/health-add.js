const api = require('../../utils/api');

Page({
  data: {
    petId: null,
    currentType: 'vaccine',
    formData: {
      vaccine_type: '',
      vaccine_round: '',
      deworm_type: '',
      deworm_type_display: '',
      medicine_name: '',
      record_date: '',
      dosage: '',
      batch_no: '',
      vet_hospital: '',
      description: '',
      notes: '',
    },
    nextDate: '',
    notesLength: 0,
    canSubmit: false,
    loading: false,
    vaccineTypes: ['狂犬疫苗', '犬瘟热', '细小疫苗', '猫三联', '猫五联'],
    dewormTypes: [
      { value: 'internal', label: '体内' },
      { value: 'external', label: '体外' },
      { value: 'both', label: '体内外' },
    ],
    showVaccinePicker: false,
    showDewormPicker: false,
  },

  onLoad(options) {
    if (options.pet_id) {
      this.setData({ petId: options.pet_id });
    }
    this.checkCanSubmit();
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentType: type,
      formData: {
        vaccine_type: '',
        vaccine_round: '',
        deworm_type: '',
        deworm_type_display: '',
        medicine_name: '',
        record_date: '',
        dosage: '',
        batch_no: '',
        vet_hospital: '',
        description: '',
        notes: '',
      },
      nextDate: '',
      notesLength: 0,
    });
    this.checkCanSubmit();
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value,
    });
    this.checkCanSubmit();
  },

  onNotesInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.notes': value,
      notesLength: value ? value.length : 0,
    });
  },

  onDateChange(e) {
    this.setData({
      'formData.record_date': e.detail.value,
    });
    this.calculateNextDate();
    this.checkCanSubmit();
  },

  showVaccinePickerFn() {
    this.setData({ showVaccinePicker: true });
  },

  hideVaccinePicker() {
    this.setData({ showVaccinePicker: false });
  },

  selectVaccine(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      'formData.vaccine_type': value,
      showVaccinePicker: false,
    });
    this.calculateNextDate();
    this.checkCanSubmit();
  },

  showDewormPickerFn() {
    this.setData({ showDewormPicker: true });
  },

  hideDewormPicker() {
    this.setData({ showDewormPicker: false });
  },

  selectDeworm(e) {
    const value = e.currentTarget.dataset.value;
    const method = this.data.dewormTypes.find(m => m.value === value);
    this.setData({
      'formData.deworm_type': value,
      'formData.deworm_type_display': method ? method.label : '',
      showDewormPicker: false,
    });
    this.calculateNextDate();
    this.checkCanSubmit();
  },

  stopPropagation() {},

  calculateNextDate() {
    const { currentType, formData } = this.data;
    const { record_date, vaccine_type, deworm_type } = formData;

    if (!record_date) {
      this.setData({ nextDate: '' });
      return;
    }

    const date = new Date(record_date);
    if (isNaN(date.getTime())) {
      this.setData({ nextDate: '' });
      return;
    }

    let days = 0;

    if (currentType === 'vaccine' && vaccine_type) {
      days = 365;
    } else if (currentType === 'deworm' && deworm_type) {
      if (deworm_type === 'internal') {
        days = 30;
      } else if (deworm_type === 'external') {
        days = 90;
      } else if (deworm_type === 'both') {
        days = 30;
      }
    } else {
      this.setData({ nextDate: '' });
      return;
    }

    if (days > 0) {
      date.setDate(date.getDate() + days);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.setData({ nextDate: `${year}-${month}-${day}` });
    }
  },

  checkCanSubmit() {
    const { currentType, formData } = this.data;
    let canSubmit = false;

    if (currentType === 'vaccine') {
      canSubmit = !!(formData.vaccine_type && formData.vaccine_round && formData.record_date);
      if (formData.vaccine_round) {
        const round = parseInt(formData.vaccine_round, 10);
        if (isNaN(round) || round < 1 || round > 10) {
          canSubmit = false;
        }
      }
    } else if (currentType === 'deworm') {
      canSubmit = !!(formData.deworm_type && formData.medicine_name && formData.record_date);
    } else if (currentType === 'other') {
      canSubmit = !!(formData.record_date && formData.description);
    }

    this.setData({ canSubmit });
  },

  async submitForm() {
    if (!this.data.canSubmit || this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { formData, petId, currentType, nextDate } = this.data;

      const submitData = {
        pet_id: petId,
        type: currentType,
        record_date: formData.record_date,
      };

      if (currentType === 'vaccine') {
        submitData.vaccine_type = formData.vaccine_type;
        submitData.vaccine_round = parseInt(formData.vaccine_round, 10);
        if (formData.batch_no) submitData.batch_no = formData.batch_no;
        if (formData.vet_hospital) submitData.vet_hospital = formData.vet_hospital;
      } else if (currentType === 'deworm') {
        submitData.deworm_type = formData.deworm_type;
        if (formData.medicine_name) submitData.medicine_name = formData.medicine_name;
        if (formData.dosage) submitData.dosage = formData.dosage;
        if (formData.vet_hospital) submitData.vet_hospital = formData.vet_hospital;
      } else if (currentType === 'other') {
        if (formData.description) submitData.description = formData.description;
      }

      if (formData.notes) submitData.notes = formData.notes;
      if (nextDate) submitData.next_date = nextDate;

      await api.post('/api/health', submitData);
      wx.showToast({ title: '添加成功', icon: 'success' });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
