'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { useParams } from 'next/navigation';
import { themePreferenceAtom, themeMenuOpenAtom } from '../lib/theme-atoms';
import { getThemeOptions } from '../lib/site-config';
import { t } from '../lib/i18n';

// 图标组件
const ThemeIcon = ({ icon, className = "w-5 h-5" }: { icon: string; className?: string }) => {
  switch (icon) {
    case 'sun':
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case 'moon':
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    case 'computer':
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    // 未来可以在这里添加更多图标，例如：
    // case 'contrast':
    // case 'eye':
    // case 'palette':
    default:
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
  }
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themePreference, setThemePreference] = useAtom(themePreferenceAtom);
  const [isMenuOpen, setIsMenuOpen] = useAtom(themeMenuOpenAtom);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const params = useParams();

  // 获取当前语言
  const currentLanguage = (params?.language as string) || 'zh-cn';
  const themeOptions = getThemeOptions();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 同步主题偏好设置
    if (mounted && theme !== themePreference) {
      setTheme(themePreference);
    }
  }, [mounted, themePreference, theme, setTheme]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen, setIsMenuOpen]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setThemePreference(newTheme);
    setIsMenuOpen(false);
  };

  const getCurrentThemeOption = () => {
    return themeOptions.find(option => option.value === (theme || themePreference)) || themeOptions[0];
  };

  // 避免服务端渲染不匹配
  if (!mounted) {
    return (
      <div className="dropdown dropdown-end">
        <button type="button" className="btn btn-ghost btn-circle">
          <div className="w-5 h-5 animate-pulse bg-base-content/20 rounded" />
        </button>
      </div>
    );
  }

  const currentOption = getCurrentThemeOption();

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        aria-label={t('themeSettings', currentLanguage)}
        title={`${t('currentTheme', currentLanguage)}: ${t(currentOption.labelKey as any, currentLanguage)}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <ThemeIcon icon={currentOption.icon} />
      </div>

      {isMenuOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-52 bg-base-100 rounded-box shadow-lg border border-base-300 z-[1000] p-2"
        >
            <ul className="menu w-full">
              <li className="menu-title">
                <span>{t('themeSettings', currentLanguage)}</span>
              </li>
              {themeOptions.map((option) => (
                <li key={option.key}>
                  <button
                    type="button"
                    className={`flex items-center gap-3 ${
                      (theme || themePreference) === option.value ? 'active' : ''
                    }`}
                    onClick={() => handleThemeChange(option.value)}
                  >
                    <ThemeIcon icon={option.icon} className="w-4 h-4" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{t(option.labelKey as any, currentLanguage)}</span>
                      <span className="text-xs opacity-70">{t(option.descriptionKey as any, currentLanguage)}</span>
                    </div>
                    {(theme || themePreference) === option.value && (
                      <svg
                        className="w-4 h-4 ml-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}