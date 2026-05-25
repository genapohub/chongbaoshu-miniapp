const api = require('../../utils/api');
const analytics = require('../../utils/analytics');

Page({
  data: {
    petId: null,
    pet: {},
    pedigree: {},
    isPro: false,
    loading: false,
    showCertPreview: false,
    certPreviewData: {},
    showEditPedigree: false,
    editFormData: {
      father_name: '',
      father_breed: '',
      grandfather_p_name: '',
      grandmother_p_name: '',
      mother_name: '',
      mother_breed: '',
      grandfather_m_name: '',
      grandmother_m_name: '',
    },
    savingPedigree: false,
  },

  onLoad(options) {
    if (options.pet_id) {
      this.setData({ petId: options.pet_id });

      // 埋点：查看血统证书详情
      analytics.pedigreeView(options.pet_id, '3');

      this.loadData();
    }
  },

  loadData() {
    const that = this;
    const petId = this.data.petId;
    
    that.setData({ loading: true });

    Promise.all([
      api.get('/pets/' + petId),
      api.get('/pets/' + petId + '/pedigree'),
      api.get('/auth/limits').catch(() => null),
    ]).then((results) => {
      const petRes = results[0];
      const pedigreeRes = results[1];
      const limitsRes = results[2];

      const baseUrl = getApp().globalData.baseUrl.replace('/api', '');
      const pet = petRes;
      const avatar = pet.avatar_photo ? baseUrl + pet.avatar_photo : '';
      
      // 处理pedigree数据（api.get已自动解包data）
      const pedigreeData = pedigreeRes;

      that.setData({
        pet: {
          id: pet.id,
          name: pet.name,
          breed: pet.breed || '',
          species: pet.species || '',
          avatar: avatar,
          color: pet.color || '',
          chipNo: pet.chip_no || pet.chip_number || '',
          birth_date: pet.birth_date || '',
          gender: pet.gender || '',
          speciesIcon: that.getSpeciesIcon(pet.species),
        },
        pedigree: {
          registration_name: pedigreeData.registration_name || pedigreeData.pet_name || '',
          registration_number: pedigreeData.registration_number || pedigreeData.chip_number || '',
          platformCertNo: pedigreeData.platform_cert_no || '',
          kennel_name: pedigreeData.kennel_name || '',
          color: pedigreeData.color || pet.color || '',
          inbreed_coefficient: pedigreeData.inbreed_coefficient || null,
          // 父亲
          father_name: pedigreeData.father_name || '—',
          father_breed: pedigreeData.father_breed || '',
          // 母亲
          mother_name: pedigreeData.mother_name || '—',
          mother_breed: pedigreeData.mother_breed || '',
          // 父方祖父
          father_father_name: pedigreeData.father_father_name || '—',
          father_father_breed: pedigreeData.father_father_breed || '',
          // 父方祖母
          father_mother_name: pedigreeData.father_mother_name || '—',
          father_mother_breed: pedigreeData.father_mother_breed || '',
          // 父方祖父的父亲
          father_father_father_name: pedigreeData.father_father_father_name || '—',
          // 父方祖父的母亲
          father_father_mother_name: pedigreeData.father_father_mother_name || '—',
          // 父方祖母的父亲
          father_mother_father_name: pedigreeData.father_mother_father_name || '—',
          // 父方祖母的母亲
          father_mother_mother_name: pedigreeData.father_mother_mother_name || '—',
          // 母方祖父
          mother_father_name: pedigreeData.mother_father_name || '—',
          mother_father_breed: pedigreeData.mother_father_breed || '',
          // 母方祖母
          mother_mother_name: pedigreeData.mother_mother_name || '—',
          mother_mother_breed: pedigreeData.mother_mother_breed || '',
          // 母方祖父的父亲
          mother_father_father_name: pedigreeData.mother_father_father_name || '—',
          // 母方祖父的母亲
          mother_father_mother_name: pedigreeData.mother_father_mother_name || '—',
          // 母方祖母的父亲
          mother_mother_father_name: pedigreeData.mother_mother_father_name || '—',
          // 母方祖母的母亲
          mother_mother_mother_name: pedigreeData.mother_mother_mother_name || '—',
        },
        isPro: limitsRes && limitsRes.tier === 'pro',
        loading: false,
      });

      wx.setNavigationBarTitle({ title: '血统证书' });
    }).catch((err) => {
      console.error('加载血统信息失败:', err);
      that.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  getSpeciesIcon(species) {
    const icons = {
      dog: '🐕',
      cat: '🐈',
    };
    return icons[species] || '🐾';
  },

  previewAvatar() {
    if (this.data.pet.avatar) {
      wx.previewImage({
        urls: [this.data.pet.avatar],
      });
    }
  },

  previewCert() {
    const that = this;
    const pet = this.data.pet;
    const pedigree = this.data.pedigree;

    // 如果平台认证编号为空且是 Pro 用户，自动分配
    if (!pedigree.platformCertNo && this.data.isPro) {
      wx.showLoading({ title: '分配认证编号...' });
      api.post('/pets/' + that.data.petId + '/assign-cert-no').then(function (res) {
        wx.hideLoading();
        // 更新 pedigree 中的 platformCertNo
        pedigree.platformCertNo = res.platform_cert_no;
        that.setData({
          pedigree: pedigree,
        });
        that._showCertPreview();
      }).catch(function (err) {
        wx.hideLoading();
        console.error('分配认证编号失败:', err);
        // 失败时仍展示预览，编号显示"未分配"
        that._showCertPreview();
      });
      return;
    }

    // 非 Pro 用户直接展示预览
    that._showCertPreview();
  },

  /** 实际展示证书预览 */
  _showCertPreview() {
    const pet = this.data.pet;
    const pedigree = this.data.pedigree;
    const now = new Date();
    const year = now.getFullYear();
    let month = now.getMonth() + 1;
    if (month < 10) month = '0' + month;
    let day = now.getDate();
    if (day < 10) day = '0' + day;
    // 确定证书编号：有平台认证编号则用，否则用临时预览编号
    const tempCertNo = 'CBS-' + year + month + day + '-PREVIEW';
    const certNo = pedigree.platformCertNo || tempCertNo;

    // 确定 platformCertNo 显示值
    let platformCertNoDisplay = '未分配';
    if (pedigree.platformCertNo) {
      platformCertNoDisplay = pedigree.platformCertNo;
    } else if (!this.data.isPro) {
      platformCertNoDisplay = '升级 Pro 获取';
    }

    this.setData({
      showCertPreview: true,
      certPreviewData: {
        petName: pet.name || '—',
        breed: pet.breed || '—',
        gender: pet.gender === 'male' ? '♂ 公' : (pet.gender === 'female' ? '♀ 母' : '—'),
        color: pet.color || '—',
        platformCertNo: platformCertNoDisplay,
        kennelName: pedigree.kennel_name || '—',
        birthDate: pet.birth_date || '—',
        fatherName: pedigree.father_name || '—',
        motherName: pedigree.mother_name || '—',
        certNo: certNo,
      }
    });
  },

  hideCertPreview() {
    this.setData({ showCertPreview: false });
  },

  noop() {},

  copyCertLink() {
    const path = '/pages/pedigree-cert/pedigree-cert?pet_id=' + this.data.petId;
    wx.setClipboardData({
      data: path,
      success: function () {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  },

  downloadCert() {
    const that = this;
    wx.showLoading({ title: '生成证书图片...' });

    // 使用离屏 Canvas 绘制证书图片
    const query = wx.createSelectorQuery();
    query.select('#certPreviewCanvas').fields({ node: true, size: true }).exec(function (res) {
      if (!res || !res[0]) {
        wx.hideLoading();
        wx.showToast({ title: '生成失败，请重试', icon: 'none' });
        return;
      }

      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;

      // 证书卡片尺寸（逻辑像素）
      let cardWidth = 600;
      let cardHeight = 780;
      canvas.width = cardWidth * dpr;
      canvas.height = cardHeight * dpr;
      ctx.scale(dpr, dpr);

      // 背景渐变（金色证书风格）
      const bgGradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
      bgGradient.addColorStop(0, '#FFF8E1');
      bgGradient.addColorStop(0.3, '#FFFDF5');
      bgGradient.addColorStop(0.6, '#FFFFFF');
      bgGradient.addColorStop(1, '#FFF8E1');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // 金色边框
      ctx.strokeStyle = '#D4A853';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, cardWidth - 4, cardHeight - 4);

      // 奖章图标（emoji 渲染）
      ctx.font = '60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏅', cardWidth / 2, 90);

      // 标题
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#8B6914';
      ctx.fillText('宠宝树 血统证书', cardWidth / 2, 140);

      // 宠物名
      const data = that.data.certPreviewData;
      ctx.font = 'bold 44px sans-serif';
      ctx.fillStyle = '#333';
      ctx.fillText(data.petName, cardWidth / 2, 200);

      // 分隔线
      ctx.strokeStyle = '#D4A853';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardWidth / 2 - 60, 220);
      ctx.lineTo(cardWidth / 2 + 60, 220);
      ctx.stroke();

      // 信息行
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#666';
      const lines = [
        data.breed + ' · ' + data.gender + ' · ' + data.color,
        '平台认证编号：' + data.platformCertNo,
        '犬舍：' + data.kennelName,
        '出生日：' + data.birthDate,
        '父：' + data.fatherName + ' · 母：' + data.motherName,
      ];
      let y = 260;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], cardWidth / 2, y);
        y += 36;
      }

      // QR 码占位（方形图案）
      y += 16;
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(cardWidth / 2 - 60, y, 120, 120);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText('扫码验证', cardWidth / 2, y + 55);
      ctx.fillText('真伪', cardWidth / 2, y + 78);

      // 证书编号
      y += 150;
      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText('证书编号：' + data.certNo, cardWidth / 2, y);

      // 导出图片
      wx.canvasToTempFilePath({
        canvas: canvas,
        success: function (resTemp) {
          wx.hideLoading();
          wx.saveImageToPhotosAlbum({
            filePath: resTemp.tempFilePath,
            success: function () {
              wx.showToast({ title: '已保存到相册', icon: 'success' });
            },
            fail: function (err) {
              if (err.errMsg.indexOf('auth deny') !== -1) {
                wx.showModal({
                  title: '需要相册权限',
                  content: '请在设置中允许访问相册',
                  showCancel: false,
                });
              } else {
                wx.showToast({ title: '保存失败', icon: 'none' });
              }
            }
          });
        },
        fail: function () {
          wx.hideLoading();
          wx.showToast({ title: '生成失败，请重试', icon: 'none' });
        }
      });
    });
  },

  onShareAppMessage() {
    const data = this.data.certPreviewData;
    return {
      title: data.petName + ' 的血统证书 - 宠宝树',
      path: '/pages/pedigree-cert/pedigree-cert?pet_id=' + this.data.petId,
      imageUrl: '',
    };
  },

  editPedigree() {
    // Pro 权限检查
    if (!this.data.isPro) {
      wx.showModal({
        title: 'Pro 专属功能',
        content: '编辑血统信息为 Pro 专属功能，升级 Pro 即可使用',
        confirmText: '了解 Pro',
        cancelText: '暂不',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/subscription/subscription' });
          }
        }
      });
      return;
    }

    // 用当前 pedigree 数据填充表单
    const pedigree = this.data.pedigree;
    this.setData({
      showEditPedigree: true,
      editFormData: {
        father_name: pedigree.father_name && pedigree.father_name !== '—' ? pedigree.father_name : '',
        father_breed: pedigree.father_breed || '',
        grandfather_p_name: pedigree.father_father_name && pedigree.father_father_name !== '—' ? pedigree.father_father_name : '',
        grandmother_p_name: pedigree.father_mother_name && pedigree.father_mother_name !== '—' ? pedigree.father_mother_name : '',
        mother_name: pedigree.mother_name && pedigree.mother_name !== '—' ? pedigree.mother_name : '',
        mother_breed: pedigree.mother_breed || '',
        grandfather_m_name: pedigree.mother_father_name && pedigree.mother_father_name !== '—' ? pedigree.mother_father_name : '',
        grandmother_m_name: pedigree.mother_mother_name && pedigree.mother_mother_name !== '—' ? pedigree.mother_mother_name : '',
      }
    });
  },

  hideEditPedigree() {
    this.setData({ showEditPedigree: false });
  },

  onEditInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const obj = {};
    obj['editFormData.' + field] = value;
    this.setData(obj);
  },

  savePedigree() {
    const that = this;
    if (that.data.savingPedigree) return;

    // 必填校验：父亲名和母亲名
    const formData = that.data.editFormData;
    if (!formData.father_name.trim()) {
      wx.showToast({ title: '请填写父亲名', icon: 'none' });
      return;
    }
    if (!formData.mother_name.trim()) {
      wx.showToast({ title: '请填写母亲名', icon: 'none' });
      return;
    }

    that.setData({ savingPedigree: true });

    const apiData = {
      father_name: formData.father_name.trim() || null,
      father_breed: formData.father_breed.trim() || null,
      grandfather_p_name: formData.grandfather_p_name.trim() || null,
      grandmother_p_name: formData.grandmother_p_name.trim() || null,
      mother_name: formData.mother_name.trim() || null,
      mother_breed: formData.mother_breed.trim() || null,
      grandfather_m_name: formData.grandfather_m_name.trim() || null,
      grandmother_m_name: formData.grandmother_m_name.trim() || null,
    };

    api.put('/pets/' + that.data.petId, apiData).then(function () {
      wx.showToast({ title: '保存成功', icon: 'success' });
      that.setData({ showEditPedigree: false, savingPedigree: false });
      // 重新加载血统数据
      that.loadData();
    }).catch(function (err) {
      console.error('保存血统信息失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
      that.setData({ savingPedigree: false });
    });
  },
});
