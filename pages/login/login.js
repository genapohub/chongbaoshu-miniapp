/**
 * P15 登录引导页 - 按设计稿一比一复刻
 */
var app = getApp();

Page({
  data: {
    loading: false,
  },

  onWxLogin: function() {
    var that = this;
    if (that.data.loading) return;
    that.setData({ loading: true });

    app.login().then(function(result) {
      var user = result.user;
      var isNew = result.isNew;

      if (isNew) {
        wx.showToast({ title: '欢迎加入宠宝树！', icon: 'success' });
      } else {
        wx.showToast({ title: '登录成功', icon: 'success' });
      }

      setTimeout(function() {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1000);
    }).catch(function(err) {
      console.error('登录失败:', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    }).finally(function() {
      that.setData({ loading: false });
    });
  },

  onPhoneLogin: function() {
    wx.navigateTo({ url: '/pages/phone-login/phone-login' });
  },

  skipLogin: function() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  openTerms: function() {
    wx.navigateTo({ url: '/pages/webview/webview?type=terms' });
  },

  openPrivacy: function() {
    wx.navigateTo({ url: '/pages/webview/webview?type=privacy' });
  },
});