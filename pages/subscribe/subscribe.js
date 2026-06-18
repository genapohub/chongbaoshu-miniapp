const api = require('../../utils/api');

Page({
  data: {
    selectedPlan: 'pro',
    plans: [
      {
        tier: 'free',
        name: '免费版',
        desc: '3只宠物 · 基础功能',
        icon: 'paw',
        iconBg: '#F3F4F6',
        price: '0',
        period: '永久',
      },
      {
        tier: 'basic',
        name: '基础版',
        desc: '100只宠物 · 数据导出',
        icon: 'star',
        iconBg: '#E3F2FD',
        price: '49',
        period: '月',
      },
      {
        tier: 'pro',
        name: 'Pro 专业版',
        desc: '无限宠物 · 血统证书',
        icon: 'diamond',
        iconBg: '#FFE4E8',
        price: '119',
        period: '月',
      },
    ],
  },

  onLoad(options) {
    if (options && options.tier) {
      this.setData({ selectedPlan: options.tier });
    }
  },

  selectPlan(e) {
    const tier = e.currentTarget.dataset.tier;
    this.setData({ selectedPlan: tier });
    wx.showToast({ title: '已选择: ' + this.getPlanName(tier), icon: 'none' });
  },

  getPlanName(tier) {
    const names = {
      free: '免费版',
      basic: '基础版',
      pro: 'Pro 专业版',
    };
    return names[tier] || tier;
  },

  goPayment() {
    const { selectedPlan } = this.data;
    
    if (selectedPlan === 'free') {
      wx.showToast({ title: '免费版无需订阅', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/payment-confirm/payment-confirm?tier=${selectedPlan}`,
    });
  },
});
