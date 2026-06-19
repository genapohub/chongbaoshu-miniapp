var api = require('../../utils/api');
var get = api.get;
var post = api.post;
var put = api.put;

Page({
  data: {
    id: null,
    form: {
      buyer_name: '',
      buyer_wechat: '',
      buyer_phone: '',
      budget: '',
      notes: '',
      pet_id: null
    },
    saving: false,
    pets: []
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadLead(options.id);
    }
    this.loadPets();
  },

  loadPets: function () {
    var that = this;
    get('/pets').then(function (res) {
      if (res.code === 0) {
        that.setData({ pets: res.data.list });
      }
    });
  },

  loadLead: function (id) {
    var that = this;
    get('/buyer-leads/' + id).then(function (res) {
      if (res.code === 0) {
        var d = res.data;
        that.setData({
          form: {
            buyer_name: d.buyer_name || '',
            buyer_wechat: d.buyer_wechat || '',
            buyer_phone: d.buyer_phone || '',
            budget: d.budget || '',
            notes: d.notes || '',
            pet_id: d.pet_id || null
          }
        });
      }
    });
  },

  onInput: function (e) {
    var field = e.currentTarget.dataset.field;
    var obj = {};
    obj['form.' + field] = e.detail.value;
    this.setData(obj);
  },

  save: function () {
    var that = this;
    var form = this.data.form;

    if (!form.buyer_name.trim()) {
      wx.showToast({ title: '请输入买家名称', icon: 'none' });
      return;
    }

    this.setData({ saving: true });

    var url = this.data.id
      ? '/buyer-leads/' + this.data.id
      : '/buyer-leads';

    var method = this.data.id ? put : post;

    method(url, {
      buyer_name: form.buyer_name,
      buyer_wechat: form.buyer_wechat || null,
      buyer_phone: form.buyer_phone || null,
      budget: form.budget || null,
      notes: form.notes || null,
      pet_id: form.pet_id || null
    }).then(function () {
      wx.showToast({ title: '已保存', icon: 'success' });
      setTimeout(function () {
        wx.navigateBack();
      }, 500);
    }).catch(function () {
      wx.showToast({ title: '保存失败', icon: 'none' });
      that.setData({ saving: false });
    });
  }
});
