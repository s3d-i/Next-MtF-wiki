import { Link } from "@/components/progress";
import { getLanguagesInfo } from "@/service/directory-service";

// 首页组件
export default async function HomePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;

  // 根据语言选择适当的文本
  const texts = {
    title: {
      "zh-cn": "测试站点",
      "zh-hant": "測試站點",
      ja: "テストサイト",
      es: "Sitio de prueba",
      en: "Test Site",
    },
    description: {
      "zh-cn": "仅供技术测试使用",
      "zh-hant": "僅供技術測試使用",
      ja: "技術テスト専用",
      es: "Solo para pruebas técnicas",
      en: "For technical testing only",
    },
    getStarted: {
      "zh-cn": "开始测试",
      "zh-hant": "開始測試",
      ja: "テストを開始",
      es: "Comenzar prueba",
      en: "Start Testing",
    },
  };

  const title =
    texts.title[language as keyof typeof texts.title] || texts.title.en;
  const description =
    texts.description[language as keyof typeof texts.description] ||
    texts.description.en;
  const getStarted =
    texts.getStarted[language as keyof typeof texts.getStarted] ||
    texts.getStarted.en;

  return (
    <div className="hero min-h-[70vh] bg-base-200 rounded-lg">
      <div className="text-center hero-content">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="py-6">{description}</p>
          <Link href={`/${language}/docs`} className="btn btn-primary">
            {getStarted}
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const languagesInfo = await getLanguagesInfo();
  return languagesInfo.map(info => ({ language: info.code }));
}