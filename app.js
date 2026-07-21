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
    // 微信云托管私有协议配置（无需配置服务器域名）
    // 开发版 → 本地，正式版/体验版 → 云托管
    isDev: __wxConfig && __wxConfig.envVersion === 'develop',
    baseUrl: __wxConfig && __wxConfig.envVersion !== 'develop'
      ? ''
      : 'http://localhost:8081/api',
    staticBaseUrl: __wxConfig && __wxConfig.envVersion !== 'develop'
      ? ''
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
            const api = require('./utils/api');
            api.post('/auth/wx-login', { code: res.code })
              .then((data) => {
                const { token, user, isNew } = data;
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
              })
              .catch((err) => reject(err));
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
    const api = require('./utils/api');
    api.get('/auth/profile')
      .then((user) => {
        this.globalData.userInfo = user;
        wx.setStorageSync('userInfo', user);

        // 监控：更新 Sentry 用户上下文
        if (user && user.id) {
          sentry.setUser(user.id, {
            openid: user.openid || '',
            nickname: user.nickname || '',
          });
        }
      })
      .catch(() => {});
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
