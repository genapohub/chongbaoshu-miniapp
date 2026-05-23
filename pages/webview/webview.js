Page({
  data: {
    url: '',
  },

  onLoad(options) {
    var type = options.type || 'terms';
    var urls = {
      terms: 'https://api.chongbaoshu.com/terms.html',
      privacy: 'https://api.chongbaoshu.com/privacy.html',
    };
    this.setData({
      url: urls[type] || urls.terms,
    });
    wx.setNavigationBarTitle({
      title: type === 'privacy' ? '隐私政策' : '用户协议',
    });
  },
});
