const app = getApp();
const { get } = require('../../utils/api');

Page({
  data: { cert: null, loading: true, error: '' },

  onLoad(options) {
    const certNo = options.cert_no || options.cert_no;
    if (!certNo) {
      this.setData({ loading: false, error: '缺少证书编号' });
      return;
    }
    // 使用公开接口，无需Token
    wx.request({
      url: (app.globalData.baseUrl || 'http://localhost:3000/api') + `/certificates/public/${certNo}`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          this.setData({ cert: res.data.data, loading: false });
        } else {
          this.setData({ error: res.data.message || '证书不存在或已撤销', loading: false });
        }
      },
      fail: () => this.setData({ error: '网络请求失败', loading: false }),
    });
  },
});
