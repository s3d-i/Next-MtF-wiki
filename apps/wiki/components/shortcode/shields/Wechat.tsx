import type { ShortCodeCompProps } from "../types";
import ShieldsBase from "./Base";

export default function Wechat({ attrs }: ShortCodeCompProps) {
  const message = attrs[0] || "";
  // 根据当前语言环境选择标签文本
  const label = "微信"; // 可以根据实际需求修改为动态获取
  
  return (
    <ShieldsBase
      label={label}
      logo="WeChat"
      message={message}
      color="07C160"
      alt={`${label} ${message}`}
    />
  );
}
