/**
 * P2 宠物列表 - 按设计稿一比一复刻
 */
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const { calcAge } = require('../../utils/auth');

Page({
  data: {
    petList: [],
    allPetList: [],
    searchKeyword: '',
    currentFilter: 'all',
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'dog', label: '🐕 犬' },
      { key: 'cat', label: '🐈 猫' },
      { key: 'bird', label: '🐦 鸟' },
    ],
    loading: true,
    petCount: 0,
    maxPets: 3,
    showLimitHint: false,
    showLimitModal: false,
  },

  onShow() {
    this.loadPets();
    this.loadLimits();
  },

  async loadPets() {
    this.setData({ loading: true });
    try {
      const res = await api.get('/pets', { page: 1, pageSize: 100 });
      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');

      const allPetList = (res.list || []).map(pet => ({
        ...pet,
        speciesLabel: constants.SPECIES[pet.species]?.label || pet.species,
        speciesIcon: constants.SPECIES[pet.species]?.icon || '🐾',
        genderLabel: constants.GENDER[pet.gender]?.label || '',
        age: calcAge(pet.birth_date),
        avatar: pet.photos?.[0]?.photo_url ? `${baseUrl}${pet.photos[0].photo_url}` : '',
        statusBadge: this.getStatusBadge(pet.status),
      }));

      const filteredList = this.filterPets(allPetList, this.data.currentFilter, this.data.searchKeyword);

      this.setData({
        allPetList,
        petList: filteredList,
        petCount: filteredList.length,
        loading: false,
      });
    } catch (err) {
      console.error('加载宠物列表失败:', err);
      this.setData({ loading: false });
    }
  },

  filterPets(petList, filter, keyword) {
    let result = petList;

    if (filter !== 'all') {
      result = result.filter(pet => pet.species === filter);
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      result = result.filter(pet =>
        pet.name.toLowerCase().includes(kw) ||
        (pet.breed && pet.breed.toLowerCase().includes(kw))
      );
    }

    return result;
  },

  async loadLimits() {
    try {
      const res = await api.get('/auth/limits');
      if (res) {
        this.setData({
          maxPets: res.max_pets || 3,
          petCount: res.current_pets || 0,
          showLimitHint: res.max_pets && res.current_pets >= res.max_pets,
        });
      }
    } catch (err) {
      console.error('加载限额信息失败:', err);
    }
  },

  getStatusBadge(status) {
    const badges = {
      active: { label: '活跃', type: 'green' },
      breeding: { label: '可配种', type: 'green' },
      pregnant: { label: '怀孕中', type: 'orange' },
      nursing: { label: '哺乳中', type: 'purple' },
      sold: { label: '已出售', type: 'gray' },
      deceased: { label: '已去世', type: 'gray' },
    };
    return badges[status];
  },

  onFilterTab(e) {
    const key = e.currentTarget.dataset.key;
    const filteredList = this.filterPets(this.data.allPetList, key, this.data.searchKeyword);
    this.setData({
      currentFilter: key,
      petList: filteredList,
      petCount: filteredList.length,
    });
  },

  onSearch(e) {
    const keyword = e.detail.value;
    const filteredList = this.filterPets(this.data.allPetList, this.data.currentFilter, keyword);
    this.setData({
      searchKeyword: keyword,
      petList: filteredList,
      petCount: filteredList.length,
    });
  },

  goAddPet() {
    if (this.data.showLimitHint) {
      this.setData({ showLimitModal: true });
    } else {
      wx.navigateTo({ url: '/pages/pet-add/pet-add' });
    }
  },

  goPetDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${id}` });
  },

  goUpgrade() {
    this.setData({ showLimitModal: true });
  },

  hideLimitModal() {
    this.setData({ showLimitModal: false });
  },

  goPayment() {
    this.setData({ showLimitModal: false });
    wx.navigateTo({ url: '/pages/subscription/subscription' });
  },

  stopPropagation() {},
});
