export interface MeasurementData {
  underBustRelaxed: number | null;    // 胸下围放松时
  underBustExhale: number | null;     // 胸下围呼气时
  bustRelaxed: number | null;         // 胸围放松时
  bustBend45: number | null;          // 胸围俯身45度
  bustBend90: number | null;          // 胸围鞠躬90度
}

export interface CupResult {
  isValid: boolean;
  underBust: number | null;           // 计算得出的胸下围
  cupDifference: number | null;       // 罩杯差值
  cupSize: string | null;             // 罩杯大小
  bandSize: number | null;            // 胸围尺寸
  fullSize: string | null;            // 完整尺寸 (如 "75B")
  message: string;                    // 结果消息
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  measurements: MeasurementData;
  result: CupResult;
}

export interface CalculatorState {
  measurements: MeasurementData;
  result: CupResult | null;
  isCalculating: boolean;
}

export interface CupSizeInfo {
  threshold: number;
  size: string;
  message: string;
}
