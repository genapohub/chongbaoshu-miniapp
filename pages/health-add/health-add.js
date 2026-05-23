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
    roundError: '',
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
    this.recalcSubmit();
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
    var formData = this.data.formData;
    this.setData({
      petId: id,
      petName: name,
      showPetPicker: false,
      canSubmit: this._calcCanSubmit(this.data.currentType, formData),
    });
  },

  switchType: function(e) {
    var type = e.currentTarget.dataset.type;
    var newFormData = {
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
    };
    this.setData({
      currentType: type,
      formData: newFormData,
      nextDate: '',
      nextDateInfo: '',
      notesLength: 0,
      roundError: '',
      canSubmit: false,
    });
  },

  onInputChange: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value;
    var formData = this.data.formData;
    formData[field] = value;
    var canSubmit = this._calcCanSubmit(this.data.currentType, formData);

    // 针次实时校验提示
    var roundError = '';
    if (field === 'vaccine_round' && value) {
      var round = parseInt(value, 10);
      if (isNaN(round) || round < 1 || round > 10) {
        roundError = '针次请输入1-10的数字';
      }
    }

    this.setData({
      formData: formData,
      canSubmit: canSubmit,
      roundError: roundError,
    });
  },

  onNotesInput: function(e) {
    var value = e.detail.value;
    this.setData({
      'formData.notes': value,
      notesLength: value ? value.length : 0,
    });
  },

  onDateChange: function(e) {
    var formData = this.data.formData;
    formData.record_date = e.detail.value;
    var canSubmit = this._calcCanSubmit(this.data.currentType, formData);
    var updateObj = {
      formData: formData,
      canSubmit: canSubmit,
    };
    // 计算下次日期
    var nextResult = this._calcNextDate(this.data.currentType, formData);
    if (nextResult) {
      updateObj.nextDate = nextResult.nextDate;
      updateObj.nextDateInfo = nextResult.nextDateInfo;
    } else {
      updateObj.nextDate = '';
      updateObj.nextDateInfo = '';
    }
    this.setData(updateObj);
  },

  showVaccinePickerFn: function() {
    this.setData({ showVaccinePicker: true });
  },

  hideVaccinePicker: function() {
    this.setData({ showVaccinePicker: false });
  },

  selectVaccine: function(e) {
    var value = e.currentTarget.dataset.value;
    var formData = this.data.formData;
    formData.vaccine_type = value;
    var canSubmit = this._calcCanSubmit(this.data.currentType, formData);
    var updateObj = {
      formData: formData,
      showVaccinePicker: false,
      canSubmit: canSubmit,
    };
    var nextResult = this._calcNextDate(this.data.currentType, formData);
    if (nextResult) {
      updateObj.nextDate = nextResult.nextDate;
      updateObj.nextDateInfo = nextResult.nextDateInfo;
    } else {
      updateObj.nextDate = '';
      updateObj.nextDateInfo = '';
    }
    this.setData(updateObj);
  },

  showDewormPickerFn: function() {
    this.setData({ showDewormPicker: true });
  },

  hideDewormPicker: function() {
    this.setData({ showDewormPicker: false });
  },

  selectDeworm: function(e) {
    var value = e.currentTarget.dataset.value;
    var method = null;
    for (var i = 0; i < this.data.dewormTypes.length; i++) {
      if (this.data.dewormTypes[i].value === value) {
        method = this.data.dewormTypes[i];
        break;
      }
    }
    var formData = this.data.formData;
    formData.deworm_type = value;
    formData.deworm_type_display = method ? method.label : '';
    var updateObj = {
      formData: formData,
      showDewormPicker: false,
      canSubmit: this._calcCanSubmit(this.data.currentType, formData),
    };
    var nextResult = this._calcNextDate(this.data.currentType, formData);
    if (nextResult) {
      updateObj.nextDate = nextResult.nextDate;
      updateObj.nextDateInfo = nextResult.nextDateInfo;
    } else {
      updateObj.nextDate = '';
      updateObj.nextDateInfo = '';
    }
    this.setData(updateObj);
  },

  stopPropagation: function() {},

  // 纯函数：根据 type 和 formData 计算是否可提交，不依赖 this.data
  _calcCanSubmit: function(currentType, formData) {
    var canSubmit = false;
    if (currentType === 'vaccine') {
      canSubmit = !!(formData.vaccine_type && formData.vaccine_round && formData.record_date);
      if (canSubmit && formData.vaccine_round) {
        var round = parseInt(formData.vaccine_round, 10);
        if (isNaN(round) || round < 1 || round > 10) {
          canSubmit = false;
        }
      }
    } else if (currentType === 'deworm') {
      canSubmit = !!(formData.deworm_type && formData.medicine_name && formData.record_date);
    } else if (currentType === 'other') {
      canSubmit = !!(formData.record_date && formData.description);
    }
    return canSubmit;
  },

  // 纯函数：计算下次日期，返回 { nextDate, nextDateInfo } 或 null
  _calcNextDate: function(currentType, formData) {
    var record_date = formData.record_date;
    var vaccine_type = formData.vaccine_type;
    var deworm_type = formData.deworm_type;
    var vaccineIntervals = this.data.vaccineIntervals;
    var dewormTypes = this.data.dewormTypes;

    if (!record_date) return null;

    var date = new Date(record_date);
    if (isNaN(date.getTime())) return null;

    var days = 0;
    var intervalText = '';
    var typeName = '';

    if (currentType === 'vaccine') {
      if (!vaccine_type) return null;
      var interval = vaccineIntervals[vaccine_type] || { days: 365, text: '间隔1年' };
      days = interval.days;
      intervalText = interval.text;
      typeName = vaccine_type;
    } else if (currentType === 'deworm') {
      if (!deworm_type) return null;
      var dewormType = null;
      for (var i = 0; i < dewormTypes.length; i++) {
        if (dewormTypes[i].value === deworm_type) {
          dewormType = dewormTypes[i];
          break;
        }
      }
      if (dewormType) {
        days = dewormType.interval.days;
        intervalText = dewormType.interval.text;
        typeName = dewormType.label;
      }
    } else {
      return null;
    }

    if (days > 0) {
      var nextDateObj = new Date(date.getTime());
      nextDateObj.setDate(nextDateObj.getDate() + days);
      var year = nextDateObj.getFullYear();
      var month = (nextDateObj.getMonth() + 1);
      if (month < 10) month = '0' + month;
      var day = nextDateObj.getDate();
      if (day < 10) day = '0' + day;
      var nextDateStr = year + '-' + month + '-' + day;

      var infoText = '';
      if (currentType === 'vaccine') {
        infoText = nextDateStr + '（' + typeName + intervalText + '）';
      } else if (currentType === 'deworm') {
        infoText = nextDateStr + '（' + typeName + '驱虫' + intervalText + '）';
      }

      return { nextDate: nextDateStr, nextDateInfo: infoText };
    }
    return null;
  },

  // 保留旧方法名作为兼容入口
  recalcSubmit: function() {
    var canSubmit = this._calcCanSubmit(this.data.currentType, this.data.formData);
    if (this.data.canSubmit !== canSubmit) {
      this.setData({ canSubmit: canSubmit });
    }
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
