const api = require('../../utils/api');
const analytics = require('../../utils/analytics');
const { formatDate } = require('../../utils/constants');

Page({
  data: {
    isEdit: false,
    editId: null,
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
    canSubmit: false,
    roundError: '',
    loading: false,
    vaccineTypes: ['狂犬疫苗', '犬瘟热', '细小疫苗', '猫三联', '猫五联'],
    vaccinePickerItems: [
      { value: '狂犬疫苗', label: '狂犬疫苗' },
      { value: '犬瘟热', label: '犬瘟热' },
      { value: '细小疫苗', label: '细小疫苗' },
      { value: '猫三联', label: '猫三联' },
      { value: '猫五联', label: '猫五联' },
    ],
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
    dewormPickerItems: [
      { value: 'internal', label: '体内驱虫' },
      { value: 'external', label: '体外驱虫' },
      { value: 'both', label: '内外同驱' },
    ],
    showVaccinePicker: false,
    showDewormPicker: false,
    showPetPicker: false,
    petList: [],
  },

  onLoad: function(options) {
    if (options && options.editId) {
      // 编辑模式：加载已有健康记录
      this.setData({ isEdit: true, editId: options.editId });
      wx.setNavigationBarTitle({ title: '编辑健康记录' });
      this.loadRecord(options.editId);
    } else if (options && options.pet_id) {
      // 新增模式：指定宠物
      this.setData({ petId: options.pet_id });
      this.loadPetName(options.pet_id);
    }
    this.recalcSubmit();
  },

  /** 编辑模式：从后端加载单条健康记录并回显 */
  loadRecord: function(recordId) {
    const that = this;
    api.get('/health/' + recordId).then(function(res) {
      const record = res;
      if (!record) {
        wx.showToast({ title: '记录不存在', icon: 'none' });
        return;
      }

      // 确定类型标签
      const currentType = record.type || 'vaccine';

      // 构建 formData
      const formData = {
        vaccine_type: record.vaccine_type || '',
        vaccine_round: record.vaccine_round ? String(record.vaccine_round) : '',
        deworm_type: record.deworm_type || '',
        deworm_type_display: '',
        medicine_name: record.medicine_name || '',
        record_date: record.record_date ? formatDate(record.record_date) : '',
        dosage: record.dosage || '',
        batch_no: record.batch_no || '',
        vet_hospital: record.vet_hospital || '',
        description: record.type === 'other' ? (record.notes || '') : '',
        notes: record.notes || '',
      };

      // 驱虫类型显示文字
      if (currentType === 'deworm' && record.deworm_type) {
        for (let i = 0; i < that.data.dewormTypes.length; i++) {
          if (that.data.dewormTypes[i].value === record.deworm_type) {
            formData.deworm_type_display = that.data.dewormTypes[i].label;
            break;
          }
        }
      }

      // 下次日期
      let nextDate = '';
      let nextDateInfo = '';
      if (record.next_date) {
        nextDate = formatDate(record.next_date);
        const nextResult = that._calcNextDate(currentType, formData);
        if (nextResult) {
          nextDateInfo = nextResult.nextDateInfo;
        } else {
          nextDateInfo = nextDate;
        }
      }

      const petId = record.pet_id || null;
      const petName = record.pet_name || '';

      const canSubmit = that._calcCanSubmit(currentType, formData, petId);

      that.setData({
        petId: petId,
        petName: petName,
        currentType: currentType,
        formData: formData,
        nextDate: nextDate,
        nextDateInfo: nextDateInfo,
        canSubmit: canSubmit,
      });
    }).catch(function(err) {
      console.error('加载健康记录失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  loadPetName: function(petId) {
    const that = this;
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
    const that = this;
    const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
    api.get('/pets?page=1&pageSize=100').then(function(res) {
      const petList = [];
      if (res) {
        const data = res.data || res;
        if (data.list) {
          petList = data.list;
        } else if (Array.isArray(data)) {
          petList = data;
        }
      }
      for (let i = 0; i < petList.length; i++) {
        const pet = petList[i];
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
    const dataset = e.currentTarget.dataset;
    const id = dataset.id;
    const name = dataset.name;
    const formData = this.data.formData;
    this.setData({
      petId: id,
      petName: name,
      showPetPicker: false,
      canSubmit: this._calcCanSubmit(this.data.currentType, formData, id),
    });
  },

  switchType: function(e) {
    const type = e.currentTarget.dataset.type;
    const newFormData = {
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
      roundError: '',
      canSubmit: false,
    });
  },

  onInputChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const formData = this.data.formData;
    formData[field] = value;
    const canSubmit = this._calcCanSubmit(this.data.currentType, formData, this.data.petId);

    // 针次实时校验提示
    let roundError = '';
    if (field === 'vaccine_round' && value) {
      const round = parseInt(value, 10);
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
    const value = e.detail.value;
    this.setData({
      'formData.notes': value,
    });
  },

  onDateChange: function(e) {
    const formData = this.data.formData;
    formData.record_date = e.detail.value;
    const canSubmit = this._calcCanSubmit(this.data.currentType, formData, this.data.petId);
    const updateObj = {
      formData: formData,
      canSubmit: canSubmit,
    };
    // 计算下次日期
    const nextResult = this._calcNextDate(this.data.currentType, formData);
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

  onVaccineSelect: function(e) {
    const value = e.detail.value;
    const formData = this.data.formData;
    formData.vaccine_type = value;
    const canSubmit = this._calcCanSubmit(this.data.currentType, formData, this.data.petId);
    const updateObj = {
      formData: formData,
      showVaccinePicker: false,
      canSubmit: canSubmit,
    };
    const nextResult = this._calcNextDate(this.data.currentType, formData);
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

  onDewormSelect: function(e) {
    const value = e.detail.value;
    let method = null;
    for (let i = 0; i < this.data.dewormTypes.length; i++) {
      if (this.data.dewormTypes[i].value === value) {
        method = this.data.dewormTypes[i];
        break;
      }
    }
    const formData = this.data.formData;
    formData.deworm_type = value;
    formData.deworm_type_display = method ? method.label : '';
    const updateObj = {
      formData: formData,
      showDewormPicker: false,
      canSubmit: this._calcCanSubmit(this.data.currentType, formData, this.data.petId),
    };
    const nextResult = this._calcNextDate(this.data.currentType, formData);
    if (nextResult) {
      updateObj.nextDate = nextResult.nextDate;
      updateObj.nextDateInfo = nextResult.nextDateInfo;
    } else {
      updateObj.nextDate = '';
      updateObj.nextDateInfo = '';
    }
    this.setData(updateObj);
  },

  _calcCanSubmit: function(currentType, formData, petId) {
    let canSubmit = false;
    if (!petId) {
      return false;
    }
    if (currentType === 'vaccine') {
      canSubmit = !!(formData.vaccine_type && formData.vaccine_round && formData.record_date);
      if (canSubmit && formData.vaccine_round) {
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
    return canSubmit;
  },

  // 纯函数：计算下次日期，返回 { nextDate, nextDateInfo } 或 null
  _calcNextDate: function(currentType, formData) {
    const record_date = formData.record_date;
    const vaccine_type = formData.vaccine_type;
    const deworm_type = formData.deworm_type;
    const vaccineIntervals = this.data.vaccineIntervals;
    const dewormTypes = this.data.dewormTypes;

    if (!record_date) return null;

    const date = new Date(record_date);
    if (isNaN(date.getTime())) return null;

    let days = 0;
    let intervalText = '';
    let typeName = '';

    if (currentType === 'vaccine') {
      if (!vaccine_type) return null;
      const interval = vaccineIntervals[vaccine_type] || { days: 365, text: '间隔1年' };
      days = interval.days;
      intervalText = interval.text;
      typeName = vaccine_type;
    } else if (currentType === 'deworm') {
      if (!deworm_type) return null;
      let dewormType = null;
      for (let i = 0; i < dewormTypes.length; i++) {
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
      const nextDateObj = new Date(date.getTime());
      nextDateObj.setDate(nextDateObj.getDate() + days);
      const year = nextDateObj.getFullYear();
      let month = (nextDateObj.getMonth() + 1);
      if (month < 10) month = '0' + month;
      let day = nextDateObj.getDate();
      if (day < 10) day = '0' + day;
      const nextDateStr = year + '-' + month + '-' + day;

      let infoText = '';
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
    const canSubmit = this._calcCanSubmit(this.data.currentType, this.data.formData);
    if (this.data.canSubmit !== canSubmit) {
      this.setData({ canSubmit: canSubmit });
    }
  },

  submitForm: function() {
    if (!this.data.canSubmit || this.data.loading) return;

    const that = this;
    that.setData({ loading: true });

    const formData = that.data.formData;
    const petId = that.data.petId;
    const currentType = that.data.currentType;
    const nextDate = that.data.nextDate;

    if (that.data.isEdit) {
      // 编辑模式：调用 PUT 接口
      const submitData = {
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

      api.put('/health/' + that.data.editId, submitData).then(function() {
        wx.showToast({ title: '更新成功', icon: 'success' });
        setTimeout(function() {
          wx.navigateBack();
        }, 1500);
      }).catch(function(err) {
        console.error('更新失败:', err);
        wx.showToast({ title: '更新失败', icon: 'none' });
      }).finally(function() {
        that.setData({ loading: false });
      });
    } else {
      // 新增模式：调用 POST 接口
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

      api.post('/health', submitData).then(function() {
        // 埋点：添加健康记录成功
        const recordType = currentType === 'vaccine' ? 'vaccine'
          : currentType === 'deworm' ? 'deworm'
          : 'other';
        analytics.healthAdd(recordType);

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
    }
  },
});
