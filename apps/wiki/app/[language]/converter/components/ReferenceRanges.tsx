'use client';

import { motion } from 'motion/react';
import { Calculator } from 'lucide-react';
import type { HormoneType } from '../lib/types';
import { Link } from '@/components/progress';

interface ReferenceRangesProps {
  hormone: HormoneType;
}

export function ReferenceRanges({ hormone }: ReferenceRangesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-base-100/30 backdrop-blur-sm rounded-xl p-6 border border-base-300/30 h-fit"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-info" />
        <h3 className="text-lg font-semibold">参考范围说明</h3>
      </div>
      {hormone.ranges.length > 0 ? (
      <div className="space-y-4">
        {hormone.ranges.map((range, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + 0.1 * index, duration: 0.3 }}
            className={`p-4 rounded-lg border-l-4 ${
              range.color === 'success' ? 'border-success bg-success/10' :
              range.color === 'warning' ? 'border-warning bg-warning/10' :
              range.color === 'error' ? 'border-error bg-error/10' :
              'border-info bg-info/10'
            }`}
          >
            <div className="font-medium text-base-content">{range.label}</div>
            <div className="text-sm text-base-content/70 mt-1">
              {range.min === 0 && range.max === Infinity ? '> 0' :
               range.max === Infinity ? `> ${range.min}` :
               `${range.min} - ${range.max}`} {range.unit}
            </div>
            {range.description && (
              <div className="text-xs text-base-content/60 mt-1">
                {range.description}
              </div>
            )}
            <div className="text-xs text-base-content/50 mt-1 italic">
              数据来源：
              <Link
                href={range.source.url}
                className="link link-primary hover:link-accent transition-colors"
                rel="noopener noreferrer"
              >
                {range.source.name}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>) : (
        <div className="text-sm text-base-content/60">
          暂无参考范围
        </div>
      )}
    </motion.div>
  );
}
