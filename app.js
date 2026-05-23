/**
 * 宠宝树V1.0 小程序入口
 */
App({
  onLaunch() {
    // 恢复之前的登录态
    this.checkLogin();
  },

  globalData: {
    userInfo: null,
    token: null,
    // 根据小程序环境自动切换 API 地址
    // 正式版/体验版 → 生产域名，开发版 → 本地调试
    baseUrl: __wxConfig && __wxConfig.envVersion !== 'develop'
      ? 'https://api.chongbaoshu.com/api'
      : 'http://localhost:3001/api',
  },

  /**
   * 检查本地登录态
   */
  checkLogin() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      // 获取用户信息
      this.getUserInfo();
    }
  },

  /**
   * 微信登录
   */
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: `${this.globalData.baseUrl}/auth/wx-login`,
              method: 'POST',
              data: { code: res.code },
              success: (response) => {
                if (response.data.code === 0) {
                  const { token, user, isNew } = response.data.data;
                  this.globalData.token = token;
                  this.globalData.userInfo = user;
                  wx.setStorageSync('token', token);
                  wx.setStorageSync('userInfo', user);
                  resolve({ user, isNew });
                } else {
                  reject(new Error(response.data.message));
                }
              },
              fail: (err) => reject(err),
            });
          } else {
            reject(new Error('微信登录失败'));
          }
        },
        fail: (err) => reject(err),
      });
    });
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    wx.request({
      url: `${this.globalData.baseUrl}/auth/profile`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${this.globalData.token}`,
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.globalData.userInfo = res.data.data;
          wx.setStorageSync('userInfo', res.data.data);
        }
      },
    });
  },

  /**
   * 退出登录
   */
  logout() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    wx.reLaunch({ url: '/pages/login/login' });
  },
});
