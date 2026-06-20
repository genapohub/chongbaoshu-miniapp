var api = require('../../utils/api');
var get = api.get;
var post = api.post;

Page({
  data: {
    litter: null,
    loading: true
  },

  onLoad: function (options) {
    if (!options.id) return;
    this.loadLitter(options.id);
  },

  loadLitter: function (id) {
    var that = this;
    this.setData({ loading: true });
    get('/litters/' + id).then(function (res) {
      if (res.code === 0) {
        that.setData({ litter: res.data, loading: false });
      } else {
        that.setData({ loading: false });
      }
    }).catch(function () {
      that.setData({ loading: false });
    });
  },

  batchAdd: function () {
    var that = this;
    var id = this.data.litter.id;
    post('/litters/' + id + '/puppies/batch', {}).then(function (res) {
      wx.showToast({ title: res.message || '已完成', icon: 'success' });
      that.loadLitter(id);
    }).catch(function () {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  goPetDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/pet-detail/pet-detail?id=' + id });
  }
});
