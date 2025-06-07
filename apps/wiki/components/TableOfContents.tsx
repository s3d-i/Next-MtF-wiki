"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  language: string;
}

export default function TableOfContents({ language }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // 提取页面中main元素内的标题
    const extractHeadings = () => {
      const mainElement = document.getElementById("markdown-content");
      if (!mainElement) {
        setTocItems([]);
        return;
      }

      const headings = mainElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const items: TocItem[] = [];

      headings.forEach((heading, index) => {
        const level = Number.parseInt(heading.tagName.charAt(1));
        const text = heading.textContent?.trim() || "";
        
        // 如果标题没有 id，创建一个
        let id = heading.id;
        if (!id) {
          id = `heading-${index}`;
          heading.id = id;
        }

        if (text) {
          items.push({ id, text, level });
        }
      });

      setTocItems(items);
    };

    // 监听页面内容变化
    const observer = new MutationObserver(() => {
      extractHeadings();
    });

    // 初始提取
    extractHeadings();

    // 开始观察main元素变化
    const mainElement = document.querySelector("main");
    if (mainElement) {
      observer.observe(mainElement, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // 滚动监听，高亮当前标题
    const handleScroll = () => {
      const headings = tocItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id),
      })).filter(item => item.element);

      // 找到当前视窗中的标题
      let currentId = "";
      for (const heading of headings) {
        if (heading.element) {
          const rect = heading.element.getBoundingClientRect();
          if (rect.top <= 100) {
            currentId = heading.id;
          } else {
            break;
          }
        }
      }

      setActiveId(currentId);
    };

    if (tocItems.length > 0) {
      window.addEventListener("scroll", handleScroll);
      handleScroll(); // 初始检查
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // 如果没有main元素或没有标题，不显示目录
  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-xl bg-base-100/30 backdrop-blur-sm border border-base-300/30">
      <h3 className="mb-3 text-sm font-semibold text-base-content">
        {t("tableOfContents", language)}
      </h3>
      <nav className="space-y-1">
        {tocItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToHeading(item.id)}
            className={`
              block w-full text-left text-xs transition-colors
              ${item.level === 1 ? "font-medium" : ""}
              ${item.level === 2 ? "pl-2" : ""}
              ${item.level === 3 ? "pl-4" : ""}
              ${item.level === 4 ? "pl-6" : ""}
              ${item.level >= 5 ? "pl-8" : ""}
              ${
                activeId === item.id
                  ? "text-primary font-medium"
                  : "text-base-content/70 hover:text-base-content"
              }
              py-1 px-2 rounded hover:bg-base-200/50
            `}
          >
            {item.text}
          </button>
        ))}
      </nav>
    </div>
  );
} 