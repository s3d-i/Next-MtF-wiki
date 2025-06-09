import type { MeasurementData, CupResult } from './types';
import { CUP_SIZES } from './constants';

/**
 * 计算罩杯尺寸
 */
export function calculateCupSize(measurements: MeasurementData): CupResult {
  const { underBustRelaxed, underBustExhale, bustRelaxed, bustBend45, bustBend90 } = measurements;

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
      message: '请完成所有测量步骤'
    };
  }

  // 检查数据有效性
  if (
    isNaN(underBustRelaxed) || 
    isNaN(underBustExhale) || 
    isNaN(bustRelaxed) || 
    isNaN(bustBend45) || 
    isNaN(bustBend90) ||
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
      message: '数值错误，请检查输入的数据'
    };
  }

  // 按照原算法计算
  const underBust = (underBustRelaxed + underBustExhale) / 2;
  const cupDifference = (bustRelaxed + bustBend45 + bustBend90) / 3 - underBust;

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
      message: '计算结果超出预设范围'
    };
  }

  // 如果有特殊消息，直接返回
  if (cupInfo.message) {
    return {
      isValid: true,
      underBust,
      cupDifference,
      cupSize: cupInfo.size,
      bandSize: null,
      fullSize: null,
      message: cupInfo.message
    };
  }

  // 计算胸围尺寸（向上取整到最近的5的倍数）
  const bandSize = Math.ceil(underBust / 5) * 5;
  const fullSize = `${bandSize}${cupInfo.size}`;

  return {
    isValid: true,
    underBust,
    cupDifference,
    cupSize: cupInfo.size,
    bandSize,
    fullSize,
    message: `您的内衣尺寸是：${fullSize}`
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
export function validateInput(value: string): { isValid: boolean; numValue: number | null } {
  if (!value.trim()) {
    return { isValid: false, numValue: null };
  }
  
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue <= 0 || numValue > 200) {
    return { isValid: false, numValue: null };
  }
  
  return { isValid: true, numValue };
}

/**
 * 检查是否所有测量都已完成
 */
export function isAllMeasurementsComplete(measurements: MeasurementData): boolean {
  return Object.values(measurements).every(value => value !== null && !isNaN(value));
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
    minute: '2-digit'
  });
}
