"use client";

import { usePathname } from "next/navigation";
import { Link } from "./progress";
import { useState, useEffect, useRef } from "react";

import type { DocItem } from "@/service/directory-service";
import styles from "./css/sidebar.module.css";
import { isElementInScrollContainerView } from "@/lib/utils";

interface SidebarProps {
  items: DocItem[];
  language: string;
}

function scrollIntoContainerView(target: HTMLElement, container: HTMLElement) {
  const targetRect = target.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const offsetTop = targetRect.top - containerRect.top + container.scrollTop;
  const offsetBottom =
    targetRect.bottom - containerRect.bottom + container.scrollTop;

  if (targetRect.top < containerRect.top) {
    // 滚动到顶部
    container.scrollTop = offsetTop;
  } else if (targetRect.bottom > containerRect.bottom) {
    // 滚动到底部
    container.scrollTop = offsetBottom;
  }
}

function scrollIntoContainerViewCenter(
  target: HTMLElement,
  container: HTMLElement,
  offsetPercentage: number = 0.3 // 默认显示在容器前30%位置
) {
  const targetRect = target.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // 元素顶部相对于容器顶部的位置（加上容器的 scrollTop 表示绝对位置）
  const targetOffset = targetRect.top - containerRect.top + container.scrollTop;

  // 计算容器指定百分比位置要 scrollTop 到多少
  const scrollTo =
    targetOffset - (container.clientHeight * offsetPercentage) + target.offsetHeight / 2;

  container.scrollTop = scrollTo;
}

// 递归渲染导航项
const NavItem = ({
  item,
  language,
  level = 0,
}: {
  item: DocItem;
  language: string;
  level?: number;
}) => {
  const currentPath = usePathname();

  const hasChildren = item.children && item.children.length > 0;

  function getIsShouldOpen(
    isActive: boolean,
    hasChildren: boolean | undefined,
    item: DocItem,
    currentPath?: string,
    language?: string,
  ) {
    return (
      isActive ||
      (hasChildren &&
        item.children?.some((child) =>
          currentPath?.startsWith(
            `/${language}/${child.displayPath}`
          )
        ))
    );
  }

  const isShouldOpen = getIsShouldOpen(
    false,
    hasChildren,
    item,
    currentPath,
    language,
  );

  const [isOpen, setIsOpen] = useState(isShouldOpen);

  // 构建完整的链接路径，使用 fullPath
  const fullPath = `/${language}/${item.displayPath}`;

  // 检查当前路径是否匹配
  const isActive = currentPath === fullPath;

  const myRef = useRef<HTMLAnchorElement>(null);
  const myRef2 = useRef<HTMLDivElement>(null);

  // 如果当前项或其子项是活动的，则自动展开
  useEffect(() => {
    if (isShouldOpen) {
      setIsOpen(true);
    }
  }, [isShouldOpen]);

  useEffect(() => {
    if (isActive) {
      const toscroll = myRef.current || myRef2.current;
      if (toscroll) {
        const container = document.getElementById("sidebar-scroll-container");
        if (container && !isElementInScrollContainerView(toscroll, container)) {
          scrollIntoContainerViewCenter(toscroll, container);
        }
      }
    }
  }, [isActive]);

  return (
    <li className={"my-0 py-0.5"}>
      {hasChildren ? (
        <details
          {...(isOpen ? { open: true } : {})}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <summary
            ref={myRef2}
            className={`rounded-md py-0 ${isActive ? styles.menu_active : ""}`}
            onClick={(e) => {
              setIsOpen(!isOpen);
              e.preventDefault();
            }}
          >
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
                level={level + 1}
              />
            ))}
          </ul>
        </details>
      ) : (
        <Link
          ref={myRef}
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

export default function Sidebar({ items, language }: SidebarProps) {
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
              />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
