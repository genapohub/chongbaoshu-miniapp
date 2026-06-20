/**
 * P21 我的页面 - 按设计稿一比一复刻
 */
const api = require('../../utils/api');

Page({
  data: {
    userInfo: {},
    displayAvatar: '',
    displayName: '',
    stats: {
      petCount: 0,
      breedingCount: 0,
      healthCount: 0,
    },
    subscriptionPlan: '免费版',
    expireDate: '',
    isAutoRenew: false,
    loading: false,
    showLoginGuide: false,
    isLoggedIn: false,
  },

  onShow: function() {
    this.loadProfile();
  },

  loadProfile: function() {
    const that = this;
    const app = getApp();

    that.setData({ loading: true,
    error: false });

    if (!app.globalData.token) {
      that.setData({ 
        loading: false,
        isLoggedIn: false,
      });
      return;
    }
    that.setData({ isLoggedIn: true });

    Promise.all([
      api.get('/auth/profile').catch(function() { return null; }),
      api.get('/subscriptions/current').catch(function() { return null; }),
      api.get('/auth/dashboard').catch(function() { return null; })
    ]).then(function(results) {
      const profile = results[0];
      const subscription = results[1];
      const dashboard = results[2];
      

      const planNames = { free: '免费版', basic: '基础版', pro: 'Pro 专业版' };
      const tier = subscription && subscription.tier ? subscription.tier : 'free';

      let userInfo = {};
      if (app.globalData.userInfo) {
        userInfo = app.globalData.userInfo;
      }
      if (profile) {
        userInfo = Object.assign({}, userInfo, profile);
      }

      let petCount = 0;
      if (dashboard && dashboard.stats && dashboard.stats.petCount) {
        petCount = dashboard.stats.petCount;
      }

      let breedingCount = 0;
      if (dashboard && dashboard.stats && dashboard.stats.breedingCount) {
        breedingCount = dashboard.stats.breedingCount;
      }

      let inviteCount = 0;
      if (inviteStats && inviteStats.inviteCount) {
        inviteCount = inviteStats.inviteCount;
      }

      let expireDate = '';
      if (subscription && subscription.expires_at) {
        expireDate = subscription.expires_at.split('T')[0];
      }

      let isAutoRenew = true;
      if (subscription && subscription.auto_renew === false) {
        isAutoRenew = false;
      }

      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      let kennelLogo = userInfo.kennel_logo;
      if (kennelLogo && !kennelLogo.startsWith('http')) {
        kennelLogo = baseUrl + kennelLogo;
      }
      let avatarUrl = userInfo.avatar_url;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = baseUrl + avatarUrl;
      }
      const displayAvatar = kennelLogo || avatarUrl || '';
      const displayName = userInfo.kennel_name || userInfo.phone || '';

      that.setData({
        userInfo: userInfo,
        displayAvatar: displayAvatar,
        displayName: displayName,
        stats: {
          petCount: petCount,
          breedingCount: breedingCount,
          inviteCount: inviteCount,
        },
        subscriptionPlan: planNames[tier],
        expireDate: expireDate,
        isAutoRenew: isAutoRenew,
        loading: false,
      });
    }).catch(function(err) {
      console.error('加载个人信息失败:', err);
      that.setData({ error: true, loading: false });
    });
  },

  goMenu: function(e) {
    const app = getApp();
    if (!app.globalData.token) {
      this.setData({ showLoginGuide: true });
      return;
    }
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url: url });
  },

  goSubscription: function() {
    const app = getApp();
    if (!app.globalData.token) {
      this.setData({ showLoginGuide: true });
      return;
    }
    wx.navigateTo({ url: '/pages/subscription/subscription' });
  },

  goFeedback: function() {
    const app = getApp();
    if (!app.globalData.token) {
      this.setData({ showLoginGuide: true });
      return;
    }
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  goAbout: function() {
    wx.showModal({
      title: '关于宠宝树',
      content: '宠宝树 v1.0\n专业宠物繁育管理工具',
      showCancel: false,
    });
  },

  onLogout: function() {
    const that = this;
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      success: function(res) {
        if (res.confirm) {
          getApp().logout();
        }
      },
    });
  },

  onHeaderTap: function() {
    if (!getApp().globalData.token) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
  },


  goLogin: function() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goLoginFromGuide: function() {
    this.setData({ showLoginGuide: false });
    wx.navigateTo({ url: '/pages/login/login' });
  },

  hideLoginGuide: function() {
    this.setData({ showLoginGuide: false });
  },

  stopPropagation: function() {},
});