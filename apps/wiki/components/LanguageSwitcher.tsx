"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Languages, ChevronDown } from "lucide-react";

interface LanguageOption {
  code: string;
  name: string;
}

interface LanguageSwitcherProps {
  currentLanguage: string;
  availableLanguages: LanguageOption[];
}

export default function LanguageSwitcher({
  currentLanguage,
  availableLanguages,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 关闭下拉菜单的点击外部处理器
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  // 切换语言
  const switchLanguage = (langCode: string) => {
    // 获取当前路径，移除当前语言前缀
    const currentPath = pathname;
    const pathWithoutLang = currentPath.replace(`/${currentLanguage}`, "");

    //todo: 检查目标语言是否有对应的路径
    //todo: 如果路径存在，导航到该路径；否则导航到目标语言的首页

    router.push(`/${langCode}`);

    setIsOpen(false);
  };

  // 获取当前语言的显示名称
  const currentLanguageName =
    availableLanguages.find((lang) => lang.code === currentLanguage)?.name ||
    currentLanguage;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 btn btn-ghost btn-sm"
        aria-label="语言选择器"
      >
        <Languages className="w-5 h-5" />
        <span>{currentLanguageName}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-48 mt-2 rounded-md shadow-lg bg-base-100">
          <ul className="py-1">
            {availableLanguages.map((lang) => (
              <li key={lang.code}>
                <button
                  type="button"
                  onClick={() => switchLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-base-200 ${
                    lang.code === currentLanguage
                      ? "bg-primary text-primary-content"
                      : ""
                  }`}
                >
                  {lang.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
