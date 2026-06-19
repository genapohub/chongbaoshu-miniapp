const app = getApp();

Page({
  data: { current: 0 },

  onSwiperChange(e) {
    this.setData({ current: e.detail.current });
  },

  next() {
    this.setData({ current: this.data.current + 1 });
  },

  skip() {
    this.finish();
  },

  start() {
    this.finish();
  },

  finish() {
    wx.setStorageSync('onboarding_done', true);
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
