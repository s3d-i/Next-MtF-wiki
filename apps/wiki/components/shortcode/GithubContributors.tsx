"use client";

import { useState, useEffect } from "react";
import type { ShortCodeCompProps } from "./types";

interface Contributor {
  login: string;
  html_url: string;
  avatar_url: string;
  contributions: number;
}

/**
 * GithubContributors组件用于显示GitHub仓库的贡献者列表
 * 对应Hugo shortcode: {{< github/contributors >}}
 */
export default function GithubContributors({ attrs, children }: ShortCodeCompProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.github.com/repos/project-trans/mtf-wiki/contributors?per_page=100"
        );
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data: Contributor[] = await response.json();
        setContributors(data);
      } catch (err) {
        console.error("Failed to fetch contributors:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch contributors");
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "0 1rem", margin: "0 0 1rem", marginBlockStart: "1em", marginBlockEnd: "1em" }}>
        <p>加载贡献者列表中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "0 1rem", margin: "0 0 1rem", marginBlockStart: "1em", marginBlockEnd: "1em" }}>
        <p>无法加载贡献者列表: {error}</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "0 1rem", margin: "0 0 1rem", marginBlockStart: "1em", marginBlockEnd: "1em" }}>
        <ul style={{ listStyle: "none" }}>
          {contributors.map((contributor) => (
            <li
              key={contributor.login}
              style={{
                margin: "4px",
                float: "left",
              }}
            >
              <a href={contributor.html_url} target="_blank" rel="noopener noreferrer">
                <img
                  loading="lazy"
                  decoding="async"
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
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
      <p style={{ float: "none", clear: "both" }}></p>
    </>
  );
}
