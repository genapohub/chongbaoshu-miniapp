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
    success: false,
    errorMessage: '',
    rewardDays: 0,
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
      inviteCode: e.detail.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      errorMessage: '',
    })
  },

  /** 粘贴邀请码 */
  async onPasteCode() {
    try {
      const clipData = await wx.getClipboardData()
      if (clipData.data) {
        const code = clipData.data.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6)
        this.setData({ inviteCode: code, errorMessage: '' })
      }
    } catch (err) {
      // 剪贴板读取失败，忽略
    }
  },

  /** 兑换邀请码 */
  async onRedeem() {
    const { inviteCode } = this.data

    if (!inviteCode || inviteCode.length < 6) {
      this.setData({ errorMessage: '请输入6位邀请码' })
      return
    }

    this.setData({ loading: true, errorMessage: '' })

    try {
      const res = await api.post('/invite/redeem', { code: inviteCode })

      if (res.code === 0) {
        this.setData({
          success: true,
          rewardDays: res.data.reward_days || 7,
        })
      } else {
        this.setData({ errorMessage: res.message || '兑换失败' })
      }
    } catch (err) {
      this.setData({ errorMessage: '网络异常，请稍后重试' })
    } finally {
      this.setData({ loading: false })
    }
  },

  /** 返回首页 */
  onGoHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },
})
