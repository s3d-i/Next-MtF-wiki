import type { ShortCodeCompProps } from './types';

export default function CAS({ attrs }: ShortCodeCompProps) {
  const id = attrs[0] || '';
  const href = `https://commonchemistry.cas.org/detail?cas_rn=${id}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {id}
    </a>
  );
}
