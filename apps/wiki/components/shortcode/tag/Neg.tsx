import type { ShortCodeCompProps } from '../types';

export default function Neg({ attrs }: ShortCodeCompProps) {
  const text = attrs?.[0] || '';

  return (
    <span className="font-bold leading-none inline-block py-1 px-2.5 text-center whitespace-nowrap rounded-full text-gray-800 bg-yellow-400">
      {text}
    </span>
  );
}
