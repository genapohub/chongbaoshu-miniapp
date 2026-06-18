const api = require('../../utils/api');
const constants = require('../../utils/constants');
const analytics = require('../../utils/analytics');
const sentry = require('../../utils/sentry');

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

      // 埋点：确认支付页
      const planInfo = constants.PLAN_DETAILS[options.tier] || constants.PLAN_DETAILS.pro;
      analytics.payConfirm(options.tier, String(planInfo.yearlyPrice));
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

    const self = this;
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
          // 埋点：支付成功
          analytics.paySuccess(tier, String(period === 'yearly' ? self.data.yearlyPrice : self.data.monthlyPrice), 'wechat');

          wx.redirectTo({
            url: `/pages/payment-success/payment-success?tier=${tier}&period=${period}`
          });
        },
        fail: function(err) {
          // 埋点：支付失败
          const failReason = (err.errMsg && err.errMsg.indexOf('cancel') > -1)
            ? 'user_cancel'
            : 'pay_error';
          analytics.payFail(tier, failReason);

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
    }.bind(this)).catch(function(err) {
      wx.hideLoading();

      // 监控：捕获支付网络请求异常
      sentry.captureException(err, { flow: 'payment' });

      wx.showToast({ title: '创建订单失败', icon: 'none' });
      this.setData({ loading: false });
    }.bind(this));
  },
});
