const api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    phone: '',
    code: '',
    counting: false,
    countdown: 60,
    canLogin: false,
    loading: false,
  },

  goBack() {
    wx.navigateBack();
  },

  // 手机号输入
  onPhoneInput(e) {
    const phone = e.detail.value;
    this.setData({ phone });
    this.checkCanLogin();
  },

  // 验证码输入
  onCodeInput(e) {
    const code = e.detail.value;
    this.setData({ code });
    this.checkCanLogin();
  },

  // 检查是否可以登录
  checkCanLogin() {
    const { phone, code } = this.data;
    const canLogin = phone.length === 11 && code.length === 6;
    this.setData({ canLogin });
  },

  // 发送验证码
  sendCode() {
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

    // 发送验证码
    this.sendVerificationCode(phone);
  },

  // 发送验证码API
  async sendVerificationCode(phone) {
    try {
      wx.showLoading({ title: '发送中...', mask: true });

      await api.post('/auth/send-code', { phone });

      wx.showToast({ title: '验证码已发送', icon: 'success' });

      // 开始倒计时
      this.startCountdown();
    } catch (err) {
      console.error('发送验证码失败:', err);
      wx.showToast({
        title: err.message || '发送失败，请重试',
        icon: 'none',
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 开始倒计时
  startCountdown() {
    this.setData({
      counting: true,
      countdown: 60,
    });

    const timer = setInterval(() => {
      const countdown = this.data.countdown - 1;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({
          counting: false,
          countdown: 60,
        });
      } else {
        this.setData({ countdown });
      }
    }, 1000);
  },

  // 登录
  async onLogin() {
    if (!this.data.canLogin || this.data.loading) return;

    const { phone, code } = this.data;

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }

    if (code.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      // 调用后端登录接口
      const res = await api.post('/auth/phone-login', { phone, code });

      // 保存token
      if (res.token) {
        wx.setStorageSync('token', res.token);
        app.globalData.token = res.token;
      }

      // 保存用户信息
      if (res.user) {
        wx.setStorageSync('userInfo', res.user);
        app.globalData.userInfo = res.user;
      }

      // 登录成功提示
      if (res.isNew) {
        wx.showToast({ title: '欢迎加入宠宝树！', icon: 'success' });
      } else {
        wx.showToast({ title: '登录成功', icon: 'success' });
      }

      // 跳转首页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1000);
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({
        title: err.message || '登录失败，请重试',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },
});
