export interface HormoneUnit {
  name: string;
  symbol: string;
  multiplier: number; // 转换为基础单位的乘数
}

export interface HormoneType {
  id: string;
  name: string;
  baseUnit: string; // 基础单位
  units: HormoneUnit[];
  ranges: HormoneRange[];
  molecularWeight?: number; // 分子量，用于摩尔单位转换
}

export interface HormoneRange {
  label: string;
  min: number;
  max: number;
  unit: string;
  description: string;
  color: 'success' | 'warning' | 'error' | 'info';
  iconType?: 'male' | 'female' | 'target' | 'success' | 'warning' | 'error' | 'info';
  source: {
    name: string; // 数据来源名称
    url: string;  // 数据来源链接
  };
}

export interface ConversionResult {
  value: number;
  unit: string;
  isValid: boolean;
  ranges?: HormoneRange[];
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  hormoneId: string;
  fromValue: number;
  fromUnit: string;
  toValue: number;
  toUnit: string;
}

export interface ConversionState {
  selectedHormone: string;
  inputValue: string;
  fromUnit: string;
  toUnit: string;
  result: ConversionResult | null;
}
