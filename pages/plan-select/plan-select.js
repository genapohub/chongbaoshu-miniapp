const api = require('../../utils/api');

Page({
  data: {
    currentTier: 'free',
    selectedTier: 'pro',
    plans: [
      {
        tier: 'free',
        name: '免费版',
        desc: '3只宠物 · 基础功能',
        icon: '🔷',
        iconBg: '#F3F4F6',
        price: '0'
      },
      {
        tier: 'basic',
        name: '基础版',
        desc: '100只宠物 · 数据导出',
        icon: '⭐',
        iconBg: '#E3F2FD',
        price: '49',
        yearlyPrice: '39',
        yearlySave: '120'
      },
      {
        tier: 'pro',
        name: 'Pro 专业版',
        desc: '无限宠物 · 血统证书',
        icon: '💎',
        iconBg: '#FFE4E8',
        price: '149',
        yearlyPrice: '119',
        yearlySave: '360',
        isPopular: true
      },
    ],
    features: [
      { name: '宠物数量', free: '3只', basic: '100只', pro: '无限' },
      { name: '照片/宠物', free: '3张', basic: '10张', pro: '20张' },
      { name: '配种记录', free: '3条', basic: '无限', pro: '无限' },
      { name: '健康档案', free: '✓', basic: '✓', pro: '✓' },
      { name: '数据导出', free: '✗', basic: '✓', pro: '✓' },
      { name: '血统证书', free: '✗', basic: '✗', pro: '✓' },
      { name: '近亲检测', free: '✗', basic: '✓', pro: '✓' },
      { name: '优先提醒', free: '✗', basic: '✓', pro: '✓' },
      { name: '专属客服', free: '✗', basic: '✗', pro: '✓' },
    ]
  },

  onLoad(options) {
    if (options && options.tier) {
      this.setData({ selectedTier: options.tier });
    }
    this.loadCurrentTier();
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
