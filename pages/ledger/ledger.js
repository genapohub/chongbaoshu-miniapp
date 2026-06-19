const { get, post } = require('../../utils/api');

Page({
  data: { entries: [], summary: {}, tab: 'all', showAdd: false },
  onShow() { this.load(); },
  load() {
    const type = this.data.tab === 'all' ? '' : this.data.tab;
    Promise.all([
      get(`/api/ledger?entry_type=${type}`),
      get('/api/ledger/summary'),
    ]).then(([res1, res2]) => {
      this.setData({
        entries: res1.code === 0 ? res1.data.list : [],
        summary: res2.code === 0 ? res2.data : {},
      });
    });
  },
  switchTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }, () => this.load()); },
  goAdd() {
    wx.showActionSheet({
      itemList: ['记一笔收入', '记一笔支出'],
      success: (res) => {
        const type = res.tapIndex === 0 ? 'income' : 'expense';
        this.showForm(type);
      },
    });
  },
  showForm(type) {
    const categories = type === 'income'
      ? ['销售','寄养','配种服务','其他收入']
      : ['配种费','疫苗药品','狗粮','寄养费','兽医','用品','其他支出'];

    wx.showActionSheet({
      itemList: categories,
      success: (r) => {
        const cat = categories[r.tapIndex];
        this.recordEntry(type, cat);
      },
    });
  },
  recordEntry(type, cat) {
    wx.showModal({
      title: `${type==='income'?'收入':'支出'} - ${cat}`,
      editable: true,
      placeholderText: '输入金额（元）',
      success: (res) => {
        if (!res.confirm) return;
        const yuan = parseFloat(res.content);
        if (isNaN(yuan) || yuan <= 0) return;
        post('/api/ledger', {
          entry_type: type,
          category: cat,
          amount: Math.round(yuan * 100),
          entry_date: new Date().toISOString().split('T')[0],
        }).then(() => {
          wx.showToast({ title: '已记录', icon: 'success' });
          this.load();
        });
      },
    });
  },
});
