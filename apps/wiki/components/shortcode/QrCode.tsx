import { toString as toQrcodeString } from 'qrcode';
import { z } from 'zod/v4';
import type { ShortCodeCompProps } from './types';

export default async function Qrcode({ attrs, children }: ShortCodeCompProps) {
  const value = attrs[0] || '';
  const qrcode = await toQrcodeString(value, {
    type: 'svg',
  });
  // console.log('qrcode: ', qrcode);
  if (z.url().safeParse(value).success) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="h-40 w-40 block"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: trust content
        dangerouslySetInnerHTML={{ __html: qrcode }}
      />
    );
  }
  return (
    <div
      className="h-40 w-40 block"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trust content
      dangerouslySetInnerHTML={{ __html: qrcode }}
    />
  );
}
