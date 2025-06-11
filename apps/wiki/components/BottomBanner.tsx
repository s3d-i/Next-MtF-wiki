"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { Link } from "@/components/progress/next";
import {
  bannerVisibilityAtom,
  closeBannerAtom,
} from "../lib/banner-atoms";

interface BottomBannerProps {
  language: string;
  text: string;
  buttonText: string | null;
  buttonLink: string | null;
  closeButtonText: string | null;
  enableCloseButton?: boolean;
}
export default function BottomBanner({
  text,
  buttonText,
  buttonLink,
  closeButtonText,
}: BottomBannerProps) {
  const [isVisible] = useAtom(bannerVisibilityAtom);
  const [, closeBanner] = useAtom(closeBannerAtom);

  const handleClose = () => {
    if (closeButtonText) {
      closeBanner();
    }
  };
  //console.log("BottomBanner", isVisible, enableCloseButton);
  return (
    <div
      className={`
        ${isVisible ? "sticky" : "block"}
          bottom-0 left-0 right-0 z-40 
        bg-[#444] text-white shadow-lg
      `}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* 文字内容 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base font-medium truncate">{text}</p>
          </div>

          {/* 按钮组 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* 主按钮 */}
            {buttonText && buttonLink && (
              <Link
                type="button"
                href={buttonLink}
                className="
                  px-3 py-1.5 text-xs md:text-sm font-medium
                  bg-white text-blue-600 hover:bg-gray-100
                  rounded-md transition-all duration-200
                  whitespace-nowrap
                "
              >
                {buttonText}
              </Link>
            )}

            {/* 关闭按钮 */}
            {closeButtonText && isVisible && (
              <button
                type="button"
                onClick={handleClose}
                className="
                  px-3 py-1.5 text-xs md:text-sm font-medium
                  bg-white/20 hover:bg-white/30 
                  border border-white/30 hover:border-white/50
                  rounded-md transition-all duration-200
                  whitespace-nowrap
                "
              >
                {closeButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
