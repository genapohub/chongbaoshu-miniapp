const api = require('../../utils/api');

Page({
  data: {
    plan: {
      name: '',
      desc: '',
      icon: '',
      iconBg: '',
    },
    period: 'yearly',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlySave: 0,
    totalAmount: 0,
    monthlyEquivalent: 0,
    agreed: false,
    tier: '',
  },

  onLoad(options) {
    this.setData({ period: 'yearly' });
    if (options.tier) {
      this.loadPlanInfo(options.tier);
    }
  },

  loadPlanInfo(tier) {
    const plans = {
      free: {
        name: '免费版',
        desc: '3只宠物 · 基础功能',
        icon: '🔷',
        iconBg: '#E8F5E9',
        monthlyPrice: 0,
        yearlyPrice: 0,
        yearlySave: 0,
      },
      basic: {
        name: '基础版',
        desc: '100只宠物 · 数据导出 · 优先提醒',
        icon: '⭐',
        iconBg: '#E3F2FD',
        monthlyPrice: 49,
        yearlyPrice: 39,
        yearlySave: 120,
      },
      pro: {
        name: 'Pro 专业版',
        desc: '无限宠物 · 血统证书 · 专属客服',
        icon: '💎',
        iconBg: '#FFE4E8',
        monthlyPrice: 149,
        yearlyPrice: 119,
        yearlySave: 360,
      },
    };

    const planInfo = plans[tier] || plans.pro;
    this.setData({
      plan: {
        name: planInfo.name,
        desc: planInfo.desc,
        icon: planInfo.icon,
        iconBg: planInfo.iconBg,
      },
      monthlyPrice: planInfo.monthlyPrice,
      yearlyPrice: planInfo.yearlyPrice,
      yearlySave: planInfo.yearlySave,
      tier: tier,
    });

    this.calculatePrice();
  },

  selectPeriod(e) {
    const period = e.currentTarget.dataset.period;
    this.setData({ period }, () => {
      this.calculatePrice();
    });
  },

  calculatePrice() {
    const { period, monthlyPrice, yearlyPrice, yearlySave } = this.data;
    let totalAmount, monthlyEquivalent;

    if (period === 'yearly') {
      totalAmount = yearlyPrice * 12 - (yearlySave || 0);
      monthlyEquivalent = yearlyPrice;
    } else {
      totalAmount = monthlyPrice;
      monthlyEquivalent = monthlyPrice;
    }

    this.setData({
      totalAmount: Math.max(0, Math.round(totalAmount)),
      monthlyEquivalent: Math.max(0, Math.round(monthlyEquivalent)),
    });
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  goBack() {
    wx.navigateBack();
  },

  confirmPay() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意服务条款', icon: 'none' });
      return;
    }

    // 直接跳转到支付成功页面
    wx.redirectTo({
      url: `/pages/payment-success/payment-success?tier=${this.data.tier}&period=${this.data.period}`
    });
  },
});
