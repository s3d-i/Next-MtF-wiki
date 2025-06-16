import type { ShortCodeCompProps } from './types';

export default function Currency({ attrs }: ShortCodeCompProps) {
  const value = Number(attrs?.[0]) || 0;
  const from = attrs?.[1] || 'USD';
  const to = attrs?.[2] || 'CNY'; // 默认转换为人民币

  // 如果源货币和目标货币相同，只显示值
  if (from === to) {
    return (
      <span className="text-blue-700 no-underline font-medium">
        {new Intl.NumberFormat('zh-CN', {
          style: 'currency',
          currency: from,
        }).format(value)}
      </span>
    );
  }

  // 构建转换链接
  const href = `https://www.xe.com/currencyconverter/convert/?Amount=${value}&From=${from}&To=${to}`;

  return (
    <a
      className="text-blue-700 no-underline font-medium hover:underline"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: from,
      }).format(value)}
    </a>
  );
}
