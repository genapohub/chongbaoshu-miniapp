/**
 * 邀请好友页 - 逻辑
 */
const api = require('../../utils/api')
const { formatDate, formatDateTime } = require('../../utils/constants')
const app = getApp()

Page({
  data: {
    inviteCode: '',
    inviteUrl: '',
    stats: {
      total_invites: 0,
      redeemed_invites: 0,
      rewarded_invites: 0,
      total_reward_days: 0,
    },
    records: [],
    page: 1,
    pageSize: 20,
    total: 0,
    loading: false,
    hasMore: true,
  },

  onLoad() {
    this.loadInviteCode()
    this.loadStats()
    this.loadRecords()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, records: [], hasMore: true })
    Promise.all([
      this.loadInviteCode(),
      this.loadStats(),
      this.loadRecords(),
    ]).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadRecords()
    }
  },

  async loadInviteCode() {
    try {
      const res = await api.get('/invite/code')
      this.setData({
        inviteCode: res.invite_code || '',
        inviteUrl: res.invite_url || '',
      })
    } catch (err) {
      console.error('获取邀请码失败', err)
    }
  },

  async loadStats() {
    try {
      const res = await api.get('/invite/stats')
      this.setData({ stats: res })
    } catch (err) {
      console.error('获取统计失败', err)
    }
  },

  async loadRecords() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const res = await api.get('/invite/records', {
        page: this.data.page,
        pageSize: this.data.pageSize,
      })
      const rawRecords = res.list || []
      const newRecords = rawRecords.map(function(item) {
        var nickname = item.invitee_nickname || '新用户'
        return {
          ...item,
          avatarText: nickname.charAt(0),
          formattedDate: formatDateTime(item.redeemed_at || item.created_at),
          statusBadge: item.status === 'redeemed' ? '已注册' : '待注册',
          statusClass: item.status === 'redeemed' ? 'badge-success' : 'badge-default',
        }
      })
      this.setData({
        records: this.data.page === 1 ? newRecords : [...this.data.records, ...newRecords],
        total: res.total,
        page: this.data.page + 1,
        hasMore: rawRecords.length >= this.data.pageSize,
      })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  onCopyCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        wx.showToast({ title: '邀请码已复制', icon: 'success' })
      },
    })
  },

  onShareAppMessage() {
    return {
      title: `我在用宠宝树管理宠物，输入邀请码 ${this.data.inviteCode} 即可获得7天Pro体验`,
      path: `/pages/invite-redeem/invite-redeem?code=${this.data.inviteCode}`,
    }
  },

  onGoRedeem() {
    wx.navigateTo({ url: '/pages/invite-redeem/invite-redeem' })
  },

  getFirstChar(str) {
    return str ? str.charAt(0) : '?';
  },

  getStatusBadge(status) {
    if (status === 'redeemed') {
      return '已注册';
    }
    return '待注册';
  },

  getStatusClass(status) {
    return status === 'redeemed' ? 'badge-success' : 'badge-default';
  },
})
