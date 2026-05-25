const api = require('../../utils/api');
const sentry = require('../../utils/sentry');

Page({
  data: {
    planName: '',
    planDesc: '',
    planIcon: '',
    planIconBg: '',
    tier: '',
    period: 'yearly',
    periodText: '年付',
    totalAmount: '0.00',
    nextBillingDate: '',
    loading: false,
  },

  onLoad(options) {
    this.setData({ loading: true });

    // 监控：添加支付成功页面导航面包屑
    sentry.addBreadcrumb('navigation', 'payment_success');

    if (options.period) {
      this.setData({ 
        period: options.period,
        periodText: options.period === 'monthly' ? '月付' : '年付'
      });
    }
    
    if (options.tier) {
      this.setData({ tier: options.tier });
      this.loadPlanInfo(options.tier);
      this.upgradeSubscription(options.tier);
    }
    
    this.calculateNextBillingDate();
  },

  loadPlanInfo(tier) {
    const plans = {
      free: {
        name: '免费版',
        desc: '3只宠物 · 基础功能',
        icon: '🔷',
        iconBg: '#E8F5E9',
        monthlyAmount: '0.00',
        yearlyAmount: '0.00',
      },
      basic: {
        name: '基础版',
        desc: '100只宠物 · 数据导出 · 优先提醒',
        icon: '⭐',
        iconBg: '#E3F2FD',
        monthlyAmount: '49.00',
        yearlyAmount: '39.00',
      },
      pro: {
        name: 'Pro 专业版',
        desc: '无限宠物 · 血统证书 · 专属客服',
        icon: '💎',
        iconBg: '#FFE4E8',
        monthlyAmount: '149.00',
        yearlyAmount: '119.00',
      },
    };

    const planInfo = plans[tier] || plans.pro;
    const period = this.data.period;
    // 月付显示月价，年付显示年总价（月价×12）
    const amount = period === 'monthly' ? planInfo.monthlyAmount : (parseFloat(planInfo.yearlyAmount) * 12).toFixed(2);
    
    this.setData({
      planName: planInfo.name,
      planDesc: planInfo.desc,
      planIcon: planInfo.icon,
      planIconBg: planInfo.iconBg,
      totalAmount: amount,
    });
  },

  async upgradeSubscription(tier) {
    try {
      await api.post('/subscriptions/upgrade', { tier: tier });
      const userInfo = await api.get('/auth/profile');
      if (userInfo) {
        getApp().globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
      }
    } catch (err) {
      console.error('升级订阅失败:', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  calculateNextBillingDate() {
    const now = new Date();
    const period = this.data.period;
    let nextDate;
    
    if (period === 'monthly') {
      nextDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    } else {
      nextDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    }
    
    const year = nextDate.getFullYear();
    const month = nextDate.getMonth() + 1;
    const day = nextDate.getDate();
    
    this.setData({
      nextBillingDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goInvite() {
    wx.navigateTo({ url: '/pages/invite/invite' });
  },

  goStartUsing() {
    wx.switchTab({ url: '/pages/index/index' });
  },
});
