const api = require('../../utils/api');

Page({
  data: {
    settings: {
      remind_vaccine: true,
      remind_deworm: true,
      remind_due: true,
      remind_vaccine_days: 7,
      remind_deworm_days: 7,
      remind_due_days: 7,
      notify_in_app: true,
      notify_wechat: false,
    },
    vaccineDaysOptions: [3, 7, 14, 30],
    dewormDaysOptions: [3, 5, 7],
    dueDaysOptions: [3, 7, 14],
    showVaccineDaysPicker: false,
    showDewormDaysPicker: false,
    showDueDaysPicker: false,
    pickerTitle: '',
    pickerOptions: [],
    pickerField: '',
    pickerCurrentValue: 0,
  },

  onLoad() {
    this.loadSettings();
  },

  async loadSettings() {
    try {
      const res = await api.get('/auth/profile');
      this.setData({
        settings: {
          remind_vaccine: res.remind_vaccine !== false,
          remind_deworm: res.remind_deworm !== false,
          remind_due: res.remind_due !== false,
          remind_vaccine_days: res.remind_vaccine_days || 7,
          remind_deworm_days: res.remind_deworm_days || 7,
          remind_due_days: res.remind_due_days || 7,
          notify_in_app: res.notify_in_app !== false,
          notify_wechat: res.notify_wechat === true,
        }
      });
    } catch (err) {
      console.error('加载设置失败:', err);
    }
  },

  async onSwitchChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`settings.${field}`]: value });
    try {
      await api.put('/auth/profile', { [field]: value });
    } catch (err) {
      this.setData({ [`settings.${field}`]: !value });
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  showDaysPicker(e) {
    const type = e.currentTarget.dataset.type;
    let title = '';
    let options = [];
    let field = '';
    let currentValue = 0;

    if (type === 'vaccine') {
      title = '疫苗提前提醒天数';
      options = this.data.vaccineDaysOptions;
      field = 'remind_vaccine_days';
      currentValue = this.data.settings.remind_vaccine_days;
    } else if (type === 'deworm') {
      title = '驱虫提前提醒天数';
      options = this.data.dewormDaysOptions;
      field = 'remind_deworm_days';
      currentValue = this.data.settings.remind_deworm_days;
    } else if (type === 'due') {
      title = '配种提前提醒天数';
      options = this.data.dueDaysOptions;
      field = 'remind_due_days';
      currentValue = this.data.settings.remind_due_days;
    }

    this.setData({
      pickerTitle: title,
      pickerOptions: options,
      pickerField: field,
      pickerCurrentValue: currentValue,
    });
  },

  hideDaysPicker() {
    this.setData({
      pickerTitle: '',
      pickerOptions: [],
      pickerField: '',
      pickerCurrentValue: 0,
    });
  },

  stopPropagation() {},

  async selectDays(e) {
    const value = Number(e.currentTarget.dataset.value);
    const field = this.data.pickerField;

    this.setData({
      [`settings.${field}`]: value,
      pickerTitle: '',
      pickerOptions: [],
      pickerField: '',
      pickerCurrentValue: 0,
    });

    try {
      await api.put('/auth/profile', { [field]: value });
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },
});
