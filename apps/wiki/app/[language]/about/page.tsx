import { getLanguagesInfo } from "../docs/directory-service";

export default function AboutPage() {
  return <div>About</div>;
}

export async function generateStaticParams() {
  const languagesInfo = await getLanguagesInfo();
  return languagesInfo.map(info => ({ language: info.code }));
}