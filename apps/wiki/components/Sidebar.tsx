"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

import type { DocItem } from "../app/[language]/docs/directory-service";
import styles from "./css/sidebar.module.css";

interface SidebarProps {
  items: DocItem[];
  language: string;
  basePath: string;
}

// 递归渲染导航项
const NavItem = ({
  item,
  language,
  basePath,
  level = 0,
  currentPath,
}: {
  item: DocItem;
  language: string;
  basePath: string;
  level?: number;
  currentPath: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // 构建完整的链接路径，使用 fullPath
  const fullPath = `/${language}/${basePath}/${item.fullPath}`;

  // 检查当前路径是否匹配
  const isActive = currentPath === fullPath;

  // 如果当前项或其子项是活动的，则自动展开
  useEffect(() => {
    if (
      isActive ||
      (hasChildren &&
        item.children?.some((child) =>
          currentPath.startsWith(`/${language}/${basePath}/${child.fullPath}`)
        ))
    ) {
      setIsOpen(true);
    }
  }, [currentPath, hasChildren, isActive, item.children, language, basePath]);

  return (
    <li className={"my-0 py-0.5"}>
      {hasChildren ? (
        <details
          {...(isOpen ? { open: true } : {})}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <summary className={`rounded-md py-0 ${isActive ? styles.menu_active : ""}`} onClick={(e) => {
              setIsOpen(!isOpen);
              e.preventDefault();
          }}>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
              className="flex items-center p-0"
              onClick={(e) => {
                setIsOpen(true);
                e.preventDefault();
              }}
            >
              <Link
                href={fullPath}
                className={`block py-1 rounded-md text-sm transition-colors
            ${level === 0 ? "font-medium" : ""}
          `}
              >
                {item.metadata.title}
              </Link>
            </div>
          </summary>
          <ul
            className={`pl-${
              level > 0 ? 2 : 1
            } mt-1 space-y-1 border-l border-base-300`}
          >
            {item.children?.map((child, idx) => (
              <NavItem
                key={`${child.slug}-${idx}`}
                item={child}
                language={language}
                basePath={basePath}
                level={level + 1}
                currentPath={currentPath}
              />
            ))}
          </ul>
        </details>
      ) : (
        <Link
          href={fullPath}
          className={`block py-1 rounded-md text-sm transition-colors ${
            level === 0 ? "font-medium" : ""
          } ${isActive ? "menu-active" : ""}`}
        >
          {item.metadata.title}
        </Link>
      )}
    </li>
  );
};

export default function Sidebar({ items, language, basePath }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="sidebar">
      {/* 移动端菜单按钮 */}
      <div className="p-4 border-b lg:hidden border-base-300">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="btn btn-sm btn-ghost"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
          <span className="ml-2">导航菜单</span>
        </button>
      </div>

      {/* 侧边栏内容 */}
      <div
        className={`
        lg:block 
        ${
          isMobileMenuOpen
            ? "block overflow-y-auto h-[calc(100vh-4rem)]"
            : "hidden"
        }       
      `}
      >
        <nav>
          <ul className="space-y-2 menu w-full">
            {items.map((item, idx) => (
              <NavItem
                key={`${item.slug}-${idx}`}
                item={item}
                language={language}
                basePath={basePath}
                currentPath={pathname}
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
