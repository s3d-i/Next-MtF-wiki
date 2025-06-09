'use client';

import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { selectedHormoneAtom, showHistoryAtom, historyAtom } from '../lib/atoms';
import { HORMONES } from '../lib/constants';
import { HormoneCard } from './HormoneCard';
import { HistoryPanel } from './HistoryPanel';
import { ReferenceRanges } from './ReferenceRanges';
import { Clock, Beaker } from 'lucide-react';

export function HormoneConverter() {
  const [selectedHormone, setSelectedHormone] = useAtom(selectedHormoneAtom);
  const [, setShowHistory] = useAtom(showHistoryAtom);
  const [history] = useAtom(historyAtom);

  const selectedHormoneData = HORMONES.find(h => h.id === selectedHormone);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // H 键打开历史记录
      if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.metaKey) {
        const target = event.target as HTMLElement;
        // 只有在不是输入框时才触发
        if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT') {
          setShowHistory(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowHistory]);

  return (
    <div className="space-y-8">
      {/* 激素类型选择 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-100/50 backdrop-blur-sm rounded-xl p-6 border border-base-300/30"
      >
        <div className="flex items-center gap-2 mb-4">
          <Beaker className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">选择激素类型</h2>
        </div>

        {/* 移动端下拉选择 */}
        <div className="block md:hidden mb-4">
          <select
            value={selectedHormone}
            onChange={(e) => setSelectedHormone(e.target.value)}
            className="select select-bordered w-full"
          >
            {HORMONES.map((hormone) => (
              <option key={hormone.id} value={hormone.id}>
                {hormone.name} ({hormone.units.length} 种单位)
              </option>
            ))}
          </select>
        </div>

        {/* 桌面端网格选择 */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
          {HORMONES.map((hormone) => (
            <motion.button
              key={hormone.id}
              onClick={() => setSelectedHormone(hormone.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                selectedHormone === hormone.id
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-base-300 hover:border-primary/50 hover:bg-base-200/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="font-medium text-base-content text-sm">{hormone.name}</div>
              <div className="text-xs text-base-content/60 mt-1">
                {hormone.units.length} 种单位
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 主要内容区域 - 大屏设备水平布局，小屏设备垂直布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* 左侧：换算器界面和功能按钮 */}
        <div className="lg:col-span-4 space-y-8">
          {/* 换算器界面 */}
          <AnimatePresence>
            {selectedHormoneData && (
              <HormoneCard key={selectedHormone} hormone={selectedHormoneData} />
            )}
          </AnimatePresence>

          {/* 功能按钮 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={() => setShowHistory(true)}
              className="btn btn-outline gap-2"
            >
              <Clock className="w-4 h-4" />
              查看历史
              <kbd className="kbd kbd-xs">H</kbd>
              {history.length > 0 && (
                <span className="badge badge-primary badge-sm">{history.length}</span>
              )}
            </button>

            <div className="text-xs text-base-content/60 text-center">
              <p>快捷键：H 键查看历史记录</p>
            </div>
          </motion.div>
        </div>

        {/* 右侧：参考范围说明 */}
        <div className="lg:col-span-3">
          <AnimatePresence>
            {selectedHormoneData && (
              <ReferenceRanges key={selectedHormone} hormone={selectedHormoneData} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 历史记录面板 */}
      <HistoryPanel />
    </div>
  );
}
