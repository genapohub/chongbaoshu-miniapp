const app = getApp();
const { get } = require('../../utils/api');

Page({
  data: { pet: null, canvasW: 375, canvasH: 500 },

  onLoad(options) {
    const petId = options.pet_id;
    if (!petId) return;
    get(`/api/pets/${petId}`).then(res => {
      if (res.code === 0) {
        this.setData({ pet: res.data }, () => this.drawCard());
      }
    });
  },

  drawCard() {
    const pet = this.data.pet;
    if (!pet) return;

    const query = wx.createSelectorQuery();
    query.select('#shareCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0] || !res[0].node) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      const w = 375, h = 500;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      // 背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);

      // 顶部条
      ctx.fillStyle = '#4A8C5C';
      ctx.fillRect(0, 0, w, 60);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('宠宝树认证宠舍', w/2, 38);

      // 宠物名称+品种
      ctx.fillStyle = '#1A1A1A';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(pet.name || '', w/2, 100);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#8F959E';
      const breedText = pet.breed || pet.species || '';
      ctx.fillText(breedText, w/2, 122);

      // 分隔线
      ctx.strokeStyle = '#F0F0F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, 140);
      ctx.lineTo(w - 24, 140);
      ctx.stroke();

      // 信息行
      let y = 170;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      if (pet.gender) { ctx.fillStyle = '#666'; ctx.fillText(`性别：${pet.gender}`, 32, y); y += 24; }
      if (pet.birth_date) { ctx.fillText(`生日：${pet.birth_date}`, 32, y); y += 24; }
      if (pet.color) { ctx.fillText(`毛色：${pet.color}`, 32, y); y += 24; }

      // 价格
      if (pet.price) {
        ctx.fillStyle = '#E34D59';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`¥${(pet.price / 100).toFixed(0)}`, w/2, y + 30);
        y += 60;
      }

      // 血统
      if (pet.fatherName || pet.motherName) {
        y += 10;
        ctx.fillStyle = '#4A8C5C';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('血统信息', 32, y);
        y += 22;
        ctx.fillStyle = '#666';
        ctx.font = '13px sans-serif';
        if (pet.fatherName) { ctx.fillText(`父：${pet.fatherName}`, 32, y); y += 20; }
        if (pet.motherName) { ctx.fillText(`母：${pet.motherName}`, 32, y); y += 20; }
      }

      // 底部
      ctx.fillStyle = '#F6F4F0';
      ctx.fillRect(0, h - 40, w, 40);
      ctx.fillStyle = '#B0B0B0';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('扫码查看完整血统证书 · 宠宝树', w/2, h - 14);

      this._canvas = canvas;
    });
  },

  saveToAlbum() {
    if (!this._canvas) return;
    wx.canvasToTempFilePath({
      canvas: this._canvas,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: () => wx.showToast({ title: '保存失败，请检查相册权限', icon: 'none' }),
        });
      },
    });
  },
});
