var api = require('../../utils/api');
var app = getApp();

Page({
  data: {
    phone: '',
    code: '',
    counting: false,
    countdown: 60,
    canLogin: false,
    loading: false,
    devMode: false,
  },

  onLoad: function() {
    // 开发环境下显示快捷登录提示
    var baseUrl = app.globalData.baseUrl;
    var isDev = baseUrl.indexOf('localhost') !== -1;
    this.setData({ devMode: isDev });
  },

  goBack: function() {
    wx.navigateBack();
  },

  onPhoneInput: function(e) {
    var phone = e.detail.value;
    this.setData({ phone: phone });
    this.checkCanLogin();
  },

  onCodeInput: function(e) {
    var code = e.detail.value;
    this.setData({ code: code });
    this.checkCanLogin();
  },

  checkCanLogin: function() {
    var phone = this.data.phone;
    var code = this.data.code;
    var canLogin = phone.length === 11 && code.length === 6;
    this.setData({ canLogin: canLogin });
  },

  sendCode: function() {
    if (this.data.counting) return;

    var phone = this.data.phone.trim();
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }

    this.sendVerificationCode(phone);
  },

  sendVerificationCode: function(phone) {
    var that = this;
    wx.showLoading({ title: '发送中...', mask: true });

    api.post('/auth/send-code', { phone: phone }).then(function() {
      wx.showToast({ title: '验证码已发送', icon: 'success' });
      that.startCountdown();
    }).catch(function(err) {
      console.error('发送验证码失败:', err);
      wx.showToast({
        title: err.message || '发送失败，请重试',
        icon: 'none',
      });
    }).finally(function() {
      wx.hideLoading();
    });
  },

  startCountdown: function() {
    var that = this;
    that.setData({
      counting: true,
      countdown: 60,
    });

    var timer = setInterval(function() {
      var countdown = that.data.countdown - 1;
      if (countdown <= 0) {
        clearInterval(timer);
        that.setData({
          counting: false,
          countdown: 60,
        });
      } else {
        that.setData({ countdown: countdown });
      }
    }, 1000);
  },

  onLogin: function() {
    var that = this;
    if (!that.data.canLogin || that.data.loading) return;

    var phone = that.data.phone;
    var code = that.data.code;

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }

    if (code.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }

    that.setData({ loading: true });

    api.post('/auth/phone-login', { phone: phone, code: code }).then(function(res) {
      if (res.token) {
        wx.setStorageSync('token', res.token);
        app.globalData.token = res.token;
      }

      if (res.user) {
        wx.setStorageSync('userInfo', res.user);
        app.globalData.userInfo = res.user;
      }

      if (res.isNew) {
        wx.showToast({ title: '欢迎加入宠宝树！', icon: 'success' });
      } else {
        wx.showToast({ title: '登录成功', icon: 'success' });
      }

      setTimeout(function() {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1000);
    }).catch(function(err) {
      console.error('登录失败:', err);
      wx.showToast({
        title: err.message || '登录失败，请重试',
        icon: 'none',
      });
    }).finally(function() {
      that.setData({ loading: false });
    });
  },

  openTerms: function() {
    wx.navigateTo({ url: '/pages/webview/webview?type=terms' });
  },

  openPrivacy: function() {
    wx.navigateTo({ url: '/pages/webview/webview?type=privacy' });
  },
});
