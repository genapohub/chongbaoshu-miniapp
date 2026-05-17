/**
 * P4 宠物详情 - 按设计稿一比一复刻
 */
const api = require('../../utils/api');
const constants = require('../../utils/constants');
const { calcAge } = require('../../utils/auth');

Page({
  data: {
    petId: null,
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

  onLoad(options) {
    this.setData({ petId: options.id });
    this.loadData();
  },

  onShow() {
    if (this.data.petId && this._loaded) {
      this.loadRecords();
    }
  },

  async loadData() {
    const { petId } = this.data;
    if (!petId) return;

    try {
      // 单独调用宠物详情接口（不依赖其他接口）
      const petRes = await api.get(`/pets/${petId}`);
      
      // 其他接口用独立的 catch 处理
      const breedingRes = await api.get('/breeding', { pet_id: petId }).catch(() => ({ list: [] }));
      const healthRes = await api.get('/health', { pet_id: petId }).catch(() => ({ list: [] }));
      const pedigreeRes = await api.get(`/pets/${petId}/pedigree`).catch(() => null);
      const limitsRes = await api.get('/auth/limits').catch(() => null);

      const pet = petRes;
      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      const photos = pet.photos?.map(p => `${baseUrl}${p.photo_url}`) || [];

      this.setData({
        pet: {
          ...pet,
          speciesLabel: constants.SPECIES[pet.species]?.label || pet.species,
          speciesIcon: constants.SPECIES[pet.species]?.icon || '🐾',
          genderLabel: constants.GENDER[pet.gender]?.label || '',
          age: calcAge(pet.birth_date),
          birthDate: pet.birth_date?.split('T')[0] || '',
          color: pet.color,
          chipNo: pet.chip_number,
          avatar: photos[0] || '',
          photos,
          statusLabel: this.getStatusLabel(pet.status),
        },
        photoCount: photos.length,
        maxPhotos: limitsRes?.max_photos_per_pet || 3,
        canAddPhoto: photos.length < (limitsRes?.max_photos_per_pet || 3),
        isPro: limitsRes?.tier === 'pro',
      });

      const breedingRecords = (breedingRes.list || []).map(rec => ({
        id: rec.id,
        name: rec.mate_name ? `${pet.name} × ${rec.mate_name}` : pet.name,
        date: rec.mating_date?.split('T')[0] || '',
        status: this.getBreedingStatus(rec.status),
        statusType: this.getBreedingStatusType(rec.status),
      }));
      this.setData({ breedingRecords });

      const healthRecords = (healthRes.list || []).map(rec => ({
        id: rec.id,
        name: rec.type === 'vaccine' ? `${rec.vaccine_name}疫苗` : rec.type === 'deworm' ? `${rec.deworm_type === 'internal' ? '体内' : '体外'}驱虫` : rec.name,
        date: rec.record_date?.split('T')[0] || '',
        nextDate: rec.next_date?.split('T')[0] || '',
        status: this.getHealthStatus(rec),
        statusType: this.getHealthStatusType(rec),
      }));
      this.setData({ healthRecords });

      if (pedigreeRes) {
        this.setData({
          pedigree: {
            regName: pedigreeRes.registration_name,
            regNo: pedigreeRes.registration_number,
            kennel: pedigreeRes.kennel_name,
            color: pedigreeRes.color,
            father: pedigreeRes.father_name,
            mother: pedigreeRes.mother_name,
            fatherFather: pedigreeRes.father_father_name,
            fatherMother: pedigreeRes.father_mother_name,
          },
        });
      }
    } catch (err) {
      console.error('加载宠物详情失败:', err);
    } finally {
      this._loaded = true;
    }
  },

  async loadRecords() {
    const petId = this.data.petId;
    if (!petId) return;

    const breedingRes = await api.get('/breeding', { pet_id: petId }).catch(() => ({ list: [] }));
    const healthRes = await api.get('/health', { pet_id: petId }).catch(() => ({ list: [] }));

    const pet = this.data.pet;
    const breedingRecords = (breedingRes.list || []).map(rec => ({
      id: rec.id,
      name: rec.mate_name ? `${pet.name} × ${rec.mate_name}` : pet.name,
      date: rec.mating_date?.split('T')[0] || '',
      status: this.getBreedingStatus(rec.status),
      statusType: this.getBreedingStatusType(rec.status),
    }));

    const healthRecords = (healthRes.list || []).map(rec => ({
      id: rec.id,
      name: rec.type === 'vaccine' ? `${rec.vaccine_name}疫苗` : rec.type === 'deworm' ? `${rec.deworm_type === 'internal' ? '体内' : '体外'}驱虫` : rec.name,
      date: rec.record_date?.split('T')[0] || '',
      nextDate: rec.next_date?.split('T')[0] || '',
      status: this.getHealthStatus(rec),
      statusType: this.getHealthStatusType(rec),
    }));

    this.setData({ breedingRecords, healthRecords });
  },

  getStatusLabel(status) {
    const labels = {
      active: '活跃',
      breeding: '可配种',
      pregnant: '怀孕中',
      nursing: '哺乳中',
      sold: '已出售',
      deceased: '已去世',
    };
    return labels[status] || status;
  },

  getBreedingStatus(status) {
    const labels = {
      mated: '已配种',
      pregnant: '怀孕中',
      ultrasound_confirmed: '孕检确认',
      delivered: '已分娩',
      weaned: '已断奶',
      failed: '失败',
    };
    return labels[status] || status;
  },

  getBreedingStatusType(status) {
    const types = {
      mated: 'gray',
      pregnant: 'orange',
      ultrasound_confirmed: 'orange',
      delivered: 'green',
      weaned: 'green',
      failed: 'red',
    };
    return types[status] || 'gray';
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

  switchTab(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ currentTab: key });
  },

  goBreedingDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/breeding-detail/breeding-detail?id=${id}` });
  },

  goHealthDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/health-detail/health-detail?id=${id}` });
  },

  goAddBreeding() {
    wx.navigateTo({ url: `/pages/breeding-add/breeding-add?pet_id=${this.data.petId}` });
  },

  goAddHealth() {
    wx.navigateTo({ url: `/pages/health-add/health-add?pet_id=${this.data.petId}` });
  },

  goPedigreeCert() {
    wx.navigateTo({ url: `/pages/pedigree-cert/pedigree-cert?pet_id=${this.data.petId}` });
  },

  goEdit() {
    wx.navigateTo({ url: `/pages/pet-edit/pet-edit?id=${this.data.petId}` });
  },

  addPhoto() {
    const { petId, photoCount, maxPhotos } = this.data;
    
    if (photoCount >= maxPhotos) {
      wx.showToast({ title: '已达照片上限', icon: 'none' });
      return;
    }

    wx.chooseImage({
      count: maxPhotos - photoCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.uploadPhotos(tempFilePaths);
      },
      fail: () => {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  },

  async uploadPhotos(filePaths) {
    const { petId } = this.data;
    
    wx.showLoading({ title: '上传中...', mask: true });
    
    try {
      for (const filePath of filePaths) {
        await this.uploadPhoto(filePath, petId);
      }
      
      wx.hideLoading();
      wx.showToast({ title: '上传成功', icon: 'success' });
      this.loadData();
    } catch (err) {
      wx.hideLoading();
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  uploadPhoto(filePath, petId) {
    return new Promise((resolve, reject) => {
      const app = getApp();
      const token = app.globalData.token;
      
      wx.uploadFile({
        url: `${app.globalData.baseUrl}/photos?pet_id=${petId}`,
        filePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data.data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },
});
