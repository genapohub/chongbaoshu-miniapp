/**
 * P15 登录引导页 - 按设计稿一比一复刻
 */
const app = getApp();
const analytics = require('../../utils/analytics');
const sentry = require('../../utils/sentry');

Page({
  data: {
    loading: false,
  },

  onShow: function() {
    // 埋点：注册流程开始
    analytics.registerStart('wx_login');
  },

  onWxLogin: function() {
    const that = this;
    if (that.data.loading) return;
    that.setData({ loading: true });

    // 埋点：微信授权步骤
    analytics.registerWxAuth();

    app.login().then(function(result) {
      const user = result.user;
      const isNew = result.isNew;

      // 埋点：注册成功
      analytics.registerSuccess('wx', isNew);

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
      // 监控：捕获登录异常
      sentry.captureException(err, { flow: 'register' });
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