/**
 * P21 我的页面 - 按设计稿一比一复刻
 */
const api = require('../../utils/api');

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

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    const app = getApp();
    if (!app.globalData.token) return;

    try {
      const [profile, subscription, dashboard, inviteStats] = await Promise.all([
        api.get('/auth/profile').catch(() => null),
        api.get('/subscriptions/current').catch(() => null),
        api.get('/auth/dashboard').catch(() => null),
        api.get('/invite/stats').catch(() => null),
      ]);

      // 订阅信息
      const planNames = { free: '免费版', basic: '基础版', pro: 'Pro 专业版' };
      const tier = subscription?.tier || 'free';

      this.setData({
        userInfo: profile?.data || app.globalData.userInfo,
        stats: {
          petCount: dashboard?.data?.stats?.petCount || 0,
          breedingCount: dashboard?.data?.stats?.breedingCount || 0,
          inviteCount: inviteStats?.inviteCount || 0,
        },
        subscriptionPlan: planNames[tier],
        expireDate: subscription?.expires_at ? subscription.expires_at.split('T')[0] : '',
        isAutoRenew: subscription?.auto_renew !== false,
      });
    } catch (err) {
      console.error('加载个人信息失败:', err);
    }
  },

  // 跳转菜单
  goMenu(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  // 跳转订阅
  goSubscription() {
    wx.navigateTo({ url: '/pages/subscription/subscription' });
  },

  // 意见反馈
  goFeedback() {
    wx.showToast({ title: '意见反馈功能开发中', icon: 'none' });
  },

  // 关于宠宝树
  goAbout() {
    wx.showModal({
      title: '关于宠宝树',
      content: '宠宝树 v1.0\n专业宠物繁育管理工具',
      showCancel: false,
    });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      success: (res) => {
        if (res.confirm) {
          getApp().logout();
        }
      },
    });
  },
});