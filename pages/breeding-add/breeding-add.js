const api = require('../../utils/api');
const analytics = require('../../utils/analytics');

Page({
  data: {
    motherPetId: null,
    motherPetName: '',
    motherPetBreed: '',
    motherPetAvatar: '',
    motherDisabled: false,
    fatherPetId: null,
    fatherPetName: '',
    fatherPetBreed: '',
    fatherPetAvatar: '',
    fatherDisabled: false,
    showMotherPicker: false,
    showFatherPicker: false,
    showFatherError: false,
    motherPetList: [],
    fatherPetList: [],
    formData: {
      breed_date: '',
      breed_method: 'natural',
      breed_count: 1,
      notes: '',
    },
    dueDate: '',
    canSubmit: false,
    loading: false,
    // 近亲检测结果
    inbreedingResult: null,
    showInbreedingWarning: false,
  },

  onLoad: function(options) {
    wx.setNavigationBarTitle({ title: '添加配种' });
    if (options && options.pet_id) {
      // 先加载宠物信息，根据性别自动分配母/父角色
      this.loadPetInfo(options.pet_id, 'auto');
    }
    this.checkCanSubmit();
  },

  loadPetInfo: function(petId, type) {
    const that = this;
    const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
    api.get('/pets/' + petId).then(function(res) {
      if (res) {
        const data = res.data || res;
        const avatar = data.avatar_photo ? baseUrl + data.avatar_photo : '';
        const gender = data.gender || 'female';
        
        // type='auto' 时根据宠物性别自动分配角色
        const assignAs = type;
        if (type === 'auto') {
          assignAs = gender === 'female' ? 'mother' : 'father';
        }

        if (assignAs === 'mother') {
          that.setData({
            motherPetId: petId,
            motherPetName: data.name,
            motherPetBreed: data.breed || '未知品种',
            motherPetAvatar: avatar,
            motherDisabled: true,
          });
          if (that.data.fatherPetId) {
            that.checkInbreeding();
          }
        } else {
          that.setData({
            fatherPetId: petId,
            fatherPetName: data.name,
            fatherPetBreed: data.breed || '未知品种',
            fatherPetAvatar: avatar,
            fatherDisabled: true,
          });
          if (that.data.motherPetId) {
            that.checkInbreeding();
          }
        }
        that.checkCanSubmit();
      }
    }).catch(function(err) {
      console.error('加载宠物信息失败:', err);
    });
  },

  showMotherPicker() {
    this.loadPetList('female');
    this.setData({ showMotherPicker: true });
  },

  hideMotherPicker() {
    this.setData({ showMotherPicker: false });
  },

  showFatherPicker() {
    this.loadPetList('male');
    this.setData({ showFatherPicker: true });
  },

  hideFatherPicker() {
    this.setData({ showFatherPicker: false });
  },

  loadPetList: function(gender) {
    const that = this;
    const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
    const url = '/pets?page=1&pageSize=100';
    if (gender === 'female') {
      url += '&status=active';
    }
    api.get(url).then(function(res) {
      const pets = [];
      if (res) {
        const data = res.data || res;
        if (data.list) {
          pets = data.list;
        } else if (Array.isArray(data)) {
          pets = data;
        }
      }
      const filtered = [];
      for (let i = 0; i < pets.length; i++) {
        if (pets[i].gender === gender) {
          const pet = pets[i];
          if (pet.avatar_photo) {
            pet.avatar_photo = baseUrl + pet.avatar_photo;
          }
          filtered.push(pet);
        }
      }
      if (gender === 'female') {
        that.setData({ motherPetList: filtered });
      } else {
        that.setData({ fatherPetList: filtered });
      }
    }).catch(function(err) {
      console.error('加载宠物列表失败:', err);
    });
  },

  selectMother: function(e) {
    const dataset = e.currentTarget.dataset;
    const id = dataset.id;
    const name = dataset.name;
    const breed = dataset.breed;
    const avatar = dataset.avatar;
    this.setData({
      motherPetId: id,
      motherPetName: name,
      motherPetBreed: breed || '未知品种',
      motherPetAvatar: avatar || '',
      showMotherPicker: false,
    });
    this.checkCanSubmit();
  },

  selectFather: function(e) {
    const dataset = e.currentTarget.dataset;
    const id = dataset.id;
    const name = dataset.name;
    const breed = dataset.breed;
    const avatar = dataset.avatar;
    this.setData({
      fatherPetId: id,
      fatherPetName: name,
      fatherPetBreed: breed || '未知品种',
      fatherPetAvatar: avatar || '',
      showFatherPicker: false,
      showFatherError: false,
    });
    this.checkCanSubmit();
    // 选择父宠后自动检测近亲
    if (this.data.motherPetId) {
      this.checkInbreeding();
    }
  },

  checkInbreeding: function() {
    const that = this;
    if (!this.data.motherPetId || !this.data.fatherPetId) {
      this.setData({ inbreedingResult: null });
      return;
    }

    api.post('/breeding/check-inbreeding', {
      mother_pet_id: this.data.motherPetId,
      father_pet_id: this.data.fatherPetId
    }).then(function(res) {
      if (res && res.data) {
        that.setData({
          inbreedingResult: res.data,
          showInbreedingWarning: res.data.is_inbreeding
        });
      }
    }).catch(function(err) {
      console.error('近亲检测失败:', err);
    });
  },

  onDateChange(e) {
    const date = e.detail.value;
    this.setData({
      'formData.breed_date': date,
    });
    this.calculateDueDate(date);
    this.checkCanSubmit();
  },

  calculateDueDate(date) {
    if (!date) {
      this.setData({ dueDate: '' });
      return;
    }

    const petDate = new Date(date);
    let days = 63;

    if (this.data.motherPetBreed) {
      const catBreeds = ['猫', '英短', '美短', '布偶', '橘猫', '狸花'];
      if (catBreeds.some(b => this.data.motherPetBreed.includes(b))) {
        days = 65;
      }
    }

    const dueDate = new Date(petDate.getTime());
    dueDate.setDate(dueDate.getDate() + days);
    const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;

    this.setData({ dueDate: dueDateStr });
  },

  selectBreedMethod(e) {
    const method = e.currentTarget.dataset.value;
    this.setData({
      'formData.breed_method': method,
    });
  },

  increaseCount() {
    const count = this.data.formData.breed_count;
    if (count < 10) {
      this.setData({
        'formData.breed_count': count + 1,
      });
    }
  },

  decreaseCount() {
    const count = this.data.formData.breed_count;
    if (count > 1) {
      this.setData({
        'formData.breed_count': count - 1,
      });
    }
  },

  onNotesInput(e) {
    this.setData({
      'formData.notes': e.detail.value,
    });
  },

  checkCanSubmit() {
    const { motherPetId, fatherPetId, formData } = this.data;
    const canSubmit = motherPetId && fatherPetId && formData.breed_date;
    this.setData({ canSubmit });
  },

  stopPropagation() {},

  async submitForm() {
    if (!this.data.canSubmit) {
      if (!this.data.fatherPetId) {
        this.setData({ showFatherError: true });
      }
      return;
    }

    this.setData({ loading: true });

    try {
      const data = {
        pet_id: parseInt(this.data.motherPetId),
        father_id: this.data.fatherPetId ? parseInt(this.data.fatherPetId) : null,
        mate_name: this.data.fatherPetName,
        mating_date: this.data.formData.breed_date,
        mating_method: this.data.formData.breed_method === 'natural' ? 'natural' : 'artificial',
        due_date: this.data.dueDate,
        breed_count: this.data.formData.breed_count,
        notes: this.data.formData.notes || null,
      };

      await api.post('/breeding', data);

      // 埋点：添加配种成功
      const hasPhoto = !!this.data.motherPetAvatar;
      analytics.matingAdd(this.data.motherPetBreed || 'unknown', hasPhoto);

      wx.showToast({
        title: '添加成功',
        icon: 'success',
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.showToast({
        title: '保存失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },
});