var api = require('../../utils/api');

Page({
  data: {
    petId: null,
    petName: '',
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
    nextDateInfo: '',
    notesLength: 0,
    canSubmit: false,
    loading: false,
    vaccineTypes: ['狂犬疫苗', '犬瘟热', '细小疫苗', '猫三联', '猫五联'],
    vaccineIntervals: {
      '狂犬疫苗': { days: 365, text: '间隔1年' },
      '犬瘟热': { days: 365, text: '间隔1年' },
      '细小疫苗': { days: 365, text: '间隔1年' },
      '猫三联': { days: 365, text: '间隔1年' },
      '猫五联': { days: 365, text: '间隔1年' },
    },
    dewormTypes: [
      { value: 'internal', label: '体内', interval: { days: 30, text: '间隔1个月' } },
      { value: 'external', label: '体外', interval: { days: 90, text: '间隔3个月' } },
      { value: 'both', label: '体内外', interval: { days: 30, text: '间隔1个月' } },
    ],
    showVaccinePicker: false,
    showDewormPicker: false,
    showPetPicker: false,
    petList: [],
  },

  onLoad: function(options) {
    if (options && options.pet_id) {
      this.setData({ petId: options.pet_id });
      this.loadPetName(options.pet_id);
    }
    this.checkCanSubmit();
  },

  loadPetName: function(petId) {
    var that = this;
    api.get('/pets/' + petId).then(function(res) {
      if (res.data) {
        that.setData({ petName: res.data.name });
      }
    }).catch(function(err) {
      console.error('加载宠物名称失败:', err);
    });
  },

  showPetPicker: function() {
    this.loadPetList();
    this.setData({ showPetPicker: true });
  },

  hidePetPicker: function() {
    this.setData({ showPetPicker: false });
  },

  loadPetList: function() {
    var that = this;
    var baseUrl = getApp().globalData.baseUrl.replace('/api', '');
    api.get('/pets?page=1&pageSize=100').then(function(res) {
      var petList = [];
      if (res) {
        var data = res.data || res;
        if (data.list) {
          petList = data.list;
        } else if (Array.isArray(data)) {
          petList = data;
        }
      }
      for (var i = 0; i < petList.length; i++) {
        var pet = petList[i];
        if (pet.avatar_photo) {
          pet.avatar_photo = baseUrl + pet.avatar_photo;
        }
      }
      that.setData({ petList: petList });
    }).catch(function(err) {
      console.error('加载宠物列表失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  selectPet: function(e) {
    var dataset = e.currentTarget.dataset;
    var id = dataset.id;
    var name = dataset.name;
    this.setData({
      petId: id,
      petName: name,
      showPetPicker: false,
    });
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
    const { currentType, formData, vaccineIntervals, dewormTypes } = this.data;
    const { record_date, vaccine_type, deworm_type } = formData;

    if (!record_date) {
      this.setData({ nextDate: '', nextDateInfo: '' });
      return;
    }

    const date = new Date(record_date);
    if (isNaN(date.getTime())) {
      this.setData({ nextDate: '', nextDateInfo: '' });
      return;
    }

    let days = 0;
    let intervalText = '';
    let typeName = '';

    if (currentType === 'vaccine') {
      if (!vaccine_type) {
        this.setData({ nextDate: '', nextDateInfo: '' });
        return;
      }
      const interval = vaccineIntervals[vaccine_type] || { days: 365, text: '间隔1年' };
      days = interval.days;
      intervalText = interval.text;
      typeName = vaccine_type;
    } else if (currentType === 'deworm') {
      if (!deworm_type) {
        this.setData({ nextDate: '', nextDateInfo: '' });
        return;
      }
      const dewormType = dewormTypes.find(d => d.value === deworm_type);
      if (dewormType) {
        days = dewormType.interval.days;
        intervalText = dewormType.interval.text;
        typeName = dewormType.label;
      }
    } else {
      this.setData({ nextDate: '', nextDateInfo: '' });
      return;
    }

    if (days > 0) {
      const nextDateObj = new Date(date.getTime());
      nextDateObj.setDate(nextDateObj.getDate() + days);
      const year = nextDateObj.getFullYear();
      const month = String(nextDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(nextDateObj.getDate()).padStart(2, '0');
      const nextDateStr = `${year}-${month}-${day}`;
      
      let infoText = '';
      if (currentType === 'vaccine') {
        infoText = `${nextDateStr}（${typeName}${intervalText}）`;
      } else if (currentType === 'deworm') {
        infoText = `${nextDateStr}（${typeName}驱虫${intervalText}）`;
      }
      
      this.setData({ nextDate: nextDateStr, nextDateInfo: infoText });
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

  submitForm: function() {
    if (!this.data.canSubmit || this.data.loading) return;

    var that = this;
    that.setData({ loading: true });

    var formData = that.data.formData;
    var petId = that.data.petId;
    var currentType = that.data.currentType;
    var nextDate = that.data.nextDate;

    var submitData = {
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

    api.post('/health', submitData).then(function() {
      wx.showToast({ title: '添加成功', icon: 'success' });

      setTimeout(function() {
        wx.navigateBack();
      }, 1500);
    }).catch(function(err) {
      console.error('保存失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }).finally(function() {
      that.setData({ loading: false });
    });
  },
});
