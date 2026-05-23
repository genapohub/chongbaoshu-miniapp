const api = require('../../utils/api');

Page({
  data: {
    currentTier: 'free',
    currentPlan: { name: '免费版', icon: '🔷' },
    selectedTier: '',
    isDowngrade: false,
    isUpgrade: false,
    availablePlans: [],
    allPlans: {
      free: {
        tier: 'free',
        name: '免费版',
        desc: '3只宠物 · 基础功能',
        icon: '🔷',
        iconBg: '#F3F4F6',
      },
      basic: {
        tier: 'basic',
        name: '基础版',
        desc: '100只宠物 · 数据导出',
        icon: '⭐',
        iconBg: '#E3F2FD',
      },
      pro: {
        tier: 'pro',
        name: 'Pro 专业版',
        desc: '无限宠物 · 血统证书',
        icon: '💎',
        iconBg: '#FFE4E8',
      },
    },
  },

  onLoad(options) {
    if (options && options.tier) {
      this.setData({ selectedTier: options.tier });
    }
    this.loadCurrentTier();
  },

  async loadCurrentTier() {
    try {
      const profile = await api.get('/auth/profile').catch(() => null);
      
      if (profile && profile.subscription_tier) {
        const currentTier = profile.subscription_tier;
        const validTiers = ['free', 'basic', 'pro'];
        if (!validTiers.includes(currentTier)) {
          return;
        }
        const planIcons = {
          free: '🔷',
          basic: '⭐',
          pro: '💎',
        };
        
        const planNames = {
          free: '免费版',
          basic: '基础版',
          pro: 'Pro 专业版',
        };

        this.setData({
          currentTier: currentTier,
          currentPlan: { name: planNames[currentTier] || '免费版', icon: planIcons[currentTier] },
        });
      }
    } catch (err) {
      // 加载失败，使用默认 free 等级
    } finally {
      this.updateAvailablePlans();
    }
  },

  updateAvailablePlans() {
    const { currentTier, allPlans } = this.data;
    const tierOrder = ['free', 'basic', 'pro'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    const availablePlans = tierOrder
      .filter(tier => tier !== currentTier)
      .map(tier => {
        const plan = allPlans[tier];
        const newIndex = tierOrder.indexOf(tier);
        return {
          ...plan,
          isDowngrade: newIndex < currentIndex,
          tagType: newIndex < currentIndex ? 'downgrade' : 'upgrade',
          tagText: newIndex < currentIndex ? '降级' : '升级',
        };
      });
    
    this.setData({ availablePlans });
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
    const tierNames = {
      free: '免费版',
      basic: '基础版',
      pro: 'Pro 专业版',
    };
    wx.showToast({ title: '已选择: ' + tierNames[tier], icon: 'none' });
  },

  getTagType(tier) {
    const tierOrder = ['free', 'basic', 'pro'];
    const currentIndex = tierOrder.indexOf(this.data.currentTier);
    const newIndex = tierOrder.indexOf(tier);
    return newIndex < currentIndex ? 'downgrade' : 'upgrade';
  },

  getTagText(tier) {
    const tierOrder = ['free', 'basic', 'pro'];
    const currentIndex = tierOrder.indexOf(this.data.currentTier);
    const newIndex = tierOrder.indexOf(tier);
    return newIndex < currentIndex ? '降级' : '升级';
  },

  goBack() {
    wx.navigateBack();
  },

  confirmChange() {
    const { selectedTier, currentTier } = this.data;
    
    if (!selectedTier || selectedTier === currentTier) {
      return;
    }

    wx.showModal({
      title: this.data.isDowngrade ? '确认降级' : '确认升级',
      content: this.data.isDowngrade 
        ? '降级将在当前周期结束后生效，确定继续吗？' 
        : '升级将立即生效，确定继续吗？',
      confirmText: '确认',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ 
            url: `/pages/payment-confirm/payment-confirm?tier=${selectedTier}` 
          });
        }
      },
    });
  },
});
