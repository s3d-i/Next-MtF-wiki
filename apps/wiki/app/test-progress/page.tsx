"use client";

import { Link } from "../../components/progress";
import { useProgress, ProgressBar } from "../../components/progress";
import { useState } from "react";

export default function TestProgressPage() {
  const { start, complete, visible } = useProgress();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");


  const handleTestProgress = () => {
    setIsLoading(true);
    setDebugInfo("开始调用 start()...");
    
    console.log("=== 开始测试进度条 ===");
    console.log("调用 start() 前的状态:", { visible });
    
    // 立即调用 start()，不在 transition 中
    start();
    
    console.log("调用 start() 后的状态:", { visible });
    setDebugInfo("已调用 start()，进度条应该开始显示");
    
    // 模拟一个异步操作
    setTimeout(() => {
      console.log("=== 3秒后，准备完成 ===");
      console.log("调用 complete() 前的状态:", { visible });
      setDebugInfo("操作完成，准备调用 complete()");
      
      complete();
      
      console.log("调用 complete() 后的状态:", { visible });
      setDebugInfo("已调用 complete()，进度条应该完成并消失");
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">进度条测试页面</h1>
      
      {/* 调试信息 */}
      <div className="bg-red-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">调试信息：</h3>
        <p className="text-sm">{debugInfo || "等待操作..."}</p>
        <div className="mt-2 text-xs space-y-1">
          <p>内部状态 - visible: <span className={visible ? "text-orange-600 font-bold" : "text-gray-500"}>{visible.toString()}</span></p>
          <p>本地状态 - isLoading: <span className={isLoading ? "text-purple-600 font-bold" : "text-gray-500"}>{isLoading.toString()}</span></p>
        </div>
      </div>
      
      {/* 添加一个更明显的进度条用于测试 */}
      <div className="bg-yellow-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">本页面专用进度条（更明显）：</h3>
        <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
          <ProgressBar className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300" />
        </div>
        <p className="text-sm mt-2 text-gray-600">
          状态: {isLoading ? "加载中..." : "空闲"}
        </p>
        <p className="text-xs mt-1 text-gray-500">
          进度条显示条件: visible={visible.toString()} (只有为true时才显示)
        </p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">测试链接导航进度条</h2>
        <p className="text-sm text-gray-600">
          点击下面的链接，注意观察页面最顶部的细蓝色进度条和控制台输出
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/test-progress" 
            className="btn btn-primary"
          >
            刷新当前页面 (测试)
          </Link>
          
          <Link 
            href="/zh-cn/about" 
            className="btn btn-secondary"
          >
            跳转到关于页面
          </Link>
          
          <Link 
            href="/zh-cn" 
            className="btn btn-accent"
          >
            跳转到首页
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">测试手动触发进度条</h2>
        <button 
          onClick={handleTestProgress}
          className="btn btn-warning"
          disabled={isLoading}
        >
          {isLoading ? "加载中..." : "手动触发进度条"}
        </button>
        <p className="text-sm text-gray-600">
          点击后观察上方的两个测试进度条区域和调试信息，同时查看浏览器控制台
        </p>
      </div>

      <div className="bg-base-200 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">使用说明：</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>全局进度条</strong>：位于页面最顶部，是一个很细的蓝色条（高度4px）</li>
          <li><strong>测试进度条</strong>：位于上方黄色和绿色区域内，更粗更明显，方便观察</li>
          <li>点击链接按钮会触发全局进度条，页面跳转完成后自动消失</li>
          <li>点击"手动触发进度条"会同时触发所有进度条，3秒后自动完成</li>
          <li><strong>调试</strong>：观察红色区域的调试信息和内部状态，确认函数调用是否正常</li>
          <li><strong>控制台</strong>：打开浏览器开发者工具查看详细的状态变化日志</li>
        </ul>
      </div>
    </div>
  );
} 