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
      var msg = '登录失败，请重试';
      if (err && err.errMsg) {
        if (err.errMsg.indexOf('cancel') !== -1) msg = '微信授权已取消';
        else if (err.errMsg.indexOf('deny') !== -1) msg = '微信授权被拒绝';
        else if (err.errMsg.indexOf('network') !== -1) msg = '网络不可用，请检查连接';
        else if (err.errMsg.indexOf('timeout') !== -1) msg = '请求超时，请重试';
      } else if (err && err.message) {
        if (err.message.indexOf('Network') !== -1) msg = '网络不可用，请检查连接';
        else if (err.message.indexOf('500') !== -1) msg = '服务器繁忙，请稍后重试';
      }
      console.error('登录失败:', err);
      sentry.captureException(err, { flow: 'register' });
      wx.showToast({ title: msg, icon: 'none', duration: 2500 });
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
    wx.navigateTo({ url: '/pages/agreement/agreement?type=user-agreement' });
  },

  openPrivacy: function() {
    wx.navigateTo({ url: '/pages/agreement/agreement?type=privacy-policy' });
  },
});