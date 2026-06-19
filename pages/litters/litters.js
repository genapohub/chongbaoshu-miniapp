var api = require('../../utils/api');
var get = api.get;
var post = api.post;

Page({
  data: {
    litters: [],
    loading: true,
    error: false
  },

  onShow: function () {
    this.loadLitters();
  },

  loadLitters: function () {
    var that = this;
    this.setData({ loading: true,
    error: false });
    get('/litters').then(function (res) {
      if (res.code === 0) {
        that.setData({ litters: res.data.list, loading: false });
      }
    }).catch(function () {
      that.setData({ error: true, loading: false });
    });
  },


  batchAdd: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    post('/litters/' + id + '/puppies/batch', {}).then(function (res) {
      wx.showToast({ title: res.message || '已完成', icon: 'success' });
      that.loadLitters();
    });
  }
});
