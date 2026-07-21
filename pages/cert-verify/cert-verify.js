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
    // 使用公开接口，无需Token（通过 api.js 自动处理环境切换）
    get(`/certificates/public/${certNo}`, null, { auth: false })
      .then((data) => {
        this.setData({ cert: data, loading: false });
      })
      .catch((err) => {
        this.setData({ error: err.message || '证书不存在或已撤销', loading: false });
      });
  },
});
