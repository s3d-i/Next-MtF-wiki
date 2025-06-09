import type { CupSizeInfo } from './types';

export const CUP_SIZES: CupSizeInfo[] = [
  { threshold: 4.999999, size: 'AA以下', message: '小妹妹你还不需要穿内衣哦' }, // < 5
  { threshold: 7.5, size: 'AA', message: 'AA，买少女小背心去吧' },
  { threshold: 10, size: 'A', message: '' },
  { threshold: 12.5, size: 'B', message: '' },
  { threshold: 15, size: 'C', message: '' },
  { threshold: 17.5, size: 'D', message: '' },
  { threshold: 20, size: 'E', message: '' },
  { threshold: Infinity, size: 'E+', message: '你胸大你说了算（罩杯超出 MtF.wiki 预设）' }
];


