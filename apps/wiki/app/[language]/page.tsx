import { Link } from "@/components/progress";
import { getLanguagesInfo } from "@/service/directory-service";
import { sT } from "@/lib/i18n/server";

// 首页组件
export default async function HomePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;

  return (
    <div className="hero bg-base-200 min-h-[calc(100vh-100px)]">
      <div className="hero-content flex-col lg:flex-row">
        <img
          alt="logo"
          src="/hugo-static/new/mtf-wiki-square.svg"
          className="max-w-sm"
        />
        <div>
          <h1 className="text-5xl font-bold">
            {sT("home-page-title", language)}
          </h1>
          <p className="py-6">{sT("home-page-description", language)}</p>
          <Link href={`/${language}/docs`} className="btn btn-primary">
            {sT("home-page-get-started", language)}
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const languagesInfo = await getLanguagesInfo();
  return languagesInfo.map((info) => ({ language: info.code }));
}
