export default function BrowserUpgradeBanner() {
  return (
    <div className="browser-upgrade-banner" suppressHydrationWarning>
      <div>
        <strong>⚠️ 浏览器版本过旧 / Browser Version Too Old</strong>
      </div>
      <div style={{ marginTop: '4px' }}>
        您的浏览器版本过旧，可能无法正常显示本网站。请使用更新版本的浏览器或操作系统。
      </div>
      <div style={{ marginTop: '2px', fontSize: '12px', opacity: '0.9' }}>
        Your browser is outdated and may not display this website correctly.
        Please use a newer version of your browser or operating system.
      </div>
    </div>
  );
}
