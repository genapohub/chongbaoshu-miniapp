/**
 * 邀请码兑换页 - 逻辑
 * 功能：输入邀请码兑换，双方各得7天Pro
 */
const api = require('../../utils/api')
const app = getApp()

Page({
  data: {
    inviteCode: '',
    loading: false,
    status: 'input', // input/success/error
    errorMessage: '',
    rewardDays: 7,
  },

  onLoad(options) {
    // 从分享链接带入的邀请码
    if (options.code) {
      this.setData({ inviteCode: options.code.toUpperCase() })
    }
  },

  /** 输入邀请码 */
  onCodeInput(e) {
    this.setData({
      inviteCode: e.detail.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8),
      errorMessage: '',
      status: 'input',
    })
  },

  /** 粘贴邀请码 */
  async onPasteCode() {
    try {
      const clipData = await wx.getClipboardData()
      if (clipData.data) {
        const code = clipData.data.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8)
        this.setData({ inviteCode: code, errorMessage: '', status: 'input' })
      }
    } catch (err) {
      // 剪贴板读取失败，忽略
    }
  },

  /** 兑换邀请码 */
  async onRedeem() {
    const { inviteCode } = this.data

    if (!inviteCode || inviteCode.length !== 8) {
      this.setData({ errorMessage: '请输入8位邀请码' })
      return
    }

    this.setData({ loading: true, errorMessage: '' })

    try {
      const res = await api.post('/invite/redeem', { code: inviteCode })
      this.setData({
        success: true,
        status: 'success',
        rewardDays: res.reward_days || 7,
      })
    } catch (err) {
      const msg = err.message || '邀请码无效'
      this.setData({
        errorMessage: msg,
        status: 'error',
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /** 返回首页 */
  onGoHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  /** 重新输入 */
  onReInput() {
    this.setData({
      inviteCode: '',
      status: 'input',
      errorMessage: '',
    })
  },
})
