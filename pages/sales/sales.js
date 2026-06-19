const app = getApp();
const { get, post } = require('../../utils/api');

Page({
  data: {
    sales: [],
    summary: null,
    loading: true,
  },

  onLoad(options) {
    this.setData({ leadId: options.lead_id || null });
    this.loadData();
  },

  loadData() {
    this.setData({ loading: true });
    Promise.all([
      get('/pet-sales'),
      get('/pet-sales/summary'),
    ]).then(([salesRes, summaryRes]) => {
      this.setData({
        sales: salesRes.code === 0 ? salesRes.data.list : [],
        summary: summaryRes.code === 0 ? summaryRes.data : null,
        loading: false,
      });
    }).catch(() => this.setData({ loading: false }));
  },
});
