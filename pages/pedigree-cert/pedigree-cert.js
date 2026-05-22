const api = require('../../utils/api');

Page({
  data: {
    petId: null,
    pet: {},
    pedigree: {},
    isPro: false,
    loading: false,
  },

  onLoad(options) {
    if (options.pet_id) {
      this.setData({ petId: options.pet_id });
      this.loadData();
    }
  },

  loadData() {
    const that = this;
    const petId = this.data.petId;
    
    that.setData({ loading: true });

    Promise.all([
      api.get('/pets/' + petId),
      api.get('/pets/' + petId + '/pedigree'),
      api.get('/auth/limits').catch(() => null),
    ]).then((results) => {
      const petRes = results[0];
      const pedigreeRes = results[1];
      const limitsRes = results[2];

      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      const pet = petRes.data || petRes;
      const avatar = pet.avatar_photo ? baseUrl + pet.avatar_photo : '';
      
      // 处理pedigree数据
      const pedigreeData = pedigreeRes.data || pedigreeRes;

      that.setData({
        pet: {
          id: pet.id,
          name: pet.name,
          breed: pet.breed || '',
          species: pet.species || '',
          avatar: avatar,
          color: pet.color || '',
          chipNo: pet.chip_no || pet.chip_number || '',
          speciesIcon: that.getSpeciesIcon(pet.species),
        },
        pedigree: {
          registration_name: pedigreeData.registration_name || pedigreeData.pet_name || '',
          registration_number: pedigreeData.registration_number || '',
          kennel_name: pedigreeData.kennel_name || '',
          color: pedigreeData.color || pet.color || '',
          // 父亲
          father_name: pedigreeData.father_name || '—',
          father_breed: pedigreeData.father_breed || '',
          // 母亲
          mother_name: pedigreeData.mother_name || '—',
          mother_breed: pedigreeData.mother_breed || '',
          // 父方祖父
          father_father_name: pedigreeData.father_father_name || '—',
          father_father_breed: pedigreeData.father_father_breed || '',
          // 父方祖母
          father_mother_name: pedigreeData.father_mother_name || '—',
          father_mother_breed: pedigreeData.father_mother_breed || '',
          // 父方祖父的父亲
          father_father_father_name: pedigreeData.father_father_father_name || '—',
          // 父方祖父的母亲
          father_father_mother_name: pedigreeData.father_father_mother_name || '—',
          // 父方祖母的父亲
          father_mother_father_name: pedigreeData.father_mother_father_name || '—',
          // 父方祖母的母亲
          father_mother_mother_name: pedigreeData.father_mother_mother_name || '—',
          // 母方祖父
          mother_father_name: pedigreeData.mother_father_name || '—',
          mother_father_breed: pedigreeData.mother_father_breed || '',
          // 母方祖母
          mother_mother_name: pedigreeData.mother_mother_name || '—',
          mother_mother_breed: pedigreeData.mother_mother_breed || '',
          // 母方祖父的父亲
          mother_father_father_name: pedigreeData.mother_father_father_name || '—',
          // 母方祖父的母亲
          mother_father_mother_name: pedigreeData.mother_father_mother_name || '—',
          // 母方祖母的父亲
          mother_mother_father_name: pedigreeData.mother_mother_father_name || '—',
          // 母方祖母的母亲
          mother_mother_mother_name: pedigreeData.mother_mother_mother_name || '—',
        },
        isPro: limitsRes && limitsRes.tier === 'pro',
        loading: false,
      });

      wx.setNavigationBarTitle({ title: '血统证书' });
    }).catch((err) => {
      console.error('加载血统信息失败:', err);
      that.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  getSpeciesIcon(species) {
    const icons = {
      dog: '🐕',
      cat: '🐈',
    };
    return icons[species] || '🐾';
  },

  previewAvatar() {
    if (this.data.pet.avatar) {
      wx.previewImage({
        urls: [this.data.pet.avatar],
      });
    }
  },

  previewCert() {
    wx.showToast({ title: '预览证书功能开发中', icon: 'none' });
  },

  editPedigree() {
    wx.showToast({ title: '编辑血统功能开发中', icon: 'none' });
  },
});
