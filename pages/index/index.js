/**
 * P1 工作台首页 (Tab-首页) - 按设计稿一比一复刻
 * 结构：升级引导条 → 订阅状态卡片 → 数据概览 → 今日提醒 → 快捷入口 → 最近动态
 */
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const { formatDate, daysFromNow } = require('../../utils/auth');

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
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    try {
      const app = getApp();
      if (!app.globalData.token) {
        this.setData({ loading: false, userInfo: null });
        return;
      }

      this.setData({ userInfo: app.globalData.userInfo });

      // 并行请求
      const [dashboard, usage, limits] = await Promise.all([
        api.get('/auth/dashboard').catch(() => null),
        api.get('/subscriptions/usage').catch(() => null),
        api.get('/auth/limits').catch(() => null),
      ]);

      // 订阅信息
      const tier = usage?.tier || 'free';
      const planNames = { free: '免费版', basic: '基础版', pro: 'Pro版' };

      // 处理提醒数据（按紧急度排序）
      const healthReminders = (dashboard?.data?.upcomingReminders || []).map(r => {
        const days = daysFromNow(r.next_date);
        let color, badge, badgeBg, badgeColor;
        
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

        return {
          id: r.id,
          text: `${r.pet_name || '宠物'} - ${r.type === 'vaccine' ? '疫苗' : r.type === 'deworm' ? '驱虫' : '健康'}${r.vaccine_type ? `(${r.vaccine_type})` : ''}`,
          color,
          badge,
          badgeBg,
          badgeColor,
          priority: days <= 0 ? 0 : days <= 3 ? 1 : 2,
        };
      });

      // 预产期提醒
      const dueReminders = (dashboard?.data?.dueBreedings || []).map(r => {
        const days = daysFromNow(r.due_date);
        return {
          id: `due-${r.id}`,
          text: `${r.mother_name || '母犬'} - 预产期还剩${days}天`,
          color: '#9B51E0',
          badge: '预产期',
          badgeBg: '#F3E5F5',
          badgeColor: '#9B51E0',
          priority: 3,
        };
      });

      // 合并并排序提醒
      const allReminders = [...healthReminders, ...dueReminders].sort((a, b) => a.priority - b.priority);

      // 最近动态（模拟数据）
      const activities = [
        { text: '豆豆的疫苗记录已更新', time: '2小时前' },
        { text: '新增配种记录：小白 × 大黄', time: '昨天' },
      ];

      this.setData({
        subscriptionTier: tier,
        subscriptionPlan: planNames[tier],
        petCount: usage?.usage?.petCount || 0,
        maxPets: limits?.limits?.maxPets || 3,
        breedingCount: usage?.usage?.breedingCount || 0,
        maxBreedingRecords: limits?.limits?.maxBreedingRecords || 3,
        breedingInProgressCount: dashboard?.data?.stats?.breedingCount || 0,
        reminderCount: allReminders.length,
        reminders: allReminders.slice(0, 4),
        recentActivities: activities,
        loading: false,
      });
    } catch (err) {
      console.error('首页加载失败:', err);
      this.setData({ loading: false });
    }
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
    wx.navigateTo({ url: '/pages/subscription/subscription' });
  },
});