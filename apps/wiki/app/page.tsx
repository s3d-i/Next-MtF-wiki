import { getLanguageName } from '@/lib/i18n/client';
import { getAvailableLanguages } from '@/service/directory-service';
import HomeRedirect from '../components/HomeRedirect';

export default async function Home() {
  // 获取所有可用语言
  const availableLanguages = await getAvailableLanguages();
  // 构建语言选项
  const languageConfigs = availableLanguages.map((langCode) => ({
    code: langCode,
    name: getLanguageName(langCode),
  }));
  return <HomeRedirect languageConfigs={languageConfigs} />;
}
