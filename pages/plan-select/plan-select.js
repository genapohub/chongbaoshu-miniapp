const api = require('../../utils/api');
const constants = require('../../utils/constants');
const analytics = require('../../utils/analytics');
const app = getApp();

Page({
  data: {
    currentTier: 'free',
    selectedTier: 'pro',
    plans: [],
    features: constants.PLAN_FEATURES,
  },

  onLoad(options) {
    const plans = ['free', 'basic', 'pro'].map(function(tier) {
      const p = constants.PLAN_DETAILS[tier];
      return {
        tier: tier,
        name: p.name,
        desc: p.desc,
        icon: p.icon,
        iconBg: p.iconBg,
        price: String(p.monthlyPrice),
        yearlyPrice: String(p.yearlyPrice),
        yearlySave: String(p.yearlySave),
        isPopular: p.isPopular || false,
      };
    });
    this.setData({ plans: plans });

    if (options && options.tier) {
      this.setData({ selectedTier: options.tier });
    }
    this.loadCurrentTier();
  },

  onShow() {
    // 埋点：进入付费页面
    const userInfo = app.globalData.userInfo || {};
    const currentPlan = userInfo.subscription_tier || this.data.currentTier || 'free';
    analytics.payEntry('upgrade', currentPlan);
  },

  async loadCurrentTier() {
    try {
      const res = await api.get('/auth/limits');
      if (res && res.tier) {
        this.setData({ currentTier: res.tier });
      }
    } catch (err) {
      console.error('加载订阅等级失败:', err);
    }
  },

  selectPlan(e) {
    const tier = e.currentTarget.dataset.tier;
    this.setData({ selectedTier: tier });

    // 埋点：选择套餐
    const planInfo = constants.PLAN_DETAILS[tier] || {};
    analytics.payPlanSelect(tier, planInfo.name || tier, String(planInfo.monthlyPrice || 0));
  },

  confirmChange() {
    if (!this.data.selectedTier || this.data.selectedTier === this.data.currentTier) {
      return;
    }
    wx.navigateTo({ 
      url: `/pages/payment-confirm/payment-confirm?tier=${this.data.selectedTier}` 
    });
  },

  goBack() {
    wx.navigateBack();
  },
});
