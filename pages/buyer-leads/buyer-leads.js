const app = getApp();
const { get, post, put, del } = require('../../utils/api');

Page({
  data: {
    leads: [],
    currentTab: 'all',
    loading: true,
  },

  onShow() {
    this.loadLeads();
  },

  loadLeads() {
    this.setData({ loading: true });
    const status = this.data.currentTab === 'all' ? '' : this.data.currentTab;
    get(`/buyer-leads?status=${status}`).then(res => {
      if (res.code === 0) {
        this.setData({ leads: res.data.list, loading: false });
      }
    }).catch(() => this.setData({ loading: false }));
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab }, () => this.loadLeads());
  },

  quickFollow(e) {
    const id = e.currentTarget.dataset.id;
    put(`/buyer-leads/${id}/follow`, {}).then(() => {
      wx.showToast({ title: '已记录跟进', icon: 'success' });
      this.loadLeads();
    });
  },

  markSold(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/sales/sales?lead_id=${id}` });
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/buyer-lead-add/buyer-lead-add' });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/buyer-lead-add/buyer-lead-add?id=${id}` });
  },

  statusLabel(s) {
    const map = { consulting: '咨询中', visited: '已看宠', negotiating: '议价中', sold: '已成交', lost: '已流失' };
    return map[s] || s;
  },

  timeAgo(t) {
    if (!t) return '';
    const diff = Date.now() - new Date(t).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  },
});
