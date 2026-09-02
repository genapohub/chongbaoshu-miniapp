/**
 * P1 工作台首页 (Tab-首页)
 * 结构：升级引导条 → 订阅状态卡片 → 数据概览 → 待办提醒 → 快捷入口 → 最近动态
 */
const api = require('../../utils/api');
const constants = require('../../utils/constants'); // theme/HEALTH_TYPE for UI rendering
const { daysFromNow, formatReminderDate, timeAgo } = require('../../utils/auth');
const analytics = require('../../utils/analytics');

/** 健康记录类型 → 图标 emoji（首页待办提醒用） */
const HEALTH_EMOJI = { vaccine: '💉', deworm: '🐛', checkup: '🩺', illness: '🤒', other: '📋' };

Page({
  data: {
    userInfo: null,
    subscriptionTier: 'free',
    subscriptionPlan: '免费版',
    petCount: 0,
    maxPets: 3,
    breedingCount: 0,
    maxBreedingRecords: 3,
    breedingInProgressCount: 0,
    reminderCount: 0,
    error: false,
    reminders: [],
    recentActivities: [],
    loading: true,
    showLoginGuide: false,
  },

  /** 页面进入时的时间戳，用于计算停留时长 */
  _pageEnterTime: 0,

  onShow() {
    // 记录页面进入时间
    this._pageEnterTime = Date.now();

    // 页面浏览埋点
    const app = getApp();
    const currentPath = 'pages/index/index';
    const fromPath = app.globalData.prevPagePath || '';
    analytics.pageView(currentPath, fromPath);

    // 更新来源路径为当前页面，供下一个页面使用
    app.globalData.prevPagePath = currentPath;

    this.loadData();
  },

  onHide() {
    // 页面隐藏时更新 prevPagePath，下一个页面可用此作为来源
    const app = getApp();
    app.globalData.prevPagePath = 'pages/index/index';
  },

  onPullDownRefresh() {
    this.loadData();
  },

  loadData() {
    const that = this;
    const app = getApp();
    if (!app.globalData.token) {
      // 游客模式：显示登录引导而非静默空数据
      that.setData({
        loading: false,
        showLoginGuide: true,
        userInfo: null,
        petCount: 0,
        breedingInProgressCount: 0,
        reminderCount: 0,
        reminders: [],
        recentActivities: [],
      });
      return;
    }

    that.setData({ showLoginGuide: false, userInfo: app.globalData.userInfo });

    Promise.all([
      api.get('/auth/dashboard').catch(function() { return null; }),
      api.get('/subscriptions/usage').catch(function() { return null; }),
      api.get('/auth/limits').catch(function() { return null; }),
    ]).then(function(results) {
      const dashboard = results[0];
      const usage = results[1];
      const limits = results[2];

      // API 全部失败时显示错误状态与重试按钮
      if (!dashboard && !usage && !limits) {
        that.setData({ error: true, loading: false });
        return;
      }

      const tier = usage && usage.tier ? usage.tier : 'free';
      const planNames = { free: '免费版', basic: '基础版', pro: 'Pro版' };

      // ===== 构建待办提醒 =====
      const upcomingReminders = dashboard && dashboard.upcomingReminders ? dashboard.upcomingReminders : [];
      const healthReminders = [];
      for (let i = 0; i < upcomingReminders.length; i++) {
        const r = upcomingReminders[i];
        const days = daysFromNow(r.next_date);
        const status = days <= 0 ? 'overdue' : (days <= 3 ? 'soon' : 'scheduled');

        const typeConfig = constants.HEALTH_TYPE[r.type] || constants.HEALTH_TYPE.other;
        const vaccineType = r.vaccine_type ? '(' + r.vaccine_type + ')' : '';
        const dateHint = formatReminderDate(r.next_date);

        healthReminders.push({
          id: r.id,
          iconEmoji: HEALTH_EMOJI[r.type] || '📋',
          petName: r.pet_name || '宠物',
          typeText: typeConfig.label + vaccineType,
          dateHint: dateHint,
          status: status,
          priority: days <= 0 ? 0 : (days <= 3 ? 1 : 2),
          targetType: 'health',
        });
      }

      const dueBreedings = dashboard && dashboard.dueBreedings ? dashboard.dueBreedings : [];
      const dueReminders = [];
      for (let j = 0; j < dueBreedings.length; j++) {
        const r = dueBreedings[j];
        const days = daysFromNow(r.due_date);
        const status = days < 0 ? 'overdue' : (days <= 3 ? 'soon' : 'scheduled');

        const dateHint = formatReminderDate(r.due_date);

        dueReminders.push({
          id: 'due-' + r.id,
          iconEmoji: '🤰',
          petName: r.mother_name || '母犬',
          typeText: '预产期',
          dateHint: dateHint,
          status: status,
          priority: days <= 0 ? 0 : (days <= 3 ? 1 : 3),
          targetType: 'breeding',
          targetId: r.id,
        });
      }

      const allReminders = healthReminders.concat(dueReminders);
      allReminders.sort(function(a, b) {
        return a.priority - b.priority;
      });

      // ===== 构建最近动态 =====
      const activities = dashboard && dashboard.recentActivities
        ? dashboard.recentActivities
        : [];

      const formattedActivities = [];
      const activityLimit = Math.min(activities.length, 5);
      for (let k = 0; k < activityLimit; k++) {
        const act = activities[k];
        let icon = 'clipboard';
        let iconColor = '#948F89';
        if (act.text.indexOf('宠物') !== -1) {
          icon = 'paw';
          iconColor = '#4A8C5C';
        } else if (act.text.indexOf('疫苗') !== -1) {
          icon = 'syringe';
          iconColor = '#3D8B37';
        } else if (act.text.indexOf('驱虫') !== -1) {
          icon = 'bug';
          iconColor = '#D4914A';
        } else if (act.text.indexOf('配种') !== -1) {
          icon = 'heart';
          iconColor = '#D4534A';
        } else if (act.text.indexOf('健康') !== -1) {
          icon = 'activity-heart';
          iconColor = '#4A8C5C';
        }

        formattedActivities.push({
          key: 'act-' + k,
          text: act.text,
          time: timeAgo(act.time),
          icon: icon,
          iconColor: iconColor,
        });
      }

      function formatLimit(value) {
        if (value === 'unlimited' || value >= 999999) {
          return '无限';
        }
        return value;
      }

      const petCount = usage && usage.usage && usage.usage.petCount ? usage.usage.petCount : 0;
      const maxPets = limits && limits.maxPets ? formatLimit(limits.maxPets) : 3;
      const breedingCount = usage && usage.usage && usage.usage.breedingCount ? usage.usage.breedingCount : 0;
      const maxBreedingRecords = limits && limits.maxBreedingRecords ? formatLimit(limits.maxBreedingRecords) : 3;
      const breedingInProgressCount = dashboard && dashboard.stats && dashboard.stats.breedingCount ? dashboard.stats.breedingCount : 0;

      that.setData({
        subscriptionTier: tier,
        subscriptionPlan: planNames[tier],
        petCount: petCount,
        maxPets: maxPets,
        breedingCount: breedingCount,
        maxBreedingRecords: maxBreedingRecords,
        breedingInProgressCount: breedingInProgressCount,
        reminderCount: allReminders.length,
        reminders: allReminders.slice(0, 5),
        recentActivities: formattedActivities,
        loading: false,
      });

      // 设置用户属性到 Sentry scope（订阅等级、宠物数量等）
      analytics.setUserProperties({
        subscription_tier: tier,
        pet_count: String(petCount),
        breeding_count: String(breedingCount),
      });

      wx.stopPullDownRefresh();
    }).catch(function(err) {
      that.setData({ loading: false });
      wx.stopPullDownRefresh();
    });
  },

  // 检查是否登录，未登录时跳转到登录页
  requireLogin(callback) {
    const app = getApp();
    if (!app.globalData.token) {
      wx.showToast({ title: '请先登录', icon: 'none', duration: 1500 });
      setTimeout(function() {
        wx.navigateTo({ url: '/pages/login/login' });
      }, 800);
      return;
    }
    callback && callback();
  },

  // 阻止事件冒泡
  stopPropagation() {},

  // 跳转登录
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  // 跳转升级/订阅（免费版、基础版用户主动升级入口）
  goSubscribe() {
    wx.navigateTo({ url: '/pages/subscribe/subscribe' });
  },

  // 跳转添加宠物
  goAddPet() {
    this.requireLogin(function() {
      wx.navigateTo({ url: '/pages/pet-add/pet-add' });
    });
  },

  // 跳转添加配种
  goAddBreeding() {
    this.requireLogin(function() {
      wx.navigateTo({ url: '/pages/breeding-add/breeding-add' });
    });
  },

  // 跳转健康记录
  goAddHealth() {
    this.requireLogin(function() {
      wx.navigateTo({ url: '/pages/health-add/health-add' });
    });
  },

  // 跳转提醒设置
  goRemindSettings() {
    this.requireLogin(function() {
      wx.navigateTo({ url: '/pages/remind-settings/remind-settings' });
    });
  },

  // 跳转意向客户
  goBuyerLeads() {
    this.requireLogin(function() {
      wx.navigateTo({ url: '/pages/buyer-leads/buyer-leads' });
    });
  },

  // 跳转销售记录
  goSales() {
    this.requireLogin(function() {
      wx.navigateTo({ url: '/pages/sales/sales' });
    });
  },

  // 跳转收支账本
  goLedger() {
    this.requireLogin(function() {
      wx.navigateTo({ url: '/pages/ledger/ledger' });
    });
  },

  // 跳转同窝管理
  goLitters() {
    this.requireLogin(function() {
      wx.navigateTo({ url: '/pages/litters/litters' });
    });
  },

  // 提醒项点击
  onReminderTap(e) {
    const that = this;
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    that.requireLogin(function() {
      if (item.targetType === 'health') {
        wx.navigateTo({ url: '/pages/health-add/health-add?editId=' + item.id });
      } else if (item.targetType === 'breeding') {
        wx.navigateTo({ url: '/pages/breeding-detail/breeding-detail?id=' + (item.targetId || item.id.replace('due-', '')) });
      }
    });
  },
});
