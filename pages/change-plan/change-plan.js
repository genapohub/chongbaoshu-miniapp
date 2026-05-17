const api = require('../../utils/api');
const { SUBSCRIPTION_PLANS, SUBSCRIPTION_TIER } = require('../../utils/constants');

Page({
  data: {
    currentTier: 'free',
    currentPlan: { name: '免费版' },
    selectedTier: null,
    isDowngrade: false,
    isUpgrade: false,
    plans: [
      {
        tier: 'free',
        name: '免费版',
        desc: '3只宠物 · 基础功能',
        icon: '🆓',
        iconBg: '#E8F5E9',
        amountLabel: '免费',
        amountColor: '#2E7D32',
      },
      {
        tier: 'basic',
        name: 'Basic',
        desc: '100只宠物 · 数据导出',
        icon: '⭐',
        iconBg: '#E3F2FD',
        amountLabel: '¥49/月',
        amountColor: '#1976D2',
      },
      {
        tier: 'pro',
        name: 'Pro 专业版',
        desc: '无限宠物 · 全部功能',
        icon: '💎',
        iconBg: '#FFF3E0',
        amountLabel: '¥149/月',
        amountColor: '#E94560',
      },
    ],
  },

  onLoad() {
    this.loadCurrentTier();
  },

  async loadCurrentTier() {
    try {
      const res = await api.get('/auth/limits');
      if (res && res.tier) {
        const currentTier = res.tier;
        const planInfo = SUBSCRIPTION_PLANS[currentTier] || SUBSCRIPTION_PLANS.free;
        
        this.setData({
          currentTier: currentTier,
          currentPlan: { name: planInfo.name },
        });
      }
    } catch (err) {
      console.error('加载订阅等级失败:', err);
    }
  },

  selectPlan(e) {
    const tier = e.currentTarget.dataset.tier;
    if (tier === this.data.currentTier) {
      return;
    }
    
    const tierOrder = ['free', 'basic', 'pro'];
    const currentIndex = tierOrder.indexOf(this.data.currentTier);
    const newIndex = tierOrder.indexOf(tier);
    
    this.setData({
      selectedTier: tier,
      isDowngrade: newIndex < currentIndex,
      isUpgrade: newIndex > currentIndex,
    });
  },

  confirmChange() {
    const { selectedTier, currentTier, isUpgrade } = this.data;
    
    if (!selectedTier || selectedTier === currentTier) {
      return;
    }

    const confirmText = isUpgrade ? '确认升级' : '确认降级';
    const content = isUpgrade 
      ? '升级将立即生效，是否确认？' 
      : '降级将在当前周期结束后生效，是否确认？';

    wx.showModal({
      title: confirmText,
      content: content,
      confirmText: '确认',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          await this.performChange();
        }
      },
    });
  },

  async performChange() {
    try {
      wx.showLoading({ title: '处理中...' });
      
      await api.post('/subscriptions/upgrade', { tier: this.data.selectedTier });
      
      wx.showToast({ title: '变更成功', icon: 'success' });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('变更失败:', err);
      wx.showToast({ title: err.message || '变更失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },
});
