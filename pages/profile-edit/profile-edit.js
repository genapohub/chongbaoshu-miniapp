const api = require('../../utils/api.js');

Page({
  data: {
    formData: {
      kennel_logo: '',
      kennel_name: '',
      region: [],
      address: '',
      kennel_intro: '',
      phone: '',
      wechat: '',
    },
    breedTags: [],
    selectedBreedsIndex: {},
    customBreeds: [],
    availableBreeds: ['金毛', '拉布拉多', '柯基', '泰迪', '哈士奇', '萨摩耶', '边境牧羊犬', '德国牧羊犬'],
    newBreed: '',
    introLength: 0,
    canSubmit: false,
    loading: false,
  },

  onLoad() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      const res = await api.get('/auth/profile');
      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');

      let region = [];
      let address = '';
      if (res.kennel_address) {
        const parts = res.kennel_address.split(' ');
        if (parts.length >= 3) {
          region = [parts[0], parts[1], parts[2]];
          address = parts.slice(3).join(' ');
        } else {
          address = res.kennel_address;
        }
      }

      let breedTags = [];
      if (res.main_breeds) {
        try {
          breedTags = typeof res.main_breeds === 'string' ? JSON.parse(res.main_breeds) : res.main_breeds;
        } catch (e) {
          breedTags = [];
        }
      }

      const selectedBreedsIndex = {};
      const customBreeds = [];
      breedTags.forEach(tag => {
        selectedBreedsIndex[tag] = true;
        if (!this.data.availableBreeds.includes(tag)) {
          customBreeds.push(tag);
        }
      });

      const logoUrl = res.kennel_logo ? (res.kennel_logo.startsWith('http') ? res.kennel_logo : `${baseUrl}${res.kennel_logo}`) : '';

      this.setData({
        formData: {
          kennel_logo: logoUrl,
          kennel_name: res.kennel_name || '',
          region,
          address,
          kennel_intro: res.kennel_intro || '',
          phone: res.phone || '',
          wechat: res.wechat || '',
        },
        breedTags,
        selectedBreedsIndex,
        customBreeds,
        introLength: (res.kennel_intro || '').length,
      });
      this.checkCanSubmit();
    } catch (error) {
      console.error('加载资料失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  chooseLogo() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'formData.kennel_logo': res.tempFilePaths[0],
        });
      },
      fail: () => {
        wx.showToast({ title: '选择图片失败', icon: 'none' });
      },
    });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value,
    });
    this.checkCanSubmit();
  },

  onRegionChange(e) {
    this.setData({
      'formData.region': e.detail.value,
    });
  },

  onIntroInput(e) {
    const value = e.detail.value;
    this.setData({
      'formData.kennel_intro': value,
      introLength: value.length,
    });
  },

  toggleBreed(e) {
    const breed = e.currentTarget.dataset.breed;
    const selectedBreedsIndex = { ...this.data.selectedBreedsIndex };
    const breedTags = [...this.data.breedTags];

    if (selectedBreedsIndex[breed]) {
      delete selectedBreedsIndex[breed];
      const index = breedTags.indexOf(breed);
      if (index > -1) {
        breedTags.splice(index, 1);
      }
    } else {
      if (breedTags.length >= 5) {
        wx.showToast({ title: '最多选择5个品种', icon: 'none' });
        return;
      }
      selectedBreedsIndex[breed] = true;
      breedTags.push(breed);
    }

    this.setData({ selectedBreedsIndex, breedTags });
  },

  onNewBreedInput(e) {
    this.setData({
      newBreed: e.detail.value,
    });
  },

  addCustomBreed() {
    const newBreed = this.data.newBreed.trim();
    if (!newBreed) {
      wx.showToast({ title: '请输入品种名称', icon: 'none' });
      return;
    }
    if (this.data.breedTags.length >= 5) {
      wx.showToast({ title: '最多选择5个品种', icon: 'none' });
      return;
    }
    if (this.data.selectedBreedsIndex[newBreed]) {
      wx.showToast({ title: '品种已存在', icon: 'none' });
      return;
    }

    const customBreeds = [...this.data.customBreeds, newBreed];
    const breedTags = [...this.data.breedTags, newBreed];
    const selectedBreedsIndex = { ...this.data.selectedBreedsIndex, [newBreed]: true };

    this.setData({ customBreeds, breedTags, selectedBreedsIndex, newBreed: '' });
    wx.showToast({ title: '添加成功', icon: 'success' });
  },

  checkCanSubmit() {
    const canSubmit = this.data.formData.kennel_name.trim().length > 0;
    this.setData({ canSubmit });
  },

  async submitForm() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: '请填写宠舍名称', icon: 'none' });
      return;
    }
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const { formData, breedTags } = this.data;
      const regionStr = formData.region.join(' ');
      const kennelAddress = (regionStr + ' ' + formData.address).trim();

      const data = {
        kennel_name: formData.kennel_name,
        kennel_address: kennelAddress,
        kennel_intro: formData.kennel_intro,
        kennel_logo: formData.kennel_logo,
        main_breeds: JSON.stringify(breedTags),
        phone: formData.phone,
        wechat: formData.wechat,
      };

      await api.put('/auth/profile', data);
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
