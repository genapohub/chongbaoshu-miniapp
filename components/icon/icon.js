/**
 * 飞书风格图标组件
 *
 * Properties:
 *   name   {String}  - 图标名称（见 constants/icons.js）
 *   size   {String}  - 图标尺寸（rpx），默认 40
 *   color  {String}  - 图标颜色，默认 #1F2329
 *   bg     {String}  - 背景色（可选，有值时渲染为圆形背景图标）
 *   radius {String}  - 背景圆角，默认 50%（圆形）
 */
const { icons, svgToUri } = require('../../constants/icons');

Component({
  properties: {
    v: { type: String, value: '' },
    name: { type: String, value: '' },
    size: { type: String, value: '40' },
    color: { type: String, value: '#1F2329' },
    bg: { type: String, value: '' },
    radius: { type: String, value: '50%' },
  },

  data: {
    iconSrc: '',
    hasBg: false,
  },

  observers: {
    'name,color,v'(name, color, v) {
      if (!name || !icons[name]) return;
      const svg = icons[name];
      if (svg) {
        this.setData({
          iconSrc: svgToUri(svg, color),
          hasBg: !!this.properties.bg,
        });
      }
    },
  },

  lifetimes: {
    attached() {
      const { name, color, bg } = this.properties;
      if (name && icons[name]) {
        this.setData({
          iconSrc: svgToUri(icons[name], color),
          hasBg: !!bg,
        });
      }
    },
  },
});
