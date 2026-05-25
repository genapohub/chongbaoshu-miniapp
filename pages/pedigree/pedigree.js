const api = require('../../utils/api');
const constants = require('../../utils/constants');
const analytics = require('../../utils/analytics');

Page({
  data: {
    pets: [],
    loading: false,
    isPro: false,
  },

  onLoad(options) {
    this.loadData();
  },

  loadData() {
    const that = this;
    that.setData({ loading: true });

    Promise.all([
      api.get('/pets').catch(() => ({ list: [] })),
      api.get('/auth/limits').catch(() => null),
    ]).then((results) => {
      const petsRes = results[0];
      const limitsRes = results[1];

      const pets = petsRes.list || [];
      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');

      const petList = pets.map(pet => {
        const speciesInfo = constants.SPECIES[pet.species];
        return {
          id: pet.id,
          name: pet.name,
          avatar: pet.avatar_photo ? baseUrl + pet.avatar_photo : '',
          breed: pet.breed || '',
          species: pet.species,
          speciesLabel: speciesInfo ? speciesInfo.label : pet.species,
          speciesIcon: speciesInfo ? speciesInfo.icon : '🐾',
          gender: pet.gender,
          status: pet.status,
        };
      });

      that.setData({
        pets: petList,
        isPro: limitsRes && limitsRes.tier === 'pro',
        loading: false,
      });

      wx.setNavigationBarTitle({ title: '血统证书' });
    }).catch((err) => {
      console.error('加载数据失败:', err);
      that.setData({ loading: false });
    });
  },

  selectPet(e) {
    const petId = e.currentTarget.dataset.id;
    if (!this.data.isPro) {
      wx.showToast({ title: '请先升级Pro版', icon: 'none' });
      return;
    }
    // 埋点：查看血统证书
    analytics.pedigreeView(petId, '3');

    wx.navigateTo({ url: '/pages/pedigree-cert/pedigree-cert?pet_id=' + petId });
  },

  goUpgrade() {
    wx.navigateTo({ url: '/pages/plan-select/plan-select?tier=pro' });
  },
});
