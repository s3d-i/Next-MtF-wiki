"use client";

import { SkeletonWrapper } from "@/components/progress";

interface DocContentProps {
  children: React.ReactNode;
}

export function DocContent({ children }: DocContentProps) {

  // 自定义文档骨架屏，更符合文档页面的布局
  const documentSkeleton = (
    <div className="p-6 rounded-xl bg-base-100/30 backdrop-blur-sm border border-base-300/30 shadow-sm">
      <div className="flex flex-col gap-6 w-full">
        {/* 文档标题骨架 */}
        <div className="skeleton h-10 w-2/3"></div>
        
        {/* 文档内容骨架 */}
        <div className="flex flex-col gap-4">
          {/* 段落骨架 */}
          <div className="flex flex-col gap-2">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-3/4"></div>
          </div>

          {/* 子标题骨架 */}
          <div className="skeleton h-7 w-1/2 mt-4"></div>
          
          {/* 更多段落骨架 */}
          <div className="flex flex-col gap-2">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-5/6"></div>
            <div className="skeleton h-4 w-4/5"></div>
          </div>

          {/* 代码块骨架 */}
          <div className="skeleton h-32 w-full mt-4"></div>

          {/* 列表骨架 */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="skeleton h-4 w-4/5"></div>
            <div className="skeleton h-4 w-3/4"></div>
            <div className="skeleton h-4 w-5/6"></div>
          </div>

          {/* 另一个子标题 */}
          <div className="skeleton h-6 w-2/5 mt-6"></div>
          
          {/* 最后的段落 */}
          <div className="flex flex-col gap-2">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SkeletonWrapper skeleton={documentSkeleton}>
      {children}
    </SkeletonWrapper>
  );
}

// 子页面列表的骨架屏组件
export function ChildPagesContent({ children }: DocContentProps) {

  const childPagesSkeleton = (
    <section className="mt-8 p-6 bg-base-100/30 rounded-lg border border-base-300/30 shadow-sm">
      <div className="skeleton h-6 w-32 mb-4"></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="p-4 bg-base-200 rounded-lg border border-base-300">
            <div className="skeleton h-5 w-3/4"></div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <SkeletonWrapper skeleton={childPagesSkeleton}>
      {children}
    </SkeletonWrapper>
  );
}

// 导航骨架屏组件
export function NavigationContent({ children }: DocContentProps) {

  const navigationSkeleton = (
    <nav className="mt-8 flex justify-between items-center p-4 bg-base-100/30 rounded-lg border border-base-300/30 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center">
          <div className="skeleton w-4 h-4 mr-2"></div>
          <div>
            <div className="skeleton h-3 w-16 mb-1"></div>
            <div className="skeleton h-4 w-24"></div>
          </div>
        </div>
      </div>
      <div className="flex-1 text-right">
        <div className="flex items-center justify-end">
          <div>
            <div className="skeleton h-3 w-16 mb-1"></div>
            <div className="skeleton h-4 w-24"></div>
          </div>
          <div className="skeleton w-4 h-4 ml-2"></div>
        </div>
      </div>
    </nav>
  );

  return (
    <SkeletonWrapper skeleton={navigationSkeleton}>
      {children}
    </SkeletonWrapper>
  );
} 