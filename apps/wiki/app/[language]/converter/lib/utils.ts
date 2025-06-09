import type { HormoneType, HormoneUnit, ConversionResult, HormoneRange } from './types';
import { HORMONES } from './constants';

/**
 * 获取激素类型
 */
export function getHormoneById(id: string): HormoneType | undefined {
  return HORMONES.find(hormone => hormone.id === id);
}

/**
 * 获取单位信息
 */
export function getUnitBySymbol(hormone: HormoneType, symbol: string): HormoneUnit | undefined {
  return hormone.units.find(unit => unit.symbol === symbol);
}

/**
 * 执行单位转换
 */
export function convertHormoneValue(
  value: number,
  fromUnit: string,
  toUnit: string,
  hormone: HormoneType
): number {
  const fromUnitInfo = getUnitBySymbol(hormone, fromUnit);
  const toUnitInfo = getUnitBySymbol(hormone, toUnit);
  
  if (!fromUnitInfo || !toUnitInfo) {
    throw new Error('Invalid unit');
  }
  
  // 转换为基础单位
  const baseValue = value * fromUnitInfo.multiplier;
  
  // 从基础单位转换为目标单位
  const result = baseValue / toUnitInfo.multiplier;
  
  return result;
}

/**
 * 检查数值是否在合理范围内，返回所有符合的范围
 */
export function checkValueRanges(
  value: number,
  unit: string,
  hormone: HormoneType
): HormoneRange[] {
  // 将值转换为基础单位进行比较
  const unitInfo = getUnitBySymbol(hormone, unit);
  if (!unitInfo) return [];

  const baseValue = value * unitInfo.multiplier;
  const matchingRanges: HormoneRange[] = [];

  // 查找所有匹配的范围
  for (const range of hormone.ranges) {
    const rangeUnitInfo = getUnitBySymbol(hormone, range.unit);
    if (!rangeUnitInfo) continue;

    const rangeMinBase = range.min * rangeUnitInfo.multiplier;
    const rangeMaxBase = range.max * rangeUnitInfo.multiplier;

    if (baseValue >= rangeMinBase && baseValue <= rangeMaxBase) {
      matchingRanges.push(range);
    }
  }

  return matchingRanges;
}

/**
 * 执行完整的转换并返回结果
 */
export function performConversion(
  inputValue: string,
  fromUnit: string,
  toUnit: string,
  hormoneId: string
): ConversionResult {
  const hormone = getHormoneById(hormoneId);
  if (!hormone) {
    return { value: 0, unit: toUnit, isValid: false };
  }
  
  const numValue = parseFloat(inputValue);
  if (isNaN(numValue) || numValue < 0) {
    return { value: 0, unit: toUnit, isValid: false };
  }
  
  try {
    const convertedValue = convertHormoneValue(numValue, fromUnit, toUnit, hormone);
    const ranges = checkValueRanges(convertedValue, toUnit, hormone);

    return {
      value: convertedValue,
      unit: toUnit,
      isValid: true,
      ranges,
    };
  } catch (error) {
    return { value: 0, unit: toUnit, isValid: false };
  }
}

/**
 * 格式化数值显示
 */
export function formatValue(value: number): string {
  if (value === 0) return '0';
  
  // 根据数值大小选择合适的精度
  if (value >= 1000) {
    return value.toFixed(0);
  } else if (value >= 100) {
    return value.toFixed(1);
  } else if (value >= 10) {
    return value.toFixed(2);
  } else if (value >= 1) {
    return value.toFixed(3);
  } else {
    return value.toFixed(4);
  }
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) {
    return '刚刚';
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}
