import { cache } from '@/lib/cache';
import type { ShortCodeCompProps } from './types';

interface Contributor {
  login: string;
  html_url: string;
  avatar_url: string;
  contributions: number;
}

// 延迟函数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 带重试的fetch函数
const fetchWithRetry = async (
  url: string,
  maxRetries = 5,
  delayMs = 5000,
): Promise<Response> => {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : undefined,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `GitHub API request failed (attempt ${attempt} of ${maxRetries}):`,
        error,
      );

      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        console.log(`Waiting ${delayMs / 1000} seconds before retrying...`);
        await delay(delayMs);
      }
    }
  }

  throw new Error(
    `GitHub API request failed, retried ${maxRetries} times: ${lastError.message}`,
  );
};

const getGithubContributors = cache(async () => {
  const response = await fetchWithRetry(
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
