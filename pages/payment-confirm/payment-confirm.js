const api = require('../../utils/api');
const constants = require('../../utils/constants');

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
    loading: false,
  },

  onLoad(options) {
    this.setData({ period: 'yearly' });
    if (options.tier) {
      this.loadPlanInfo(options.tier);
    }
  },

  loadPlanInfo(tier) {
    const planInfo = constants.PLAN_DETAILS[tier] || constants.PLAN_DETAILS.pro;
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
    if (this.data.loading) return;
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意服务条款', icon: 'none' });
      return;
    }

    const { tier, period, totalAmount } = this.data;

    if (totalAmount === 0) {
      wx.redirectTo({
        url: `/pages/payment-success/payment-success?tier=${tier}&period=${period}`
      });
      return;
    }

    this.setData({ loading: true });
    wx.showLoading({ title: '支付中...', mask: true });

    api.post('/subscriptions/create-order', {
      tier: tier,
      period: period,
    }).then(function(orderRes) {
      wx.hideLoading();

      if (!orderRes || !orderRes.timeStamp) {
        wx.showToast({ title: '创建订单失败', icon: 'none' });
        return;
      }

      wx.requestPayment({
        timeStamp: orderRes.timeStamp,
        nonceStr: orderRes.nonceStr,
        package: orderRes.package,
        signType: orderRes.signType || 'MD5',
        paySign: orderRes.paySign,
        success: function() {
          wx.redirectTo({
            url: `/pages/payment-success/payment-success?tier=${tier}&period=${period}`
          });
        },
        fail: function(err) {
          if (err.errMsg && err.errMsg.indexOf('cancel') > -1) {
            wx.showToast({ title: '支付已取消', icon: 'none' });
          } else {
            wx.showToast({ title: '支付失败', icon: 'none' });
          }
        },
        complete: function() {
          this.setData({ loading: false });
        }.bind(this),
      });
    }.bind(this)).catch(function() {
      wx.hideLoading();
      wx.showToast({ title: '创建订单失败', icon: 'none' });
      this.setData({ loading: false });
    }.bind(this));
  },
});
