'use client';

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { DEFAULT_HORMONE, HORMONES } from './constants';
import type { ConversionState, HistoryRecord, HormoneType } from './types';

/**
 * 检查两个单位是否等价（multiplier相同）
 */
function areUnitsEquivalentInAtoms(
  hormone: HormoneType,
  unit1Symbol: string,
  unit2Symbol: string,
): boolean {
  const unit1 = hormone.units.find((u) => u.symbol === unit1Symbol);
  const unit2 = hormone.units.find((u) => u.symbol === unit2Symbol);

  if (!unit1 || !unit2) return false;

  // 比较multiplier值，考虑浮点数精度
  return Math.abs(unit1.multiplier - unit2.multiplier) < 1e-10;
}

/**
 * 获取激素的默认单位组合，优先选择常用单位，避免等价单位
 */
function getDefaultUnits(hormone: HormoneType): {
  fromUnit: string;
  toUnit: string;
} {
  const commonUnits = hormone.units.filter(
    (unit) => unit.category === 'common',
  );

  if (commonUnits.length >= 2) {
    // 如果有2个或以上常用单位，选择非等价的两个单位
    const fromUnit = commonUnits[0];

    // 寻找第一个与fromUnit不等价的常用单位
    const toUnit = commonUnits.find(
      (unit) =>
        !areUnitsEquivalentInAtoms(hormone, fromUnit.symbol, unit.symbol),
    );

    if (toUnit) {
      return {
        fromUnit: fromUnit.symbol,
        toUnit: toUnit.symbol,
      };
    } else {
      // 如果所有常用单位都等价，则从所有单位中寻找非等价单位
      const nonEquivalentUnit = hormone.units.find(
        (unit) =>
          !areUnitsEquivalentInAtoms(hormone, fromUnit.symbol, unit.symbol),
      );

      return {
        fromUnit: fromUnit.symbol,
        toUnit:
          nonEquivalentUnit?.symbol ||
          hormone.units[1]?.symbol ||
          fromUnit.symbol,
      };
    }
  } else if (commonUnits.length === 1) {
    // 如果只有1个常用单位，常用单位作为fromUnit，寻找非等价单位作为toUnit
    const fromUnit = commonUnits[0];
    const nonEquivalentUnit = hormone.units.find(
      (unit) =>
        !areUnitsEquivalentInAtoms(hormone, fromUnit.symbol, unit.symbol),
    );

    return {
      fromUnit: fromUnit.symbol,
      toUnit:
        nonEquivalentUnit?.symbol ||
        hormone.units[1]?.symbol ||
        fromUnit.symbol,
    };
  } else {
    // 如果没有常用单位，使用原来的逻辑，但避免等价单位
    const fromUnit = hormone.units[0];
    const nonEquivalentUnit = hormone.units.find(
      (unit) =>
        !areUnitsEquivalentInAtoms(hormone, fromUnit.symbol, unit.symbol),
    );

    return {
      fromUnit: fromUnit.symbol,
      toUnit:
        nonEquivalentUnit?.symbol ||
        hormone.units[1]?.symbol ||
        fromUnit.symbol,
    };
  }
}

// 获取默认激素的默认单位
const defaultHormone =
  HORMONES.find((h) => h.id === DEFAULT_HORMONE) || HORMONES[0];
const defaultUnits = getDefaultUnits(defaultHormone);

// 转换状态 atom
export const conversionStateAtom = atom<ConversionState>({
  selectedHormone: DEFAULT_HORMONE,
  inputValue: '',
  fromUnit: defaultUnits.fromUnit,
  toUnit: defaultUnits.toUnit,
  result: null,
});

// 历史记录 atom (存储在本地存储中)
export const historyAtom = atomWithStorage<HistoryRecord[]>(
  'hormone-converter-history',
  [],
);

// 显示历史面板的状态
export const showHistoryAtom = atom<boolean>(false);

// 当前选中的激素类型
export const selectedHormoneAtom = atom(
  (get) => get(conversionStateAtom).selectedHormone,
  (get, set, newHormone: string) => {
    const currentState = get(conversionStateAtom);
    const hormone = HORMONES.find((h) => h.id === newHormone);
    if (hormone) {
      const newDefaultUnits = getDefaultUnits(hormone);
      set(conversionStateAtom, {
        ...currentState,
        selectedHormone: newHormone,
        fromUnit: newDefaultUnits.fromUnit,
        toUnit: newDefaultUnits.toUnit,
        result: null,
      });
    }
  },
);

// 添加历史记录的 action atom
export const addHistoryRecordAtom = atom(
  null,
  (get, set, record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    const history = get(historyAtom);
    const newRecord: HistoryRecord = {
      ...record,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    // 限制历史记录数量为最近50条
    const updatedHistory = [newRecord, ...history].slice(0, 50);
    set(historyAtom, updatedHistory);
  },
);

// 清除历史记录的 action atom
export const clearHistoryAtom = atom(null, (_get, set) => {
  set(historyAtom, []);
});
