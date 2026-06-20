/**
 * P4 宠物详情 - 重构版
 * 抽取 _formatBreedingRecords / _formatHealthRecords / _parsePetData 消除重复
 */
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const authUtils = require('../../utils/auth');

/** 繁育状态 → badge 颜色映射（模块级常量，避免每次调用创建对象） */
const BREEDING_STATUS_COLORS = {
  mated: 'gray',
  pregnant: 'orange',
  ultrasound_confirmed: 'orange',
  delivered: 'green',
  weaned: 'green',
  failed: 'red',
};

Page({
  data: {
    petId: null,
    loading: true,
    error: false,
    needRefresh: false,
    pet: {},
    currentTab: 'overview',
    tabs: [
      { key: 'overview', label: '概览' },
      { key: 'breeding', label: '繁育' },
      { key: 'health', label: '健康' },
      { key: 'pedigree', label: '血统' },
    ],
    breedingRecords: [],
    healthRecords: [],
    pedigree: {},
    isPro: false,
    photoCount: 0,
    maxPhotos: 3,
    canAddPhoto: false,
  },

  onLoad: function(options) {
    this.setData({ petId: options.id });
    this.loadData();
  },

  onShow: function() {
    if (this.data.petId && this.data.needRefresh) {
      this.loadData();
      this.setData({ needRefresh: false });
    }
  },

  // ── 数据格式化（私有方法） ────────────────────────────

  /** 格式化繁育记录列表 */
  _formatBreedingRecords: function(breedingList) {
    const that = this;
    const records = [];
    for (let i = 0; i < breedingList.length; i++) {
      const rec = breedingList[i];
      const date = rec.mating_date ? constants.formatDate(rec.mating_date) : '';
      // 根据双方名称拼展示名
      const motherName = rec.mother_name || '';
      const fatherName = rec.father_name || rec.mate_name || '';
      let breedingName = '';
      if (motherName && fatherName) {
        breedingName = motherName + ' × ' + fatherName;
      } else {
        breedingName = motherName || fatherName;
      }
      records.push({
        id: rec.id,
        name: breedingName,
        date: date,
        status: that.getBreedingStatus(rec.status),
        statusType: that.getBreedingStatusType(rec.status),
      });
    }
    return records;
  },

  /** 格式化健康记录列表 */
  _formatHealthRecords: function(healthList) {
    const that = this;
    const records = [];
    for (let i = 0; i < healthList.length; i++) {
      const rec = healthList[i];
      let name = rec.name || '';
      if (rec.type === 'vaccine') {
        name = (rec.vaccine_name || rec.vaccine_type || '未知') + '疫苗';
      } else if (rec.type === 'deworm') {
        const dewormLabel = rec.deworm_type === 'internal' ? '体内' : (rec.deworm_type === 'external' ? '体外' : '');
        name = dewormLabel + '驱虫';
      } else if (!name && rec.description) {
        name = rec.description;
      }
      const date = rec.record_date ? constants.formatDate(rec.record_date) : '';
      const nextDate = rec.next_date ? constants.formatDate(rec.next_date) : '';
      records.push({
        id: rec.id,
        name: name,
        date: date,
        nextDate: nextDate,
        status: that.getHealthStatus(rec),
        statusType: that.getHealthStatusType(rec),
      });
    }
    return records;
  },

  /** 格式化宠物基础数据 */
  _parsePetData: function(pet, limitsRes) {
    const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
    const rawPhotos = pet.photos || [];
    const photos = [];
    for (let i = 0; i < rawPhotos.length; i++) {
      photos.push(baseUrl + rawPhotos[i].photo_url);
    }
    const avatarPhoto = pet.avatar_photo || '';
    const avatar = avatarPhoto ? baseUrl + avatarPhoto : '';

    const speciesInfo = constants.SPECIES[pet.species];
    const genderInfo = constants.GENDER[pet.gender];
    const maxPhotos = (limitsRes && limitsRes.max_photos_per_pet) ? limitsRes.max_photos_per_pet : 3;

    return {
      pet: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        speciesLabel: (speciesInfo && speciesInfo.label) || pet.species,
        speciesIcon: (speciesInfo && speciesInfo.icon) || 'paw',
        gender: pet.gender,
        genderLabel: (genderInfo && genderInfo.label) || '',
        age: authUtils.calcAge(pet.birth_date),
        birthDate: pet.birth_date ? constants.formatDate(pet.birth_date) : '',
        color: pet.color,
        chipNo: pet.chip_number,
        avatar: avatar,
        photos: photos,
        status: pet.status,
        statusLabel: this.getStatusLabel(pet.status),
      },
      photoCount: photos.length,
      maxPhotos: maxPhotos,
      canAddPhoto: photos.length < maxPhotos,
      isPro: !!(limitsRes && limitsRes.tier === 'pro'),
    };
  },

  // ── 数据加载 ────────────────────────────

  loadData: function() {
    const that = this;
    const petId = that.data.petId;
    if (!petId) return;
    that.setData({ loading: true,
    error: false });

    Promise.all([
      api.get('/pets/' + petId),
      api.get('/breeding', { pet_id: petId }).catch(function() { return { list: [] }; }),
      api.get('/health', { pet_id: petId }).catch(function() { return { list: [] }; }),
      api.get('/pets/' + petId + '/pedigree').catch(function() { return null; }),
      api.get('/auth/limits').catch(function() { return null; }),
    ]).then(function(results) {
      const petRes = results[0];
      const breedingRes = results[1];
      const healthRes = results[2];
      const pedigreeRes = results[3];
      const limitsRes = results[4];

      // 宠物基础数据
      const parsed = that._parsePetData(petRes, limitsRes);
      that.setData(parsed);
      wx.setNavigationBarTitle({ title: '宠物详情' });

      // 繁育 + 健康记录
      that.setData({
        breedingRecords: that._formatBreedingRecords(breedingRes.list || []),
        healthRecords: that._formatHealthRecords(healthRes.list || []),
      });

      // 血统数据
      if (pedigreeRes) {
        const pd = pedigreeRes;
        that.setData({
          pedigree: {
            regName: pd.registration_name || pd.pet_name || '',
            regNo: pd.registration_number || '',
            kennel: pd.kennel_name || '',
            color: pd.color || '',
            father: pd.father_name || '—',
            mother: pd.mother_name || '—',
            fatherFather: pd.father_father_name || '—',
            fatherMother: pd.father_mother_name || '—',
            motherFather: pd.mother_father_name || '—',
            motherMother: pd.mother_mother_name || '—',
            fatherFatherFather: pd.father_father_father_name || '—',
            fatherFatherMother: pd.father_father_mother_name || '—',
            fatherMotherFather: pd.father_mother_father_name || '—',
            fatherMotherMother: pd.father_mother_mother_name || '—',
            motherFatherFather: pd.mother_father_father_name || '—',
            motherFatherMother: pd.mother_father_mother_name || '—',
            motherMotherFather: pd.mother_mother_father_name || '—',
            motherMotherMother: pd.mother_mother_mother_name || '—',
          },
        });
      }
    }).catch(function(err) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }).finally(function() {
      that.setData({ error: true, loading: false });
      that._loaded = true;
    });
  },

  /** 仅刷新繁育+健康记录（切 Tab 或返回时轻量刷新） */
  loadRecords: function() {
    const that = this;
    const petId = that.data.petId;
    if (!petId) return;

    Promise.all([
      api.get('/breeding', { pet_id: petId }).catch(function() { return { list: [] }; }),
      api.get('/health', { pet_id: petId }).catch(function() { return { list: [] }; }),
    ]).then(function(results) {
      that.setData({
        breedingRecords: that._formatBreedingRecords(results[0].list || []),
        healthRecords: that._formatHealthRecords(results[1].list || []),
      });
    });
  },

  // ── 状态映射 ────────────────────────────

  getStatusLabel(status) {
    return (constants.PET_STATUS[status] && constants.PET_STATUS[status].label) || status;
  },

  getBreedingStatus(status) {
    return (constants.BREEDING_STATUS[status] && constants.BREEDING_STATUS[status].label) || status;
  },

  getBreedingStatusType(status) {
    return BREEDING_STATUS_COLORS[status] || 'gray';
  },

  getHealthStatus(record) {
    const today = new Date();
    const nextDate = record.next_date ? new Date(record.next_date) : null;
    if (!nextDate) return '已完成';
    const daysDiff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    if (daysDiff < 0) return '已过期';
    if (daysDiff <= 7) return '即将到期';
    return '正常';
  },

  getHealthStatusType(record) {
    const status = this.getHealthStatus(record);
    const types = {
      '已完成': 'green',
      '正常': 'green',
      '即将到期': 'orange',
      '已过期': 'red',
    };
    return types[status] || 'gray';
  },

  // ── 交互 ────────────────────────────

  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ currentTab: key });
  },

  goBreedingDetail(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/breeding-detail/breeding-detail?id=${id}` });
  },

  goHealthDetail(e) {
    this.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/health-detail/health-detail?pet_id=${this.data.petId}` });
  },

  goAddBreeding() {
    this.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/breeding-add/breeding-add?pet_id=${this.data.petId}` });
  },

  goAddHealth() {
    this.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/health-add/health-add?pet_id=${this.data.petId}` });
  },

  goPedigreeCert() {
    if (!this.data.isPro) {
      wx.showToast({ title: '此功能为Pro专属', icon: 'none' });
      return;
    }
  },

  goShareCard() {
    const id = this.data.pet.id;
    wx.navigateTo({ url: `/pages/share-card/share-card?pet_id=${id}` });
  },

  goEdit() {
    this.setData({ needRefresh: true });
    wx.navigateTo({ url: `/pages/pet-edit/pet-edit?id=${this.data.petId}` });
  },

  addPhoto: function() {
    const petId = this.data.petId;
    const photoCount = this.data.photoCount;
    const maxPhotos = this.data.maxPhotos;

    if (photoCount >= maxPhotos) {
      wx.showToast({ title: '已达照片上限', icon: 'none' });
      return;
    }

    const that = this;
    wx.chooseImage({
      count: maxPhotos - photoCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.uploadPhotos(res.tempFilePaths);
      },
      fail: function() {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  },

  uploadPhotos: function(filePaths) {
    const that = this;
    const petId = that.data.petId;

    wx.showLoading({ title: '上传中...', mask: true });

    let uploadIndex = 0;
    function uploadNext() {
      if (uploadIndex >= filePaths.length) {
        wx.hideLoading();
        wx.showToast({ title: '上传成功', icon: 'success' });
        that.loadData();
        return;
      }

      that.uploadPhoto(filePaths[uploadIndex], petId).then(function() {
        uploadIndex++;
        uploadNext();
      }).catch(function() {
        wx.hideLoading();
        wx.showToast({ title: '上传失败', icon: 'none' });
      });
    }

    uploadNext();
  },

  uploadPhoto(filePath, petId) {
    return new Promise((resolve, reject) => {
      const app = getApp();
      const token = app.globalData.token;

      wx.uploadFile({
        url: `${app.globalData.baseUrl}/photos?pet_id=${petId}`,
        filePath,
        name: 'file',
        header: { Authorization: `Bearer ${token}` },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data.data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        },
        fail: (err) => reject(err),
      });
    });
  },
});
