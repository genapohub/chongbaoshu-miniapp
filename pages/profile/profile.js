/**
 * P21 我的页面 - 按设计稿一比一复刻
 */
var api = require('../../utils/api');

Page({
  data: {
    userInfo: {},
    displayAvatar: '',
    displayName: '',
    stats: {
      petCount: 0,
      breedingCount: 0,
      inviteCount: 0,
    },
    subscriptionPlan: '免费版',
    expireDate: '',
    isAutoRenew: false,
    loading: false,
  },

  onShow: function() {
    this.loadProfile();
  },

  loadProfile: function() {
    var that = this;
    var app = getApp();

    that.setData({ loading: true });

    if (!app.globalData.token) {
      that.setData({ loading: false });
      return;
    }

    Promise.all([
      api.get('/auth/profile').catch(function() { return null; }),
      api.get('/subscriptions/current').catch(function() { return null; }),
      api.get('/auth/dashboard').catch(function() { return null; }),
      api.get('/invite/stats').catch(function() { return null; }),
    ]).then(function(results) {
      var profile = results[0];
      var subscription = results[1];
      var dashboard = results[2];
      var inviteStats = results[3];

      var planNames = { free: '免费版', basic: '基础版', pro: 'Pro 专业版' };
      var tier = subscription && subscription.tier ? subscription.tier : 'free';

      var userInfo = {};
      if (app.globalData.userInfo) {
        userInfo = app.globalData.userInfo;
      }
      if (profile) {
        userInfo = Object.assign({}, userInfo, profile);
      }

      var petCount = 0;
      if (dashboard && dashboard.stats && dashboard.stats.petCount) {
        petCount = dashboard.stats.petCount;
      }

      var breedingCount = 0;
      if (dashboard && dashboard.stats && dashboard.stats.breedingCount) {
        breedingCount = dashboard.stats.breedingCount;
      }

      var inviteCount = 0;
      if (inviteStats && inviteStats.inviteCount) {
        inviteCount = inviteStats.inviteCount;
      }

      var expireDate = '';
      if (subscription && subscription.expires_at) {
        expireDate = subscription.expires_at.split('T')[0];
      }

      var isAutoRenew = true;
      if (subscription && subscription.auto_renew === false) {
        isAutoRenew = false;
      }

      var baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      var kennelLogo = userInfo.kennel_logo;
      if (kennelLogo && !kennelLogo.startsWith('http')) {
        kennelLogo = baseUrl + kennelLogo;
      }
      var avatarUrl = userInfo.avatar_url;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = baseUrl + avatarUrl;
      }
      var displayAvatar = kennelLogo || avatarUrl || '';
      var displayName = userInfo.kennel_name || userInfo.nickname || '';

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
      that.setData({ loading: false });
    });
  },

  goMenu: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({ url: url });
  },

  goSubscription: function() {
    wx.navigateTo({ url: '/pages/subscription/subscription' });
  },

  goFeedback: function() {
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
    var that = this;
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
});