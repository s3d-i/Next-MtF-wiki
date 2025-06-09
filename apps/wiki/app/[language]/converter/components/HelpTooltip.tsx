'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X } from 'lucide-react';

export function HelpTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-ghost btn-sm"
        title="使用帮助"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-0 top-full mt-2 w-80 bg-base-100 rounded-lg shadow-xl border border-base-300 p-4 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base-content">使用帮助</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-base-content/80">
              <div>
                <h4 className="font-medium text-base-content mb-1">基本操作</h4>
                <ul className="space-y-1 text-xs">
                  <li>• 选择激素类型</li>
                  <li>• 输入数值和选择单位</li>
                  <li>• 查看自动转换结果</li>
                  <li>• 点击复制按钮复制结果</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-base-content mb-1">快捷键</h4>
                <ul className="space-y-1 text-xs">
                  <li>• <kbd className="kbd kbd-xs">H</kbd> 查看历史记录</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-base-content mb-1">范围提示</h4>
                <p className="text-xs">
                  转换结果会显示颜色标识，表示数值是否在正常范围内。
                  请注意这些范围仅供参考，具体请咨询医生。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
