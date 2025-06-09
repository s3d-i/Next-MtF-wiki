'use client';

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ConversionState, HistoryRecord } from './types';
import { DEFAULT_HORMONE, HORMONES } from './constants';

// 转换状态 atom
export const conversionStateAtom = atom<ConversionState>({
  selectedHormone: DEFAULT_HORMONE,
  inputValue: '',
  fromUnit: HORMONES[0].units[0].symbol,
  toUnit: HORMONES[0].units[1].symbol,
  result: null,
});

// 历史记录 atom (存储在本地存储中)
export const historyAtom = atomWithStorage<HistoryRecord[]>('hormone-converter-history', []);

// 显示历史面板的状态
export const showHistoryAtom = atom<boolean>(false);

// 当前选中的激素类型
export const selectedHormoneAtom = atom(
  (get) => get(conversionStateAtom).selectedHormone,
  (get, set, newHormone: string) => {
    const currentState = get(conversionStateAtom);
    const hormone = HORMONES.find(h => h.id === newHormone);
    if (hormone) {
      set(conversionStateAtom, {
        ...currentState,
        selectedHormone: newHormone,
        fromUnit: hormone.units[0].symbol,
        toUnit: hormone.units[1].symbol,
        result: null,
      });
    }
  }
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
  }
);

// 清除历史记录的 action atom
export const clearHistoryAtom = atom(
  null,
  (get, set) => {
    set(historyAtom, []);
  }
);
