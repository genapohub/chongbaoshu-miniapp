/**
 * cbs-icon — 宠宝树图标组件
 * 用 emoji 替代不支持的 <icon> 自定义标签
 */
Component({
  properties: {
    name: { type: String, value: '' },
    size: { type: Number, value: 36 },
    color: { type: String, value: '#333' },
    bg: { type: String, value: '' },
  },
  data: { char: '' },
  lifetimes: {
    attached() {
      this.updateIcon();
    },
  },
  observers: {
    'name'(val) { this.updateIcon(); },
  },
  methods: {
    updateIcon() {
      this.setData({ char: ICON_MAP[this.data.name] || '●' });
    },
  },
});

const ICON_MAP = {
  'arrow-left': '←',    'chevron-left': '‹',
  'chevron-right': '›',  'chevron-down': '⌄',
  'camera': '📷',        'close': '✕',
  'check': '✓',          'check-circle': '✓',
  'plus': '＋',           'minus': '－',
  'add': '＋',
  'diamond': '◆',        'star': '★',
  'heart': '♥',          'gift': '🎁',
  'clipboard': '📋',     'syringe': '💉',
  'bug': '🐛',           'paw': '🐾',
  'bell': '🔔',          'certificate': '📜',
  'trophy': '🏆',        'tree': '🌳',
  'chart': '📊',         'money': '💰',
  'credit-card': '💳',   'clock': '🕐',
  'chat': '💬',          'warning': '⚠',
  'pregnant': '🤰',      'baby': '👶',
  'qrcode': '📱',        'upload': '⬆',
  'download': '⬇',      'share': '↗',
  'refresh': '↻',        'trash': '🗑',
  'ban': '🚫',           'lightbulb': '💡',
  'trending': '📈',      'announcement': '📢',
  'tool': '🔧',          'medal': '🏅',
  'broken-heart': '💔',  'celebration': '🎉',
  'lock': '🔒',          'alert-circle': '⚠',
};
