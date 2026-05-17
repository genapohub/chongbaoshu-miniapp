const api = require('../../utils/api');

Page({
  data: {
    petId: null,
    breedingId: null,
    isEdit: false,
    formData: {
      mating_date: '',
      mate_name: '',
      mating_method: '',
      mating_method_display: '',
      due_date: '',
      fee: '',
      notes: '',
    },
    notesLength: 0,
    showMethodPicker: false,
    methodOptions: [
      { value: 'natural', label: '自然交配' },
      { value: 'artificial', label: '人工授精' },
      { value: 'ivf', label: '试管受精' },
    ],
    canSubmit: false,
    loading: false,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        breedingId: options.id,
        isEdit: true,
      });
      this.loadBreedingData(options.id);
    }
    if (options.pet_id) {
      this.setData({ petId: options.pet_id });
    }
    this.checkCanSubmit();
  },

  async loadBreedingData(id) {
    try {
      wx.showLoading({ title: '加载中...', mask: true });

      const res = await api.get(`/breeding/${id}`);
      const method = this.data.methodOptions.find(m => m.value === res.mating_method);

      this.setData({
        formData: {
          ...res,
          mating_date: res.mating_date ? res.mating_date.split(' ')[0] : '',
          due_date: res.due_date ? res.due_date.split(' ')[0] : '',
          mating_method_display: method ? method.label : '',
        },
        notesLength: res.notes ? res.notes.length : 0,
      });

      this.checkCanSubmit();
    } catch (err) {
      console.error('加载繁育记录失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
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

  onMatingDateChange(e) {
    this.setData({
      'formData.mating_date': e.detail.value,
    });
    this.checkCanSubmit();
  },

  onDueDateChange(e) {
    this.setData({
      'formData.due_date': e.detail.value,
    });
  },

  showMethodPicker() {
    this.setData({ showMethodPicker: true });
  },

  hideMethodPicker() {
    this.setData({ showMethodPicker: false });
  },

  stopPropagation() {},

  selectMethod(e) {
    const value = e.currentTarget.dataset.value;
    const method = this.data.methodOptions.find(m => m.value === value);

    this.setData({
      'formData.mating_method': value,
      'formData.mating_method_display': method ? method.label : '',
      showMethodPicker: false,
    });
  },

  checkCanSubmit() {
    const { mating_date } = this.data.formData;
    const canSubmit = !!mating_date;
    this.setData({ canSubmit });
  },

  async submitForm() {
    if (!this.data.canSubmit || this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { formData, petId, isEdit, breedingId } = this.data;

      const submitData = {
        mate_name: formData.mate_name || null,
        mating_date: formData.mating_date,
        mating_method: formData.mating_method || 'natural',
        due_date: formData.due_date || null,
        fee: formData.fee && !isNaN(parseFloat(formData.fee)) ? parseFloat(formData.fee) : null,
        notes: formData.notes || null,
      };

      if (isEdit) {
        await api.put(`/breeding/${breedingId}`, submitData);
        wx.showToast({ title: '更新成功', icon: 'success' });
      } else {
        await api.post('/breeding', {
          ...submitData,
          pet_id: petId,
        });
        wx.showToast({ title: '添加成功', icon: 'success' });
      }

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