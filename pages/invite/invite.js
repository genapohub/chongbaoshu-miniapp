/**
 * 邀请好友页 - 逻辑
 * 功能：展示邀请码、邀请统计、邀请记录列表
 */
const api = require('../../utils/api')
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

  /** 获取邀请码 */
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

  /** 获取邀请统计 */
  async loadStats() {
    try {
      const res = await api.get('/invite/stats')
      this.setData({ stats: res })
    } catch (err) {
      console.error('获取统计失败', err)
    }
  },

  /** 获取邀请记录 */
  async loadRecords() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      const res = await api.get('/invite/records', {
        page: this.data.page,
        pageSize: this.data.pageSize,
      })
      const newRecords = res.list || []
      this.setData({
        records: this.data.page === 1 ? newRecords : [...this.data.records, ...newRecords],
        total: res.total,
        page: this.data.page + 1,
        hasMore: newRecords.length >= this.data.pageSize,
      })
    } catch (err) {
      console.error('获取记录失败', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  /** 复制邀请码 */
  onCopyCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        wx.showToast({ title: '邀请码已复制', icon: 'success' })
      },
    })
  },

  /** 分享邀请 */
  onShareAppMessage() {
    return {
      title: `我在用宠宝树管理宠物，输入邀请码 ${this.data.inviteCode} 即可获得7天Pro体验`,
      path: `/pages/invite-redeem/invite-redeem?code=${this.data.inviteCode}`,
    }
  },

  /** 跳转兑换页 */
  onGoRedeem() {
    wx.navigateTo({ url: '/pages/invite-redeem/invite-redeem' })
  },
})
