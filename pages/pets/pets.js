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
      { key: 'all', label: '全部', icon: '' },
      { key: 'dog', label: '犬', icon: '🐕' },
      { key: 'cat', label: '猫', icon: '🐈' },
      { key: 'bird', label: '鸟', icon: '🐦' },
    ],
    loading: true,
    petCount: 0,
    maxPets: 3,
    showLimitHint: false,
    showLimitModal: false,
    selectedPlan: 'pro',
    fromBreeding: false,
    touchStartX: 0,
    touchEndX: 0,
    touchStartTime: 0,
    currentTouchId: null,
    isLongPress: false,
    showDeleteModal: false,
    showCannotDeleteModal: false,
    deletingPet: null,
  },

  onShow() {
    const app = getApp();
    this.setData({ fromBreeding: app.globalData.fromBreeding || false });
    app.globalData.fromBreeding = false;
    this.loadPets();
    this.loadLimits();
  },

  loadPets() {
    const that = this;
    that.setData({ loading: true });
    api.get('/pets', { page: 1, pageSize: 100 }).then(function(res) {
      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      const data = res.data || res;
      const list = data.list || [];
      const allPetList = [];
      for (let i = 0; i < list.length; i++) {
        const pet = list[i];
        const speciesInfo = constants.SPECIES[pet.species];
        const genderInfo = constants.GENDER[pet.gender];
        const speciesLabel = speciesInfo && speciesInfo.label ? speciesInfo.label : pet.species;
        const speciesIcon = speciesInfo && speciesInfo.icon ? speciesInfo.icon : '🐾';
        const genderLabel = genderInfo && genderInfo.label ? genderInfo.label : '';
        const avatar = pet.avatar_photo ? baseUrl + pet.avatar_photo : '';
        const item = {};
        for (let key in pet) {
          item[key] = pet[key];
        }
        item.speciesLabel = speciesLabel;
        item.speciesIcon = speciesIcon;
        item.genderLabel = genderLabel;
        item.age = calcAge(pet.birth_date);
        item.avatar = avatar;
        item.statusBadge = that.getStatusBadge(pet.status);
        allPetList.push(item);
      }

      const filteredList = that.filterPets(allPetList, that.data.currentFilter, that.data.searchKeyword);

      that.setData({
        allPetList: allPetList,
        petList: filteredList,
        petCount: filteredList.length,
        loading: false,
      });
    }).catch(function(err) {
      console.error('加载宠物列表失败:', err);
      that.setData({ loading: false });
    });
  },

  filterPets(petList, filter, keyword) {
    const result = petList.slice();

    if (filter !== 'all') {
      const filtered1 = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i].species === filter) {
          filtered1.push(result[i]);
        }
      }
      result = filtered1;
    }

    if (keyword) {
      const kw = keyword.toLowerCase();
      const filtered2 = [];
      for (let j = 0; j < result.length; j++) {
        const pet = result[j];
        const nameMatch = pet.name.toLowerCase().indexOf(kw) !== -1;
        const breedMatch = pet.breed && pet.breed.toLowerCase().indexOf(kw) !== -1;
        if (nameMatch || breedMatch) {
          filtered2.push(pet);
        }
      }
      result = filtered2;
    }

    return result;
  },

  loadLimits() {
    const that = this;
    api.get('/auth/limits').then(function(res) {
      if (res) {
        const data = res.data || res;
        const tier = data.tier || 'free';
        const tierNames = { free: '免费版', basic: '基础版', pro: 'Pro版' };
        const tierName = tierNames[tier] || '免费版';
        const maxPets = data.maxPets || data.max_pets || 3;
        const currentPets = data.currentPets || data.current_pets || 0;
        let showLimitHint = false;
        if (maxPets && currentPets >= maxPets) {
          showLimitHint = true;
        }
        that.setData({
          currentTier: tierName,
          maxPets: maxPets,
          petCount: currentPets,
          showLimitHint: showLimitHint,
        });
      }
    }).catch(function(err) {
      console.error('加载限额信息失败:', err);
    });
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
    if (this.data.isLongPress) {
      this.setData({ isLongPress: false });
      return;
    }
    
    const id = e.currentTarget.dataset.id;
    if (this.data.fromBreeding) {
      wx.navigateTo({ url: `/pages/breeding-add/breeding-add?pet_id=${id}` });
    } else {
      wx.navigateTo({ url: `/pages/pet-detail/pet-detail?id=${id}` });
    }
  },

  goUpgrade() {
    this.setData({ showLimitModal: true });
  },

  hideLimitModal() {
    this.setData({ showLimitModal: false });
  },

  selectPlan(e) {
    const plan = e.currentTarget.dataset.plan;
    this.setData({ selectedPlan: plan });
  },

  goPayment() {
    this.setData({ showLimitModal: false });
    wx.navigateTo({ url: '/pages/subscribe/subscribe' });
  },

  stopPropagation() {},

  onWxLogin() {},

  onTouchStart(e) {
    this.setData({
      touchStartX: e.touches[0].clientX,
      touchStartTime: Date.now(),
      currentTouchId: e.currentTarget.dataset.id,
      isLongPress: false,
    });
  },

  onTouchMove(e) {
    const data = this.data;
    const touchStartX = data.touchStartX;
    const touchStartTime = data.touchStartTime;
    const isLongPress = data.isLongPress;
    const currentTouchId = data.currentTouchId;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX - currentX;
    const touchDuration = Date.now() - touchStartTime;

    if (!isLongPress && touchDuration > 200 && diff > 10) {
      this.setData({ isLongPress: true });
      isLongPress = true;
    }

    if (isLongPress) {
      const deleteBtnWidth = 160;
      const translateX = Math.max(-deleteBtnWidth, Math.min(0, -diff));
      const petList = data.petList;
      let index = -1;
      for (let i = 0; i < petList.length; i++) {
        if (petList[i].id === currentTouchId) {
          index = i;
          break;
        }
      }
      // 使用路径更新，避免替换整个列表
      if (index !== -1) {
        const updateObj = {};
        updateObj['petList[' + index + '].translateX'] = translateX;
        this.setData(updateObj);
      }
    }
  },

  onTouchEnd(e) {
    const data = this.data;
    const touchStartX = data.touchStartX;
    const touchEndX = e.changedTouches[0].clientX;
    const currentTouchId = data.currentTouchId;
    const isLongPress = data.isLongPress;
    const diff = touchStartX - touchEndX;
    const deleteBtnWidth = 160;
    const petList = data.petList;
    let index = -1;
    for (let i = 0; i < petList.length; i++) {
      if (petList[i].id === currentTouchId) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      // 使用路径更新 translateX，避免替换整个列表
      const updateObj = {
        isLongPress: false,
        touchStartX: 0,
        touchEndX: 0,
        touchStartTime: 0,
      };
      if (isLongPress && diff > 30) {
        updateObj['petList[' + index + '].translateX'] = -deleteBtnWidth;
      } else {
        updateObj['petList[' + index + '].translateX'] = 0;
      }
      this.setData(updateObj);
    } else {
      this.setData({
        isLongPress: false,
        touchStartX: 0,
        touchEndX: 0,
        touchStartTime: 0,
      });
    }
  },

  getPetIndex(id) {
    const petList = this.data.petList;
    for (let i = 0; i < petList.length; i++) {
      if (petList[i].id === id) {
        return i;
      }
    }
    return -1;
  },

  deletePet(e) {
    const pet = e.currentTarget.dataset.pet;
    this.setData({ 
      deletingPet: pet, 
      showDeleteModal: true 
    });
    
    const index = this.getPetIndex(pet.id);
    if (index !== -1) {
      // 使用路径更新，避免替换整个列表
      const updateObj = {};
      updateObj['petList[' + index + '].translateX'] = 0;
      this.setData(updateObj);
    }
  },

  cancelDelete: function() {
    this.setData({ showDeleteModal: false });
  },

  confirmDelete: function() {
    const that = this;
    const deletingPet = that.data.deletingPet;
    api.del('/pets/' + deletingPet.id, null, { loading: false }).then(function() {
      wx.showToast({ title: '删除成功', icon: 'success' });
      that.setData({ showDeleteModal: false });
      setTimeout(function() {
        that.loadPets();
        that.loadLimits();
      }, 1000);
    }).catch(function(err) {
      let hasBreedingMsg = false;
      if (err && err.response && err.response.data && err.response.data.message) {
        hasBreedingMsg = err.response.data.message.indexOf('繁育') !== -1;
      }
      let is404 = false;
      if (err && err.response && err.response.status === 404) {
        is404 = true;
      }
      
      if (hasBreedingMsg) {
        that.setData({ showDeleteModal: false, showCannotDeleteModal: true });
      } else if (is404) {
        wx.showToast({ title: '宠物不存在', icon: 'none' });
        that.setData({ showDeleteModal: false });
        setTimeout(function() {
          that.loadPets();
        }, 1000);
      } else {
        wx.showToast({ title: '删除失败', icon: 'none' });
      }
    });
  },

  closeCannotDeleteModal() {
    this.setData({ showCannotDeleteModal: false });
  },
});
