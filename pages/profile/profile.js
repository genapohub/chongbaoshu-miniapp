/**
 * P21 我的页面 - 按设计稿一比一复刻
 */
var api = require('../../utils/api');

Page({
  data: {
    userInfo: null,
    stats: {
      petCount: 0,
      breedingCount: 0,
      inviteCount: 0,
    },
    subscriptionPlan: '免费版',
    expireDate: '',
    isAutoRenew: false,
  },

  onShow: function() {
    this.loadProfile();
  },

  loadProfile: function() {
    var that = this;
    var app = getApp();
    if (!app.globalData.token) return;

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

      var userInfo = app.globalData.userInfo;
      if (profile && profile.data) {
        userInfo = profile.data;
      }

      var petCount = 0;
      if (dashboard && dashboard.data && dashboard.data.stats && dashboard.data.stats.petCount) {
        petCount = dashboard.data.stats.petCount;
      }

      var breedingCount = 0;
      if (dashboard && dashboard.data && dashboard.data.stats && dashboard.data.stats.breedingCount) {
        breedingCount = dashboard.data.stats.breedingCount;
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

      that.setData({
        userInfo: userInfo,
        stats: {
          petCount: petCount,
          breedingCount: breedingCount,
          inviteCount: inviteCount,
        },
        subscriptionPlan: planNames[tier],
        expireDate: expireDate,
        isAutoRenew: isAutoRenew,
      });
    }).catch(function(err) {
      console.error('加载个人信息失败:', err);
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
    wx.showToast({ title: '意见反馈功能开发中', icon: 'none' });
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