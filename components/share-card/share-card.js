Component({
  properties: {
    pet: { type: Object, value: null, observer: '_onPetChange' },
    kennelName: { type: String, value: '' },
    kennelLogo: { type: String, value: '' },
    vaccineInfo: { type: String, value: '' },
    dewormInfo: { type: String, value: '' },
  },

  data: {
    hasHealth: false,
  },

  methods: {
    _onPetChange(pet) {
      if (!pet) return;
      this.setData({
        hasHealth: !!(this.data.vaccineInfo || this.data.dewormInfo),
      });
    },

    onSaveImage() {
      wx.showToast({ title: '请截图保存', icon: 'none', duration: 2000 });
    },

    onShareAppMessage() {
      const pet = this.data.pet;
      return {
        title: `${pet.name} · ${pet.breed || ''} | 宠宝树认证`,
        path: `/pages/pet-detail/pet-detail?id=${pet.id}`,
        imageUrl: pet.avatar || '',
      };
    },
  },
});
