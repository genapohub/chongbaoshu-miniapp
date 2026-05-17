const api = require('../../utils/api');
const { SUBSCRIPTION_PLANS, formatDate } = require('../../utils/constants');

Page({
  data: {
    subscription: {
      planName: '免费版',
      billingCycle: 'monthly',
      startDate: '-',
      endDate: '-',
      autoRenew: false,
    },
    usage: {
      petCount: 0,
      maxPets: 3,
      petPercent: 0,
      breedingCount: 0,
      maxBreeding: 3,
      breedingPercent: 0,
      photoCount: 0,
      maxPhotos: 9,
      photoPercent: 0,
    },
    paymentHistory: [],
    loading: true,
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    this.setData({ loading: true });

    try {
      const profile = await api.get('/auth/profile').catch(() => null);
      const limits = await api.get('/auth/limits').catch(() => null);
      const paymentData = await api.get('/subscriptions/payments').catch(() => null);

      let startDate = '-';
      let endDate = '-';
      let autoRenew = false;
      let planName = '免费版';
      let billingCycle = 'monthly';

      if (profile) {
        const tier = profile.subscription_tier || 'free';
        const planInfo = SUBSCRIPTION_PLANS[tier] || SUBSCRIPTION_PLANS.free;
        planName = planInfo.name;

        if (profile.subscription_expire) {
          endDate = formatDate(profile.subscription_expire);
        }

        if (profile.created_at) {
          startDate = formatDate(profile.created_at);
        }

        if (tier !== 'free') {
          autoRenew = true;
        }
      }

      if (limits) {
        const maxPets = limits.max_pets === 'unlimited' ? '无限' : (limits.max_pets || 3);
        const maxBreeding = limits.limits?.maxBreedingRecords === 'unlimited' ? '无限' : (limits.limits?.maxBreedingRecords || 3);
        const maxPhotos = limits.limits?.maxPhotosPerPet === 'unlimited' ? '无限' : (limits.limits?.maxPhotosPerPet || 3);
        const petCount = limits.current_pets || 0;
        const petPercent = limits.max_pets === 'unlimited' ? 0 : (limits.max_pets > 0 ? Math.min(petCount / limits.max_pets * 100, 100) : 0);

        this.setData({
          subscription: {
            planName,
            billingCycle,
            startDate,
            endDate,
            autoRenew,
          },
          usage: {
            petCount,
            maxPets,
            petPercent,
            breedingCount: 0,
            maxBreeding,
            breedingPercent: 0,
            photoCount: 0,
            maxPhotos,
            photoPercent: 0,
          },
        });
      }

      if (paymentData) {
        const payments = paymentData.list || paymentData.payments || [];
        this.setData({
          paymentHistory: payments.map(p => ({
            id: p.id,
            planName: p.plan_name || '订阅',
            payDate: p.created_at ? formatDate(p.created_at) : '-',
            payMethod: p.payment_method || '微信支付',
            amount: p.amount || 0,
          })),
        });
      }
    } catch (err) {
      console.error('加载订阅数据失败:', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  goChangePlan() {
    wx.navigateTo({ url: '/pages/change-plan/change-plan' });
  },

  goCancelSubscription() {
    wx.navigateTo({ url: '/pages/cancel-subscription/cancel-subscription' });
  },
});
