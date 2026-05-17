/**
 * P15 登录引导页 - 按设计稿一比一复刻
 */
const app = getApp();

Page({
  data: {
    loading: false,
  },

  async onWxLogin() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const { user, isNew } = await app.login();

      if (isNew) {
        wx.showToast({ title: '欢迎加入宠宝树！', icon: 'success' });
      } else {
        wx.showToast({ title: '登录成功', icon: 'success' });
      }

      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1000);
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onPhoneLogin() {
    wx.navigateTo({ url: '/pages/phone-login/phone-login' });
  },

  skipLogin() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});