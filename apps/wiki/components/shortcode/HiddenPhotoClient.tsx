'use client';

import { useState } from "react";

/**
 * HiddenPhoto组件用于显示可点击显示的隐藏图片
 * 使用示例: {{< hiddenphoto "/path/to/image.jpg" "图片描述" >}}
 */
export default function HiddenPhotoClient({ src, alt }: { src: string, alt:string }) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleVisibility();
    }
  };

  return (
    <button
      type="button"
      className={`relative overflow-hidden transition-all duration-300 not-prose w-full ${isVisible ? "show" : ""}`}
      onClick={toggleVisibility}
      onKeyDown={handleKeyDown}
      aria-label={isVisible ? "隐藏图片" : "显示图片"}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-30 blur-sm"}`}
      />
      {!isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-black cursor-pointer bg-opacity-30">
          <div className="px-4 py-2 text-white bg-black bg-opacity-50 rounded">
            点击显示图片
          </div>
        </div>
      )}
    </button>
  );
}
