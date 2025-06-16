import type { ShortCodeCompProps } from '../types';

export default function Pos({ attrs }: ShortCodeCompProps) {
  const text = attrs?.[0] || '';

  return (
    <span className="font-bold leading-none inline-block py-1 px-2.5 text-center whitespace-nowrap rounded-full text-white bg-green-600">
      {text}
    </span>
  );
}
