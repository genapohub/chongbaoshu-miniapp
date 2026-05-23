/**
 * P5 编辑宠物页面 - 按设计稿一比一复刻
 */
var api = require('../../utils/api.js');

Page({
  data: {
    petId: null,
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
      mother_name: '',
      mother_breed: '',
      avatar: '',
    },
    speciesDisplay: {},
    showPedigree: false,
    showSpeciesPicker: false,
    speciesOptions: [
      { value: 'dog', label: '犬', icon: '🐕' },
      { value: 'cat', label: '猫', icon: '🐱' },
      { value: 'bird', label: '鸟', icon: '🐦' },
      { value: 'rabbit', label: '兔', icon: '🐰' },
      { value: 'other', label: '其他', icon: '🐾' },
    ],
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
    var that = this;
    var petId = that.data.petId;
    if (!petId) return;

    api.get('/pets/' + petId).then(function(petRes) {
      var pet = petRes.data || petRes;

      var baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      var birthDate = pet.birth_date ? pet.birth_date.split('T')[0] : '';
      
      var speciesOptions = that.data.speciesOptions;
      var speciesDisplay = {};
      for (var i = 0; i < speciesOptions.length; i++) {
        if (speciesOptions[i].value === pet.species) {
          speciesDisplay = speciesOptions[i];
          break;
        }
      }

      var avatarUrl = '';
      if (pet.avatar_photo) {
        avatarUrl = baseUrl + pet.avatar_photo;
      }

      var tags = pet.tags || [];
      var selectedTagsIndex = {};
      for (var j = 0; j < tags.length; j++) {
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
          mother_name: pet.mother_name || '',
          mother_breed: pet.mother_breed || '',
          avatar: avatarUrl,
        },
        speciesDisplay: speciesDisplay,
        selectedTags: tags,
        selectedTagsIndex: selectedTagsIndex,
      });
    }).catch(function(error) {
      console.error('加载宠物数据失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onInputChange: function(e) {
    var field = e.currentTarget.dataset.field;
    var value = e.detail.value;
    var obj = {};
    obj['formData.' + field] = value;
    this.setData(obj);
  },

  chooseAvatar: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var tempFilePath = res.tempFilePaths[0];
        that.setData({
          'formData.avatar': tempFilePath,
        });
      },
      fail: function() {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  },

  showSpeciesPicker: function() {
    this.setData({ showSpeciesPicker: true });
  },

  hideSpeciesPicker: function() {
    this.setData({ showSpeciesPicker: false });
  },

  stopPropagation: function() {},

  selectSpecies: function(e) {
    var value = e.currentTarget.dataset.value;
    var speciesOptions = this.data.speciesOptions;
    var speciesOption = {};
    for (var i = 0; i < speciesOptions.length; i++) {
      if (speciesOptions[i].value === value) {
        speciesOption = speciesOptions[i];
        break;
      }
    }

    this.setData({
      'formData.species': value,
      speciesDisplay: speciesOption,
      showSpeciesPicker: false,
    });
  },

  selectGender: function(e) {
    var gender = e.currentTarget.dataset.gender;
    var currentGender = this.data.formData.gender;
    var newGender = currentGender === gender ? '' : gender;
    this.setData({
      'formData.gender': newGender,
    });
  },

  onBirthDateChange: function(e) {
    this.setData({
      'formData.birth_date': e.detail.value,
    });
  },

  togglePedigree: function() {
    this.setData({
      showPedigree: !this.data.showPedigree,
    });
  },

  toggleTag: function(e) {
    var tag = e.currentTarget.dataset.tag;

    var selectedTagsIndex = {};
    var oldIndex = this.data.selectedTagsIndex;
    var oldKeys = Object.keys(oldIndex);
    for (var i = 0; i < oldKeys.length; i++) {
      var key = oldKeys[i];
      selectedTagsIndex[key] = oldIndex[key];
    }

    var selectedTags = this.data.selectedTags.slice();

    if (selectedTagsIndex[tag]) {
      delete selectedTagsIndex[tag];
      var index = selectedTags.indexOf(tag);
      if (index > -1) {
        selectedTags.splice(index, 1);
      }
    } else {
      if (selectedTags.length < 5) {
        selectedTagsIndex[tag] = true;
        selectedTags.push(tag);
      } else {
        wx.showToast({ title: '最多选择5个标签', icon: 'none' });
        return;
      }
    }

    this.setData({ selectedTagsIndex: selectedTagsIndex, selectedTags: selectedTags });
  },

  onNewTagInput: function(e) {
    this.setData({
      newTag: e.detail.value,
    });
  },

  addCustomTag: function() {
    var newTag = this.data.newTag.trim();
    if (!newTag) {
      wx.showToast({ title: '请输入标签内容', icon: 'none' });
      return;
    }
    if (this.data.selectedTags.length >= 5) {
      wx.showToast({ title: '最多选择5个标签', icon: 'none' });
      return;
    }
    var hasTag = false;
    for (var i = 0; i < this.data.selectedTags.length; i++) {
      if (this.data.selectedTags[i] === newTag) {
        hasTag = true;
        break;
      }
    }
    if (hasTag) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }

    var customTags = this.data.customTags.slice();
    customTags.push(newTag);

    var selectedTagsIndex = {};
    var oldIndex = this.data.selectedTagsIndex;
    var oldKeys = Object.keys(oldIndex);
    for (var j = 0; j < oldKeys.length; j++) {
      var key = oldKeys[j];
      selectedTagsIndex[key] = oldIndex[key];
    }
    selectedTagsIndex[newTag] = true;

    var selectedTags = this.data.selectedTags.slice();
    selectedTags.push(newTag);

    this.setData({ 
      customTags: customTags, 
      selectedTagsIndex: selectedTagsIndex, 
      selectedTags: selectedTags, 
      newTag: '' 
    });
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  validateForm: function() {
    var name = this.data.formData.name;
    var species = this.data.formData.species;
    if (!name.trim()) {
      wx.showToast({ title: '请输入宠物名称', icon: 'none' });
      return false;
    }
    if (!species) {
      wx.showToast({ title: '请选择物种', icon: 'none' });
      return false;
    }
    return true;
  },

  submitForm: function() {
    var that = this;
    if (!that.validateForm()) return;

    var petId = that.data.petId;
    var formData = that.data.formData;
    var selectedTags = that.data.selectedTags;

    var data = {
      name: formData.name,
      species: formData.species,
      breed: formData.breed || null,
      gender: formData.gender || null,
      birth_date: formData.birth_date || null,
      color: formData.color || null,
      chip_no: formData.chip_no || null,
      father_name: formData.father_name || null,
      father_breed: formData.father_breed || null,
      mother_name: formData.mother_name || null,
      mother_breed: formData.mother_breed || null,
      tags: selectedTags.length > 0 ? selectedTags : null,
    };

    api.put('/pets/' + petId, data).then(function() {
      wx.showToast({ title: '修改成功', icon: 'success' });

      setTimeout(function() {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    }).catch(function(error) {
      console.error('修改宠物失败:', error);
      wx.showToast({ title: '修改失败', icon: 'none' });
    });
  },
});
