'use client';

import { useAtom } from 'jotai';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { conversionStateAtom, addHistoryRecordAtom } from '../lib/atoms';
import { performConversion, formatValue, getHormoneById } from '../lib/utils';
import { RangeIndicator } from './RangeIndicator';
import { ArrowUpDown, Copy, Check, Calculator, X } from 'lucide-react';
import type { HormoneType } from '../lib/types';

interface HormoneCardProps {
  hormone: HormoneType;
}

export function HormoneCard({ hormone }: HormoneCardProps) {
  const [state, setState] = useAtom(conversionStateAtom);
  const [, addHistoryRecord] = useAtom(addHistoryRecordAtom);
  const [isConverting, setIsConverting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isSelected = state.selectedHormone === hormone.id;

  // 当激素类型改变时，重置单位选择
  useEffect(() => {
    if (isSelected && state.fromUnit && state.toUnit) {
      const fromUnitExists = hormone.units.some(u => u.symbol === state.fromUnit);
      const toUnitExists = hormone.units.some(u => u.symbol === state.toUnit);
      
      if (!fromUnitExists || !toUnitExists) {
        setState(prev => ({
          ...prev,
          fromUnit: hormone.units[0].symbol,
          toUnit: hormone.units[1]?.symbol || hormone.units[0].symbol,
          result: null,
        }));
      }
    }
  }, [hormone, isSelected, state.fromUnit, state.toUnit, setState]);

  // 当激素类型、单位或输入值改变时重新计算结果
  useEffect(() => {
    if (isSelected && state.inputValue.trim() && !isNaN(parseFloat(state.inputValue))) {
      setIsConverting(true);
      
      // 添加轻微延迟以显示动画效果
      setTimeout(() => {
        const result = performConversion(state.inputValue, state.fromUnit, state.toUnit, hormone.id);
        setState(prev => ({ ...prev, result }));
        setIsConverting(false);
      }, 300);
    } else if (isSelected && (!state.inputValue.trim() || isNaN(parseFloat(state.inputValue)))) {
      setState(prev => ({ ...prev, result: null }));
    }
  }, [hormone.id, state.fromUnit, state.toUnit, state.inputValue, isSelected, setState]);

  const handleInputChange = (value: string) => {
    setState(prev => ({ ...prev, inputValue: value }));
    // 转换计算现在由useEffect处理，避免重复计算
  };

  const handleUnitChange = (type: 'from' | 'to', unit: string) => {
    setState(prev => ({
      ...prev,
      [type === 'from' ? 'fromUnit' : 'toUnit']: unit,
    }));
    // 转换计算现在由useEffect处理，避免重复计算
  };

  const swapUnits = () => {
    const newFromUnit = state.toUnit;
    const newToUnit = state.fromUnit;
    const newInputValue = state.result?.isValid ? formatValue(state.result.value) : '';

    setState(prev => ({
      ...prev,
      fromUnit: newFromUnit,
      toUnit: newToUnit,
      inputValue: newInputValue,
      result: null,
    }));

    // 如果交换后有输入值，立即计算结果
    if (newInputValue && !isNaN(parseFloat(newInputValue))) {
      setIsConverting(true);
      setTimeout(() => {
        const result = performConversion(newInputValue, newFromUnit, newToUnit, hormone.id);
        setState(prev => ({ ...prev, result }));
        setIsConverting(false);
      }, 300);
    }
  };

  const copyResult = async () => {
    if (state.result?.isValid) {
      const resultText = `${formatValue(state.result.value)} ${state.toUnit}`;
      try {
        await navigator.clipboard.writeText(resultText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const saveToHistory = () => {
    if (state.result?.isValid && state.inputValue.trim() && parseFloat(state.inputValue) > 0) {
      addHistoryRecord({
        hormoneId: hormone.id,
        fromValue: parseFloat(state.inputValue),
        fromUnit: state.fromUnit,
        toValue: state.result.value,
        toUnit: state.toUnit,
      });
    }
  };

  const clearInput = () => {
    setState(prev => ({
      ...prev,
      inputValue: '',
      result: null,
    }));
  };

  if (!isSelected) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-base-100 rounded-xl shadow-lg border border-base-300/30 overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-base-300/30">
        <h3 className="text-xl font-semibold text-base-content">{hormone.name}</h3>
        {/* <p className="text-sm text-base-content/60 mt-1">
          支持 {hormone.units.map(u => u.symbol).join('、')} 单位互转
        </p> */}
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* 输入部分 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-base-content">
              输入数值
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={state.inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="请输入数值"
                  className="input input-bordered w-full pr-10"
                  min="0"
                />
                {state.inputValue && (
                  <motion.button
                    onClick={clearInput}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="清空输入"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                )}
              </div>
              <select
                value={state.fromUnit}
                onChange={(e) => handleUnitChange('from', e.target.value)}
                className="select select-bordered w-24"
              >
                {hormone.units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 转换箭头和交换按钮 */}
          <div className="flex items-center justify-center">
            <motion.button
              onClick={swapUnits}
              className="btn btn-circle btn-ghost"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="交换单位"
            >
              <ArrowUpDown className="w-5 h-5" />
            </motion.button>
          </div>

          {/* 输出部分 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-base-content">
              转换结果
            </label>
            <div className="flex gap-2">
              <div className="input input-bordered flex-1 min-w-0 bg-base-200/50 flex items-center">
                {isConverting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="loading loading-spinner loading-sm"
                  />
                ) : (
                  <span className="font-mono">
                    {state.result?.isValid ? formatValue(state.result.value) : '—'}
                  </span>
                )}
              </div>
              <select
                value={state.toUnit}
                onChange={(e) => handleUnitChange('to', e.target.value)}
                className="select select-bordered w-24"
              >
                {hormone.units.map(unit => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.symbol}
                  </option>
                ))}
              </select>
              {state.result?.isValid && (
                <motion.button
                  onClick={copyResult}
                  className="btn btn-ghost btn-square"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="复制结果"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          {state.result?.isValid && (
            <div className="flex justify-center">
              <motion.button
                onClick={saveToHistory}
                className="btn btn-primary gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Calculator className="w-4 h-4" />
                转换
              </motion.button>
            </div>
          )}
        </div>

        {/* 范围指示器 */}
        <RangeIndicator
          ranges={state.result?.ranges}
          isVisible={state.result?.isValid === true}
        />
      </div>
    </motion.div>
  );
}
