/**
 * P1 工作台首页 (Tab-首页)
 * 结构：升级引导条 → 订阅状态卡片 → 数据概览 → 待办提醒 → 快捷入口 → 最近动态
 */
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const { daysFromNow } = require('../../utils/auth');
const analytics = require('../../utils/analytics');

/**
 * 相对时间格式化（"刚刚"、"5分钟前"、"昨天"等）
 */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const date = new Date(dateStr);
  const diff = now - date.getTime();
  if (diff < 0) return '刚刚';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return minutes + '分钟前';
  if (hours < 24) return hours + '小时前';
  if (days === 1) return '昨天';
  if (days < 7) return days + '天前';
  // 超过7天显示具体日期
  return constants.formatDate(dateStr);
}

/**
 * 格式化提醒日期文案（如"今天"、"明天"、"3天后"、"12月25日"）
 */
function formatReminderDate(dateStr) {
  if (!dateStr) return '';
  const days = daysFromNow(dateStr);
  if (days === 0 || days === 0) return '今天';
  if (days === 1) return '明天';
  if (days > 1 && days <= 7) return days + '天后';
  if (days < 0) return '已过期' + Math.abs(days) + '天';
  // 超过7天显示具体日期
  const d = new Date(dateStr);
  return (d.getMonth() + 1) + '月' + d.getDate() + '日';
}

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
    reminders: [],
    recentActivities: [],
    loading: true,
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
      that.setData({ loading: false, userInfo: null });
      return;
    }

    that.setData({ userInfo: app.globalData.userInfo });

    Promise.all([
      api.get('/auth/dashboard').catch(function() { return null; }),
      api.get('/subscriptions/usage').catch(function() { return null; }),
      api.get('/auth/limits').catch(function() { return null; }),
    ]).then(function(results) {
      const dashboard = results[0];
      const usage = results[1];
      const limits = results[2];

      const tier = usage && usage.tier ? usage.tier : 'free';
      const planNames = { free: '免费版', basic: '基础版', pro: 'Pro版' };

      // ===== 构建待办提醒 =====
      const upcomingReminders = dashboard && dashboard.upcomingReminders ? dashboard.upcomingReminders : [];
      const healthReminders = [];
      for (let i = 0; i < upcomingReminders.length; i++) {
        const r = upcomingReminders[i];
        const days = daysFromNow(r.next_date);
        let color, badge, badgeBg, badgeColor;

        if (days <= 0) {
          color = '#EB5757';
          badge = '已过期';
          badgeBg = '#FDE8EC';
          badgeColor = '#EB5757';
        } else if (days <= 3) {
          color = '#F2994A';
          badge = '即将到期';
          badgeBg = '#FFF3E0';
          badgeColor = '#F2994A';
        } else {
          color = '#2D9CDB';
          badge = '计划中';
          badgeBg = '#E3F2FD';
          badgeColor = '#2D9CDB';
        }

        const typeConfig = constants.HEALTH_TYPE[r.type] || constants.HEALTH_TYPE.other;
        const vaccineType = r.vaccine_type ? '(' + r.vaccine_type + ')' : '';
        const dateHint = formatReminderDate(r.next_date);

        healthReminders.push({
          id: r.id,
          icon: typeConfig.icon,
          petName: r.pet_name || '宠物',
          typeText: typeConfig.label + vaccineType,
          dateHint: dateHint,
          color: color,
          badge: badge,
          badgeBg: badgeBg,
          badgeColor: badgeColor,
          priority: days <= 0 ? 0 : (days <= 3 ? 1 : 2),
          targetType: 'health',
        });
      }

      const dueBreedings = dashboard && dashboard.dueBreedings ? dashboard.dueBreedings : [];
      const dueReminders = [];
      for (let j = 0; j < dueBreedings.length; j++) {
        const r = dueBreedings[j];
        const days = daysFromNow(r.due_date);
        let badge, badgeColor, badgeBg, color;

        if (days < 0) {
          badge = '已过预产期';
          badgeColor = '#EB5757';
          badgeBg = '#FDE8EC';
          color = '#EB5757';
        } else if (days === 0) {
          badge = '今天预产';
          badgeColor = '#E94560';
          badgeBg = '#FDE8EC';
          color = '#E94560';
        } else if (days <= 3) {
          badge = '即将分娩';
          badgeColor = '#9B51E0';
          badgeBg = '#F3E5F5';
          color = '#9B51E0';
        } else {
          badge = '待产中';
          badgeColor = '#9B51E0';
          badgeBg = '#F3E5F5';
          color = '#9B51E0';
        }

        const dateHint = formatReminderDate(r.due_date);

        dueReminders.push({
          id: 'due-' + r.id,
          icon: '🤰',
          petName: r.mother_name || '母犬',
          typeText: '预产期',
          dateHint: dateHint,
          color: color,
          badge: badge,
          badgeBg: badgeBg,
          badgeColor: badgeColor,
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
        let icon = '📋';
        if (act.text.indexOf('宠物') !== -1) {
          icon = '🐾';
        } else if (act.text.indexOf('疫苗') !== -1) {
          icon = '💉';
        } else if (act.text.indexOf('驱虫') !== -1) {
          icon = '💊';
        } else if (act.text.indexOf('配种') !== -1) {
          icon = '💕';
        } else if (act.text.indexOf('健康') !== -1) {
          icon = '🏥';
        }

        formattedActivities.push({
          text: act.text,
          time: timeAgo(act.time),
          icon: icon,
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

  // 跳转登录
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  // 跳转添加宠物
  goAddPet() {
    wx.navigateTo({ url: '/pages/pet-add/pet-add' });
  },

  // 跳转添加配种
  goAddBreeding() {
    wx.navigateTo({ url: '/pages/breeding-add/breeding-add' });
  },

  // 跳转健康记录
  goAddHealth() {
    wx.navigateTo({ url: '/pages/health-add/health-add' });
  },

  // 跳转血统证书（Pro功能）
  goPedigree() {
    wx.navigateTo({ url: '/pages/pedigree/pedigree' });
  },

  // 跳转订阅
  goSubscription() {
    wx.navigateTo({ url: '/pages/plan-select/plan-select' });
  },

  // 提醒项点击
  onReminderTap(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    if (item.targetType === 'health') {
      wx.navigateTo({ url: '/pages/health-add/health-add?editId=' + item.id });
    } else if (item.targetType === 'breeding') {
      wx.navigateTo({ url: '/pages/breeding-detail/breeding-detail?id=' + (item.targetId || item.id.replace('due-', '')) });
    }
  },
});
