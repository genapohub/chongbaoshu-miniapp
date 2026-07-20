/**
 * 宠宝树V1.0 小程序入口
 */
const sentry = require('./utils/sentry');
const analytics = require('./utils/analytics');

App({
  onLaunch() {
    // 初始化 Sentry SDK
    sentry.init({ dsn: '', release: '1.1.0' });

    // 恢复之前的登录态
    this.checkLogin();
    // 首次启动显示引导页
    if (!wx.getStorageSync("onboarding_done")) {
      wx.reLaunch({ url: "/pages/onboarding/onboarding" });
      return;
    }
  },

  globalData: {
    userInfo: null,
    token: null,
    prevPagePath: '',
    // 根据小程序环境自动切换 API 地址
    // 正式版/体验版 → 云托管域名，开发版 → 本地
    // 部署后请将 YOUR_CLOUDRUN_DOMAIN 替换为实际的云托管域名
    // 格式示例: https://service-xxx-xxx.gz.apigw.tencentcs.com
    baseUrl: __wxConfig && __wxConfig.envVersion !== 'develop'
      ? 'https://YOUR_CLOUDRUN_DOMAIN/api'
      : 'http://localhost:8081/api',
    staticBaseUrl: __wxConfig && __wxConfig.envVersion !== 'develop'
      ? 'https://YOUR_CLOUDRUN_DOMAIN'
      : 'http://localhost:8081',
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

                  // 监控：关联 Sentry 用户上下文
                  sentry.setUser(user.id, {
                    openid: user.openid || '',
                    nickname: user.nickname || '',
                  });

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
          const user = res.data.data;
          this.globalData.userInfo = user;
          wx.setStorageSync('userInfo', user);

          // 监控：更新 Sentry 用户上下文
          if (user && user.id) {
            sentry.setUser(user.id, {
              openid: user.openid || '',
              nickname: user.nickname || '',
            });
          }
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

    // 监控：清除 Sentry 用户上下文
    sentry.setUser(null);

    wx.reLaunch({ url: '/pages/login/login' });
  },
});
