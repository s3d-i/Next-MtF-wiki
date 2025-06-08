import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import TableOfContents from "@/components/TableOfContents";
import MobileTableOfContents from "@/components/MobileTableOfContents";
import { getDocsNavigationForClient } from "./directory-service";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;  
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;

  // 获取文档导航数据
  const navigationItems = await getDocsNavigationForClient(language);

  return (
    <div className="container px-4 py-6 mx-auto">
      <div className="flex gap-8">
        {/* 桌面端侧边栏 */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-4 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-300/50 shadow-sm">
              <Sidebar 
                items={navigationItems} 
                language={language} 
                basePath="docs" 
              />
            </div>
          </div>
        </aside>

        {/* 主要内容区域 */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* 桌面端右侧目录区域 */}
        <aside className="hidden xl:block xl:w-48 xl:shrink-0">
          <div className="sticky top-24 border border-base-300/50 shadow-sm rounded-xl">
            <TableOfContents language={language} />
          </div>
        </aside>
      </div>

      {/* 移动端侧边栏组件 */}
      <MobileSidebar 
        navigationItems={navigationItems}
        language={language}
        basePath="docs"
      />
      
      {/* 移动端目录组件 */}
      <MobileTableOfContents language={language} />
    </div>
  );
}
