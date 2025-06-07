import { redirect } from "next/navigation";

// 根页面重定向到默认语言
export default function Home() {
  // 默认重定向到简体中文
  redirect("/zh-cn");
}
