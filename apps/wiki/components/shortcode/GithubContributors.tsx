import { cache } from '@/lib/cache';
import type { ShortCodeCompProps } from './types';

interface Contributor {
  login: string;
  html_url: string;
  avatar_url: string;
  contributions: number;
}

const getGithubContributors = cache(async () => {
  const response = await fetch(
    'https://api.github.com/repos/project-trans/mtf-wiki/contributors?per_page=100',
  );
  const data: Contributor[] = await response.json();
  return data;
});

/**
 * GithubContributors组件用于显示GitHub仓库的贡献者列表
 * 对应Hugo shortcode: {{< github/contributors >}}
 */
export default async function GithubContributors({
  attrs,
  children,
}: ShortCodeCompProps) {
  const contributors = await getGithubContributors();

  return (
    <>
      <div
        style={{
          padding: '0 1rem',
          margin: '0 0 1rem',
          marginBlockStart: '1em',
          marginBlockEnd: '1em',
        }}
      >
        <ul style={{ listStyle: 'none' }}>
          {contributors.map((contributor) => (
            <li
              key={contributor.login}
              style={{
                margin: '4px',
                float: 'left',
              }}
            >
              <a
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  loading="lazy"
                  decoding="async"
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    margin: 0,
                    padding: 0,
                  }}
                />
              </a>
            </li>
          ))}
        </ul>
        <br />
      </div>
      <p style={{ float: 'none', clear: 'both' }} />
    </>
  );
}
