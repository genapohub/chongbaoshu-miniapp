/**
 * P4 宠物详情 - 按设计稿一比一复刻
 */
var api = require('../../utils/api');
var constants = require('../../utils/constants');
var authUtils = require('../../utils/auth');

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

  onLoad: function(options) {
    this.setData({ petId: options.id });
    this.loadData();
  },

  onShow: function() {
    if (this.data.petId) {
      this.loadData();
    }
  },

  loadData: function() {
    var that = this;
    var petId = that.data.petId;
    if (!petId) return;

    Promise.all([
      api.get('/pets/' + petId),
      api.get('/breeding', { pet_id: petId }).catch(function() { return { list: [] }; }),
      api.get('/health', { pet_id: petId }).catch(function() { return { list: [] }; }),
      api.get('/pets/' + petId + '/pedigree').catch(function() { return null; }),
      api.get('/auth/limits').catch(function() { return null; }),
    ]).then(function(results) {
      var petRes = results[0];
      var breedingRes = results[1];
      var healthRes = results[2];
      var pedigreeRes = results[3];
      var limitsRes = results[4];

      console.log('petRes:', petRes);

      var pet = petRes.data || petRes;
      var baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      console.log('baseUrl:', baseUrl);
      var rawPhotos = pet.photos || [];
      console.log('rawPhotos:', rawPhotos);
      var photos = [];
      for (var i = 0; i < rawPhotos.length; i++) {
        var p = rawPhotos[i];
        var url = baseUrl + p.photo_url;
        console.log('photo ' + i + ': ' + p.photo_url + ' -> ' + url);
        photos.push(url);
      }
      var avatarPhoto = pet.avatar_photo || '';
      var avatar = avatarPhoto ? baseUrl + avatarPhoto : '';
      console.log('avatar_photo:', avatarPhoto);
      console.log('avatar:', avatar);

      var speciesInfo = constants.SPECIES[pet.species];
      var speciesLabel = speciesInfo && speciesInfo.label ? speciesInfo.label : pet.species;
      var speciesIcon = speciesInfo && speciesInfo.icon ? speciesInfo.icon : '🐾';

      var genderInfo = constants.GENDER[pet.gender];
      var genderLabel = genderInfo && genderInfo.label ? genderInfo.label : '';

      var birthDate = '';
      if (pet.birth_date) {
        birthDate = pet.birth_date.split('T')[0];
      }

      that.setData({
        pet: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          speciesLabel: speciesLabel,
          speciesIcon: speciesIcon,
          gender: pet.gender,
          genderLabel: genderLabel,
          age: authUtils.calcAge(pet.birth_date),
          birthDate: birthDate,
          color: pet.color,
          chipNo: pet.chip_number,
          avatar: avatar,
          photos: photos,
          status: pet.status,
          statusLabel: that.getStatusLabel(pet.status),
        },
        photoCount: photos.length,
        maxPhotos: limitsRes && limitsRes.max_photos_per_pet ? limitsRes.max_photos_per_pet : 3,
        canAddPhoto: photos.length < (limitsRes && limitsRes.max_photos_per_pet ? limitsRes.max_photos_per_pet : 3),
        isPro: limitsRes && limitsRes.tier === 'pro',
      });

      wx.setNavigationBarTitle({ title: '宠物详情' });

      var breedingRecords = [];
      var breedingList = breedingRes.list || [];
      for (var j = 0; j < breedingList.length; j++) {
        var rec = breedingList[j];
        var date = '';
        if (rec.mating_date) {
          date = rec.mating_date.split('T')[0];
        }
        breedingRecords.push({
          id: rec.id,
          name: rec.mate_name ? pet.name + ' × ' + rec.mate_name : pet.name,
          date: date,
          status: that.getBreedingStatus(rec.status),
          statusType: that.getBreedingStatusType(rec.status),
        });
      }
      that.setData({ breedingRecords: breedingRecords });

      var healthRecords = [];
      var healthList = healthRes.list || [];
      for (var k = 0; k < healthList.length; k++) {
        var rec = healthList[k];
        var name = rec.name;
        if (rec.type === 'vaccine') {
          name = rec.vaccine_name + '疫苗';
        } else if (rec.type === 'deworm') {
          name = (rec.deworm_type === 'internal' ? '体内' : '体外') + '驱虫';
        }
        var date = '';
        if (rec.record_date) {
          date = rec.record_date.split('T')[0];
        }
        var nextDate = '';
        if (rec.next_date) {
          nextDate = rec.next_date.split('T')[0];
        }
        healthRecords.push({
          id: rec.id,
          name: name,
          date: date,
          nextDate: nextDate,
          status: that.getHealthStatus(rec),
          statusType: that.getHealthStatusType(rec),
        });
      }
      that.setData({ healthRecords: healthRecords });

      if (pedigreeRes) {
        that.setData({
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
    }).catch(function(err) {
      console.error('加载宠物详情失败:', err);
    }).finally(function() {
      that._loaded = true;
    });
  },

  loadRecords: function() {
    var that = this;
    var petId = that.data.petId;
    if (!petId) return;

    Promise.all([
      api.get('/breeding', { pet_id: petId }).catch(function() { return { list: [] }; }),
      api.get('/health', { pet_id: petId }).catch(function() { return { list: [] }; }),
    ]).then(function(results) {
      var breedingRes = results[0];
      var healthRes = results[1];

      var pet = that.data.pet;
      var breedingRecords = [];
      var breedingList = breedingRes.list || [];
      for (var i = 0; i < breedingList.length; i++) {
        var rec = breedingList[i];
        var date = '';
        if (rec.mating_date) {
          date = rec.mating_date.split('T')[0];
        }
        breedingRecords.push({
          id: rec.id,
          name: rec.mate_name ? pet.name + ' × ' + rec.mate_name : pet.name,
          date: date,
          status: that.getBreedingStatus(rec.status),
          statusType: that.getBreedingStatusType(rec.status),
        });
      }

      var healthRecords = [];
      var healthList = healthRes.list || [];
      for (var j = 0; j < healthList.length; j++) {
        var rec = healthList[j];
        var name = rec.name;
        if (rec.type === 'vaccine') {
          name = rec.vaccine_name + '疫苗';
        } else if (rec.type === 'deworm') {
          name = (rec.deworm_type === 'internal' ? '体内' : '体外') + '驱虫';
        }
        var date = '';
        if (rec.record_date) {
          date = rec.record_date.split('T')[0];
        }
        var nextDate = '';
        if (rec.next_date) {
          nextDate = rec.next_date.split('T')[0];
        }
        healthRecords.push({
          id: rec.id,
          name: name,
          date: date,
          nextDate: nextDate,
          status: that.getHealthStatus(rec),
          statusType: that.getHealthStatusType(rec),
        });
      }

      that.setData({ breedingRecords: breedingRecords, healthRecords: healthRecords });
    });
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

  addPhoto: function() {
    var petId = this.data.petId;
    var photoCount = this.data.photoCount;
    var maxPhotos = this.data.maxPhotos;
    
    if (photoCount >= maxPhotos) {
      wx.showToast({ title: '已达照片上限', icon: 'none' });
      return;
    }

    var that = this;
    wx.chooseImage({
      count: maxPhotos - photoCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var tempFilePaths = res.tempFilePaths;
        that.uploadPhotos(tempFilePaths);
      },
      fail: function() {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  },

  uploadPhotos: function(filePaths) {
    var that = this;
    var petId = that.data.petId;
    
    wx.showLoading({ title: '上传中...', mask: true });
    
    var uploadIndex = 0;
    function uploadNext() {
      if (uploadIndex >= filePaths.length) {
        wx.hideLoading();
        wx.showToast({ title: '上传成功', icon: 'success' });
        that.loadData();
        return;
      }
      
      var filePath = filePaths[uploadIndex];
      that.uploadPhoto(filePath, petId).then(function() {
        uploadIndex++;
        uploadNext();
      }).catch(function(err) {
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
