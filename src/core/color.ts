import type { PortTheme } from './types';

/**
 * 黄金分割常数，用于在色轮上生成分布极度均匀、绝不沉闷的美学霓虹色
 */
const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

/**
 * HSL 转 Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * 根据端口名称或随机种子生成一个高饱和度、专为暗黑画布设计的霓虹色彩主题
 */
export function generateNeonTheme(seedName?: string): PortTheme {
  let hue: number;

  if (seedName) {
    // 字符串哈希算法
    let hash = 0;
    for (let i = 0; i < seedName.length; i++) {
      hash = seedName.charCodeAt(i) + ((hash << 5) - hash);
    }
    hue = Math.floor(((Math.abs(hash) * GOLDEN_RATIO_CONJUGATE) % 1) * 360);
  } else {
    // 随机色相
    hue = Math.floor(Math.random() * 360);
  }

  const saturation = 88;
  const lightness = 62;
  const hex = hslToHex(hue, saturation, lightness);

  return {
    color: hex,
    glow: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.65)`,
    name: seedName || 'custom',
  };
}

/**
 * 辅助工具：根据 hex 颜色动态生成对应的 glow 光晕色
 */
export function getGlowFromHex(hex: string, opacity = 0.65): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 245;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 158;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 11;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
