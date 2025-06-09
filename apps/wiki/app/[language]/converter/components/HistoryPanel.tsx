'use client';

import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'motion/react';
import { historyAtom, clearHistoryAtom, showHistoryAtom } from '../lib/atoms';
import { formatTimestamp, formatValue, getHormoneById } from '../lib/utils';
import { Trash2, Clock, X } from 'lucide-react';

export function HistoryPanel() {
  const [history] = useAtom(historyAtom);
  const [, clearHistory] = useAtom(clearHistoryAtom);
  const [showHistory, setShowHistory] = useAtom(showHistoryAtom);

  if (!showHistory) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowHistory(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-base-100 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">换算历史</h2>
              <span className="badge badge-primary">{history.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={() => clearHistory()}
                  className="btn btn-ghost btn-sm text-error"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              )}
              <button
                onClick={() => setShowHistory(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-base-content/60 mt-2">
            数据仅存储在浏览器本地，不会上传到服务器
          </p>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          <AnimatePresence>
            {history.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center text-base-content/60"
              >
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>暂无换算历史</p>
              </motion.div>
            ) : (
              <div className="p-4 space-y-3">
                {history.map((record, index) => {
                  const hormone = getHormoneById(record.hormoneId);
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-base-200/50 rounded-lg p-4 hover:bg-base-200/80 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary">
                          {hormone?.name || '未知激素'}
                        </span>
                        <span className="text-xs text-base-content/60">
                          {formatTimestamp(record.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-mono">
                          {formatValue(record.fromValue)} {record.fromUnit}
                        </span>
                        <span className="mx-2 text-base-content/60">→</span>
                        <span className="font-mono">
                          {formatValue(record.toValue)} {record.toUnit}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
