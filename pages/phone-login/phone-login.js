const api = require('../../utils/api');
const analytics = require('../../utils/analytics');
const app = getApp();

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
    const baseUrl = app.globalData.baseUrl;
    const isDev = baseUrl.indexOf('localhost') !== -1;
    this.setData({ devMode: isDev });
  },

  goBack: function() {
    wx.navigateBack();
  },

  onPhoneInput: function(e) {
    const phone = e.detail.value;
    this.setData({ phone: phone });
    this.checkCanLogin();
  },

  onCodeInput: function(e) {
    const code = e.detail.value;
    this.setData({ code: code });
    this.checkCanLogin();
  },

  checkCanLogin: function() {
    const phone = this.data.phone;
    const code = this.data.code;
    const canLogin = phone.length === 11 && code.length === 6;
    this.setData({ canLogin: canLogin });
  },

  sendCode: function() {
    if (this.data.counting) return;

    const phone = this.data.phone.trim();
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
    const that = this;
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
    const that = this;
    that.setData({
      counting: true,
      countdown: 60,
    });

    // 将 timer 挂载到页面实例，确保 onUnload 可清理
    that._timer = setInterval(function() {
      const countdown = that.data.countdown - 1;
      if (countdown <= 0) {
        clearInterval(that._timer);
        that._timer = null;
        that.setData({
          counting: false,
          countdown: 60,
        });
      } else {
        that.setData({ countdown: countdown });
      }
    }, 1000);
  },

  onUnload: function() {
    // 页面卸载时清理倒计时定时器，防止内存泄漏
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  },

  onLogin: function() {
    const that = this;
    if (!that.data.canLogin || that.data.loading) return;

    const phone = that.data.phone;
    const code = that.data.code;

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }

    if (code.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }

    that.setData({ loading: true });

    // 埋点：手机号授权步骤
    analytics.registerPhoneAuth();

    api.post('/auth/phone-login', { phone: phone, code: code }).then(function(res) {
      if (res.token) {
        wx.setStorageSync('token', res.token);
        app.globalData.token = res.token;
      }

      if (res.user) {
        wx.setStorageSync('userInfo', res.user);
        app.globalData.userInfo = res.user;
      }

      // 埋点：手机号登录成功
      const isNew = res.isNew || false;
      analytics.registerSuccess('phone', isNew);

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
