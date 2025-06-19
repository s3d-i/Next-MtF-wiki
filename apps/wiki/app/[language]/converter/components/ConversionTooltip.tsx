import { HelpCircle } from 'lucide-react';
import type { HormoneRange } from '../lib/types';
import { formatRangeText } from '../lib/utils';

interface ConversionTooltipProps {
  originalRange: HormoneRange;
  isVisible: boolean;
}

export function ConversionTooltip({
  originalRange,
  isVisible,
}: ConversionTooltipProps) {
  if (!isVisible) {
    return null;
  }

  const tooltipContent = `转换自：${formatRangeText(
    originalRange.min,
    originalRange.max,
    originalRange.hideMax,
  )} ${originalRange.unit}`;

  return (
    <div className="tooltip tooltip-top" data-tip={tooltipContent}>
      <HelpCircle className="w-3 h-3 text-base-content/50 hover:text-base-content/70 ml-1 inline-block" />
    </div>
  );
}
