import { CUP_SIZES } from './constants';
import type { CupResult, InternationalBraSize, MeasurementData } from './types';

/**
 * 计算罩杯尺寸
 */
export function calculateCupSize(measurements: MeasurementData): CupResult {
  const {
    underBustRelaxed,
    underBustExhale,
    bustRelaxed,
    bustBend45,
    bustBend90,
  } = measurements;

  // 检查所有必需的测量数据是否存在
  if (
    underBustRelaxed === null ||
    underBustExhale === null ||
    bustRelaxed === null ||
    bustBend45 === null ||
    bustBend90 === null
  ) {
    return {
      isValid: false,
      underBust: null,
      cupDifference: null,
      cupSize: null,
      bandSize: null,
      fullSize: null,
      message: '请完成所有测量步骤',
    };
  }

  // 检查数据有效性
  if (
    Number.isNaN(underBustRelaxed) ||
    Number.isNaN(underBustExhale) ||
    Number.isNaN(bustRelaxed) ||
    Number.isNaN(bustBend45) ||
    Number.isNaN(bustBend90) ||
    underBustRelaxed <= 0 ||
    underBustExhale <= 0 ||
    bustRelaxed <= 0 ||
    bustBend45 <= 0 ||
    bustBend90 <= 0
  ) {
    return {
      isValid: false,
      underBust: null,
      cupDifference: null,
      cupSize: null,
      bandSize: null,
      fullSize: null,
      message: '数值错误，请检查输入的数据',
    };
  }

  // 按照原算法计算
  const underBust = (underBustRelaxed + underBustExhale) / 2;
  const cupDifference = (bustRelaxed + bustBend45 + bustBend90) / 3 - underBust;

  if (cupDifference < 0) {
    return {
      isValid: false,
      underBust: underBust,
      cupDifference: cupDifference,
      cupSize: null,
      bandSize: null,
      fullSize: null,
      message: '请检查测量数据',
    };
  }

  // 按照原版逻辑判断罩杯尺寸（使用 <= 判断）
  let cupInfo = null;

  // 循环查找对应的罩杯尺寸
  for (let i = 0; i < CUP_SIZES.length; i++) {
    if (cupDifference <= CUP_SIZES[i].threshold) {
      cupInfo = CUP_SIZES[i];
      break;
    }
  }

  // 理论上不应该出现找不到的情况，因为最后一个threshold是Infinity
  if (!cupInfo) {
    return {
      isValid: false,
      underBust,
      cupDifference,
      cupSize: null,
      bandSize: null,
      fullSize: null,
      message: '计算结果超出预设范围',
    };
  }

  // 计算胸围尺寸（向上取整到最近的5的倍数）
  const bandSize = Math.ceil(underBust / 5) * 5;
  const fullSize = `${bandSize}${cupInfo.size}`;

  // 如果有特殊消息，直接返回
  if (cupInfo.message) {
    return {
      isValid: true,
      underBust,
      cupDifference,
      cupSize: cupInfo.size,
      bandSize,
      fullSize,
      message: cupInfo.message,
    };
  }

  return {
    isValid: true,
    underBust,
    cupDifference,
    cupSize: cupInfo.size,
    bandSize,
    fullSize,
    message: `您的内衣尺寸是：${fullSize}`,
  };
}

/**
 * 格式化数值显示
 */
export function formatValue(value: number | null): string {
  if (value === null) return '—';
  return value.toFixed(1);
}

/**
 * 验证输入值
 */
export function validateInput(value: string): {
  isValid: boolean;
  numValue: number | null;
} {
  if (!value.trim()) {
    return { isValid: false, numValue: null };
  }

  const numValue = Number.parseFloat(value);
  if (Number.isNaN(numValue) || numValue <= 0 || numValue > 200) {
    return { isValid: false, numValue: null };
  }

  return { isValid: true, numValue };
}

/**
 * 检查是否所有测量都已完成
 */
export function isAllMeasurementsComplete(
  measurements: MeasurementData,
): boolean {
  return Object.values(measurements).every(
    (value) => value !== null && !Number.isNaN(value),
  );
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 根据胸下围和罩杯差值计算国际尺码标准
 * 基于维基百科的胸罩尺码标准，直接从测量数据计算各国尺码
 * 参考: https://en.wikipedia.org/wiki/Bra_size
 */
export function calculateInternationalSizes(
  underBust: number,
  cupDifference: number,
): InternationalBraSize | null {
  if (!underBust || !cupDifference || underBust <= 0 || cupDifference <= 0) {
    return null;
  }

  // 欧盟标准罩杯字母 (不同的差值范围)
  let europeCupLetter: string;
  if (cupDifference < 10) europeCupLetter = 'AA以下';
  else if (cupDifference <= 12) europeCupLetter = 'AA';
  else if (cupDifference <= 14) europeCupLetter = 'A';
  else if (cupDifference <= 16) europeCupLetter = 'B';
  else if (cupDifference <= 18) europeCupLetter = 'C';
  else if (cupDifference <= 20) europeCupLetter = 'D';
  else if (cupDifference <= 22) europeCupLetter = 'E';
  else if (cupDifference <= 24) europeCupLetter = 'F';
  else if (cupDifference <= 26) europeCupLetter = 'G';
  else if (cupDifference <= 28) europeCupLetter = 'H';
  else europeCupLetter = 'I+';

  const europeBand = Math.ceil(underBust / 5) * 5;

  return {
    europe: `${europeBand}${europeCupLetter}`,
  };
}
