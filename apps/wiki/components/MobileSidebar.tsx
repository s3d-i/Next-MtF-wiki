"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Link } from "./progress";
import { t } from "@/lib/i18n";
import type { DocItem } from "@/service/directory-service";

interface MobileSidebarProps {
  navigationItems: DocItem[];
  language: string;
}

const MobileNavItem = ({
  item,
  language,
  level = 0,
  currentPath,
  onItemClick,
}: {
  item: DocItem;
  language: string;
  level?: number;
  currentPath: string;
  onItemClick: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // 构建完整的链接路径
  const fullPath = `/${language}/${item.displayPath}`;

  // 检查当前路径是否匹配
  const isActive = currentPath === fullPath;

  // 如果当前项或其子项是活动的，则自动展开
  useEffect(() => {
    if (
      isActive ||
      (hasChildren &&
        item.children?.some((child) =>
          currentPath.startsWith(`/${language}/${child.displayPath}`)
        ))
    ) {
      setIsOpen(true);
    }
  }, [currentPath, hasChildren, isActive, item.children, language]);

  return (
    <div className="mb-1">
      {hasChildren ? (
        <div>
          {/* 父级链接 */}
          <div className="flex items-center justify-between">
            <Link
              href={fullPath}
              onClick={onItemClick}
              className={`
                flex-1 block py-2 px-3 rounded-lg text-sm transition-colors
                ${level === 0 ? "font-medium text-base-content" : "text-base-content/80"}
                ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-base-200"}
              `}
            >
              {item.metadata.title}
            </Link>
            {/* 展开/收起按钮 */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 ml-1 rounded-lg hover:bg-base-200 transition-colors"
              aria-label={isOpen ? "收起" : "展开"}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          {/* 子级内容 */}
          {isOpen && (
            <div className={`ml-${level > 0 ? 6 : 4} mt-1 space-y-1 border-l-2 border-base-300/50 pl-3`}>
              {item.children?.map((child, idx) => (
                <MobileNavItem
                  key={`${child.slug}-${idx}`}
                  item={child}
                  language={language}
                  level={level + 1}
                  currentPath={currentPath}
                  onItemClick={onItemClick}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link
          href={fullPath}
          onClick={onItemClick}
          className={`
            block py-2 px-3 rounded-lg text-sm transition-colors
            ${level === 0 ? "font-medium text-base-content" : "text-base-content/80"}
            ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-base-200"}
          `}
        >
          {item.metadata.title}
        </Link>
      )}
    </div>
  );
};

export default function MobileSidebar({ navigationItems, language }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC键关闭侧边栏
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* 浮动按钮 - 直接显示为"目录"或"导航" */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 lg:hidden flex items-center space-x-2 px-4 py-3 rounded-full bg-primary text-primary-content shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        aria-label={t("docs", language)}
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 6h16M4 12h16M4 18h16" 
          />
        </svg>
        <span className="text-sm font-medium">
          {t("navigation", language)}
        </span>
      </button>

      {/* 遮罩层和侧边栏 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* 遮罩层 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="关闭导航"
          />
          
          {/* 侧边栏内容 */}
          <div className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-base-100 shadow-2xl border-r border-base-300 transform animate-in slide-in-from-left duration-300">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-base-300 bg-primary/5">
              <h2 className="text-lg font-semibold text-base-content flex items-center space-x-2">
                <svg 
                  className="w-5 h-5 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <span>{t("docs", language)}</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-base-300/50 transition-colors"
                aria-label="关闭导航"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>

            {/* 导航内容 */}
            <div className="overflow-y-auto h-[calc(100vh-5rem)] p-4">
              <nav>
                <div className="space-y-1">
                  {navigationItems.map((item, idx) => (
                    <MobileNavItem
                      key={`${item.slug}-${idx}`}
                      item={item}
                      language={language}
                      currentPath={pathname}
                      onItemClick={handleItemClick}
                    />
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}


    </>
  );
} 