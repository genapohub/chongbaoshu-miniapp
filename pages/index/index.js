/**
 * P1 工作台首页 (Tab-首页) - 按设计稿一比一复刻
 * 结构：升级引导条 → 订阅状态卡片 → 数据概览 → 今日提醒 → 快捷入口 → 最近动态
 */
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const { daysFromNow } = require('../../utils/auth');

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

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
  },

  loadData() {
    var that = this;
    var app = getApp();
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
      var dashboard = results[0];
      var usage = results[1];
      var limits = results[2];

      var tier = usage && usage.tier ? usage.tier : 'free';
      var planNames = { free: '免费版', basic: '基础版', pro: 'Pro版' };

      var upcomingReminders = dashboard && dashboard.data && dashboard.data.upcomingReminders ? dashboard.data.upcomingReminders : [];
      var healthReminders = [];
      for (var i = 0; i < upcomingReminders.length; i++) {
        var r = upcomingReminders[i];
        var days = daysFromNow(r.next_date);
        var color, badge, badgeBg, badgeColor;
        
        if (days <= 0) {
          color = '#EB5757';
          badge = '过期';
          badgeBg = '#FDE8EC';
          badgeColor = '#EB5757';
        } else if (days <= 3) {
          color = '#F2994A';
          badge = '即将到期';
          badgeBg = '#FFF3E0';
          badgeColor = '#F2994A';
        } else {
          color = '#2D9CDB';
          badge = '计划';
          badgeBg = '#E3F2FD';
          badgeColor = '#2D9CDB';
        }

        var typeText = '健康';
        if (r.type === 'vaccine') {
          typeText = '疫苗';
        } else if (r.type === 'deworm') {
          typeText = '驱虫';
        }
        var vaccineType = r.vaccine_type ? '(' + r.vaccine_type + ')' : '';

        healthReminders.push({
          id: r.id,
          text: (r.pet_name || '宠物') + ' - ' + typeText + vaccineType,
          color: color,
          badge: badge,
          badgeBg: badgeBg,
          badgeColor: badgeColor,
          priority: days <= 0 ? 0 : (days <= 3 ? 1 : 2),
        });
      }

      var dueBreedings = dashboard && dashboard.data && dashboard.data.dueBreedings ? dashboard.data.dueBreedings : [];
      var dueReminders = [];
      for (var j = 0; j < dueBreedings.length; j++) {
        var r = dueBreedings[j];
        var days = daysFromNow(r.due_date);
        dueReminders.push({
          id: 'due-' + r.id,
          text: (r.mother_name || '母犬') + ' - 预产期还剩' + days + '天',
          color: '#9B51E0',
          badge: '预产期',
          badgeBg: '#F3E5F5',
          badgeColor: '#9B51E0',
          priority: 3,
        });
      }

      var allReminders = healthReminders.concat(dueReminders);
      allReminders.sort(function(a, b) {
        return a.priority - b.priority;
      });

      var activities = dashboard && dashboard.data && dashboard.data.recentActivities
        ? dashboard.data.recentActivities
        : [];

      function formatLimit(value) {
        if (value === 'unlimited' || value >= 999999) {
          return '无限';
        }
        return value;
      }

      var petCount = usage && usage.usage && usage.usage.petCount ? usage.usage.petCount : 0;
      var maxPets = limits && limits.maxPets ? formatLimit(limits.maxPets) : 3;
      var breedingCount = usage && usage.usage && usage.usage.breedingCount ? usage.usage.breedingCount : 0;
      var maxBreedingRecords = limits && limits.maxBreedingRecords ? formatLimit(limits.maxBreedingRecords) : 3;
      var breedingInProgressCount = dashboard && dashboard.data && dashboard.data.stats && dashboard.data.stats.breedingCount ? dashboard.data.stats.breedingCount : 0;

      that.setData({
        subscriptionTier: tier,
        subscriptionPlan: planNames[tier],
        petCount: petCount,
        maxPets: maxPets,
        breedingCount: breedingCount,
        maxBreedingRecords: maxBreedingRecords,
        breedingInProgressCount: breedingInProgressCount,
        reminderCount: allReminders.length,
        reminders: allReminders.slice(0, 4),
        recentActivities: activities,
        loading: false,
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
});