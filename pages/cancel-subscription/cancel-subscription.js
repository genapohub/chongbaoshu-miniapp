const api = require('../../utils/api');

Page({
  data: {
    selectedReason: null,
    otherReason: '',
    expireDate: '',
    reasons: [
      { id: 'price', text: '价格太贵' },
      { id: 'function', text: '功能不满足需求' },
      { id: 'no_need', text: '不再需要' },
      { id: 'alternative', text: '找到替代品' },
      { id: 'other', text: '其他' },
    ],
  },

  onLoad() {
    this.calculateExpireDate();
  },

  calculateExpireDate() {
    // 根据订阅周期计算过期日期：月付+30天，年付+365天
    // 优先从全局数据获取订阅信息，默认按月付30天
    const app = getApp();
    const subscriptionCycle = (app.globalData && app.globalData.subscriptionCycle) || 'monthly';
    const days = subscriptionCycle === 'yearly' ? 365 : 30;

    const now = new Date();
    const expire = new Date(now);
    expire.setDate(expire.getDate() + days);
    
    const year = expire.getFullYear();
    const month = String(expire.getMonth() + 1).padStart(2, '0');
    const day = String(expire.getDate()).padStart(2, '0');
    
    this.setData({
      expireDate: `${year}-${month}-${day}`,
    });
  },

  selectReason(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedReason: id,
      otherReason: id === 'other' ? this.data.otherReason : '',
    });
    this.checkCanCancel();
  },

  onOtherReasonInput(e) {
    this.setData({
      otherReason: e.detail.value,
    });
    this.checkCanCancel();
  },

  checkCanCancel() {
    const { selectedReason, otherReason } = this.data;
    const canCancel = selectedReason && (selectedReason !== 'other' || otherReason.trim().length > 0);
    this.setData({ canCancel });
  },

  acceptOffer() {
    wx.showModal({
      title: '确认接受优惠',
      content: '接受优惠后将以8折价格续费年付Pro方案，是否继续？',
      confirmText: '确认',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          await this.performAcceptOffer();
        }
      },
    });
  },

  async performAcceptOffer() {
    try {
      wx.showLoading({ title: '处理中...' });
      
      // 模拟接受优惠
      wx.showToast({ title: '续费成功', icon: 'success' });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('续费失败:', err);
      wx.showToast({ title: '续费失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  confirmCancel() {
    if (!this.data.canCancel) {
      return;
    }

    wx.showModal({
      title: '确认取消自动续费',
      content: '取消后将在当前周期结束后降为免费版，是否确认？',
      confirmText: '确认取消',
      cancelText: '继续订阅',
      confirmColor: '#C62828',
      success: async (res) => {
        if (res.confirm) {
          await this.performCancel();
        }
      },
    });
  },

  async performCancel() {
    try {
      wx.showLoading({ title: '处理中...' });
      
      // 调用取消订阅API
      await api.put('/subscriptions/cancel');
      
      wx.showToast({ title: '取消成功', icon: 'success' });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('取消失败:', err);
      wx.showToast({ title: err.message || '取消失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },
});
