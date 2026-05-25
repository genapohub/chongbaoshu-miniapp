/**
 * P5 编辑宠物页面 - 组件化重构版
 */
const api = require('../../utils/api.js');
const formHelpers = require('../../utils/form-helpers');

Page({
  data: {
    petId: null,
    loading: false,
    formData: {
      name: '',
      species: '',
      breed: '',
      gender: '',
      birth_date: '',
      color: '',
      chip_no: '',
      father_name: '',
      father_breed: '',
      grandfather_p_name: '',
      grandmother_p_name: '',
      mother_name: '',
      mother_breed: '',
      grandfather_m_name: '',
      grandmother_m_name: '',
      avatar: '',
    },
    speciesDisplay: {},
    showPedigree: false,
    showSpeciesPicker: false,
    speciesOptions: formHelpers.getSpeciesOptions(),
    availableTags: ['纯种', '繁育', '赛级', '家养', '活泼', '温顺'],
    customTags: [],
    selectedTags: [],
    selectedTagsIndex: {},
    newTag: '',
  },

  onLoad: function(options) {
    this.setData({ petId: options.id });
    this.loadPetData();
  },

  loadPetData: function() {
    const that = this;
    const petId = that.data.petId;
    if (!petId) return;

    api.get('/pets/' + petId).then(function(petRes) {
      const pet = petRes.data || petRes;
      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      const birthDate = pet.birth_date ? pet.birth_date.split('T')[0] : '';

      const speciesDisplay = formHelpers.findSpeciesDisplay(that.data.speciesOptions, pet.species);

      let avatarUrl = '';
      if (pet.avatar_photo) {
        avatarUrl = baseUrl + pet.avatar_photo;
      }

      const tags = pet.tags || [];
      const selectedTagsIndex = {};
      for (let j = 0; j < tags.length; j++) {
        selectedTagsIndex[tags[j]] = true;
      }

      that.setData({
        formData: {
          name: pet.name || '',
          species: pet.species || '',
          breed: pet.breed || '',
          gender: pet.gender || '',
          birth_date: birthDate,
          color: pet.color || '',
          chip_no: pet.chip_number || '',
          father_name: pet.father_name || '',
          father_breed: pet.father_breed || '',
          grandfather_p_name: pet.grandfather_p_name || '',
          grandmother_p_name: pet.grandmother_p_name || '',
          mother_name: pet.mother_name || '',
          mother_breed: pet.mother_breed || '',
          grandfather_m_name: pet.grandfather_m_name || '',
          grandmother_m_name: pet.grandmother_m_name || '',
          avatar: avatarUrl,
        },
        speciesDisplay: speciesDisplay,
        selectedTags: tags,
        selectedTagsIndex: selectedTagsIndex,
      });
    }).catch(function() {
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onInputChange: function(e) {
    formHelpers.onInputChange(this, e);
  },

  chooseAvatar: function() {
    formHelpers.chooseAvatar(this);
  },

  showSpeciesPicker: function() {
    this.setData({ showSpeciesPicker: true });
  },

  hideSpeciesPicker: function() {
    this.setData({ showSpeciesPicker: false });
  },

  onSpeciesSelect: function(e) {
    this.setData({
      'formData.species': e.detail.value,
      speciesDisplay: e.detail.item,
      showSpeciesPicker: false,
    });
  },

  selectGender: function(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      'formData.gender': this.data.formData.gender === gender ? '' : gender,
    });
  },

  onBirthDateChange: function(e) {
    this.setData({ 'formData.birth_date': e.detail.value });
  },

  togglePedigree: function() {
    this.setData({ showPedigree: !this.data.showPedigree });
  },

  toggleTag: function(e) {
    const result = formHelpers.toggleTag(
      this.data.selectedTagsIndex, this.data.selectedTags, e.currentTarget.dataset.tag
    );
    if (result) this.setData(result);
  },

  onNewTagInput: function(e) {
    this.setData({ newTag: e.detail.value });
  },

  addCustomTag: function() {
    const result = formHelpers.addCustomTag(
      this.data.selectedTagsIndex, this.data.selectedTags,
      this.data.customTags, this.data.newTag
    );
    if (result) {
      this.setData(result);
      wx.showToast({ title: '添加成功', icon: 'success' });
    }
  },

  validateForm: function() {
    return formHelpers.validatePetForm(this.data.formData);
  },

  submitForm: function() {
    const that = this;
    if (that.data.loading) return;
    if (!that.validateForm()) return;

    that.setData({ loading: true });

    const petId = that.data.petId;
    const formData = that.data.formData;
    const selectedTags = that.data.selectedTags;

    const uploadData = {
      name: formData.name.trim(),
      species: formData.species,
      breed: formData.breed || null,
      gender: formData.gender || null,
      birth_date: formData.birth_date || null,
      color: formData.color || null,
      chip_no: formData.chip_no || null,
      father_name: formData.father_name || null,
      father_breed: formData.father_breed || null,
      grandfather_p_name: formData.grandfather_p_name || null,
      grandmother_p_name: formData.grandmother_p_name || null,
      mother_name: formData.mother_name || null,
      mother_breed: formData.mother_breed || null,
      grandfather_m_name: formData.grandfather_m_name || null,
      grandmother_m_name: formData.grandmother_m_name || null,
      tags: selectedTags.length > 0 ? selectedTags.join(',') : null,
    };

    const avatarPath = formData.avatar;
    const isNewAvatar = avatarPath && !avatarPath.startsWith('http');

    if (isNewAvatar) {
      wx.uploadFile({
        url: getApp().globalData.baseUrl + '/pets/' + petId,
        filePath: avatarPath,
        name: 'avatar',
        formData: uploadData,
        method: 'PUT',
        header: {
          'Authorization': 'Bearer ' + getApp().globalData.token,
        },
        success: function(res) {
          try {
            const result = JSON.parse(res.data);
            if (result.code === 0) {
              wx.showToast({ title: '修改成功', icon: 'success' });
              setTimeout(function() {
                wx.navigateBack({ delta: 1 });
              }, 1500);
            } else {
              wx.showToast({ title: result.detail || '修改失败', icon: 'none' });
            }
          } catch (e) {
            wx.showToast({ title: '修改失败', icon: 'none' });
          }
          that.setData({ loading: false });
        },
        fail: function() {
          wx.showToast({ title: '上传失败', icon: 'none' });
          that.setData({ loading: false });
        },
      });
    } else {
      const apiData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed || null,
        gender: formData.gender || null,
        birth_date: formData.birth_date || null,
        color: formData.color || null,
        chip_no: formData.chip_no || null,
        father_name: formData.father_name || null,
        father_breed: formData.father_breed || null,
        grandfather_p_name: formData.grandfather_p_name || null,
        grandmother_p_name: formData.grandmother_p_name || null,
        mother_name: formData.mother_name || null,
        mother_breed: formData.mother_breed || null,
        grandfather_m_name: formData.grandfather_m_name || null,
        grandmother_m_name: formData.grandmother_m_name || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
      };

      api.put('/pets/' + petId, apiData).then(function() {
        wx.showToast({ title: '修改成功', icon: 'success' });
        setTimeout(function() {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      }).catch(function() {
        wx.showToast({ title: '修改失败', icon: 'none' });
      }).finally(function() {
        that.setData({ loading: false });
      });
    }
  },
});
