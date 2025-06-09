import { Link } from "../../components/progress";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { getAvailableLanguages, getAvailablePaths } from "@/service/directory-service";
import { t, getLanguageName } from "@/lib/i18n";
import { getNavigationItems } from "@/lib/site-config";

export default async function LanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;

  // 获取所有可用语言
  const availableLanguages = await getAvailableLanguages();

  // 构建语言选项
  const languageOptions = availableLanguages.map((langCode) => ({
    code: langCode,
    name: getLanguageName(langCode),
  }));

  // 获取导航项配置
  const navigationItems = getNavigationItems(language);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* 顶部导航栏 */}
      <header className="lg:sticky lg:top-0 z-49 border-b bg-base-100/80 backdrop-blur-xl border-base-300/50 shadow-sm">
        <div className="container flex items-center justify-between px-6 py-4 mx-auto">
          <div className="flex items-center space-x-8">
            <Link href={`/${language}`} className="flex items-center group">
              <Image
                src="/hugo-static/new/mtf-wiki-long.svg"
                alt="Logo"
                width={140}
                height={35}
                className="w-auto h-9 transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            <nav className="hidden space-x-8 md:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  href={`/${language}${item.href}`}
                  className="relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg text-base-content hover:text-primary hover:bg-primary/10 before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-primary before:scale-x-0 before:transition-transform before:duration-200 hover:before:scale-x-100"
                >
                  {t(item.translationKey as any, language)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="h-6 border-l border-base-300" />
            <LanguageSwitcher
              currentLanguage={language}
              availableLanguages={languageOptions}
            />
          </div>
        </div>

        {/* 移动端导航菜单 */}
        <div className="border-t md:hidden border-base-300/50">
          <nav className="flex px-6 py-3 space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                href={`/${language}${item.href}`}
                className="px-3 py-2 text-sm font-medium transition-colors rounded-lg text-base-content hover:text-primary hover:bg-primary/10"
              >
                {t(item.translationKey as any, language)}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1">
          {children}
      </main>

      {/* 页脚 */}
      <footer className="border-t bg-gradient-to-r from-base-200 to-base-300 border-base-300">
        <div className="container px-6 py-8 mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-4">
              <Image
                src="/hugo-static/new/mtf-wiki-long.svg"
                alt="Logo"
                width={120}
                height={30}
                className="w-auto h-8"
              />
              <p className="text-sm text-base-content/70">
                {t("description", language)}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">
                {t("quickLinks", language)}
              </h3>
              <ul className="space-y-2 text-sm text-base-content/70">
                <li>
                  <Link href={`/${language}/docs`} className="transition-colors hover:text-primary">
                    {t("browseDocs", language)}
                  </Link>
                </li>
                <li>
                  <Link href={`/${language}/about`} className="transition-colors hover:text-primary">
                    {t("aboutUs", language)}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-base-content">
                {t("community", language)}
              </h3>
              <p className="text-sm text-base-content/70">
                {t("communityDesc", language)}
              </p>
            </div>
          </div>

          <div className="pt-6 mt-8 text-center border-t border-base-300">
            <p className="text-sm text-base-content/60">
              © {new Date().getFullYear()} MtF Wiki.{t("copyright", language)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


