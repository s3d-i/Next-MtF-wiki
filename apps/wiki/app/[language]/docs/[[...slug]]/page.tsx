import { type MDXComponents, MDXRemote } from "next-mdx-remote-client/rsc";
import { getFrontmatter } from "next-mdx-remote-client/utils";
import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { ShortCodeComp } from "@/components/shortcode";
import { remarkHugoShortcode } from "./remarkHugoShortcode";
import type { Frontmatter } from "./types";
import { getContentDir, getIndexPageSlugs } from "./utils";
import remarkHeadingId from "remark-heading-id";
import remarkCsvToTable from "./remarkCsvToTable";
import {
  getDocFullPath,
  getDocsNavigation,
  getLocalImagePath,
} from "../directory-service";
import Link from "next/link";
import type { DetailedHTMLProps, ImgHTMLAttributes } from "react";
import { t } from "@/lib/i18n";

interface DocParams {
  language: string;
  slug: string[];
}

// 1. 用 generateStaticParams 在构建时生成所有路由
export async function generateStaticParams() {
  const { generateAllStaticParams } = await import("../directory-service");
  const allParams = await generateAllStaticParams();

  // 过滤出只有文档路由的参数
  const docParams: DocParams[] = allParams
    .filter((param) => "slug" in param)
    .map((param) => ({
      language: param.language,
      slug: param.slug || [],
    }));

  // console.log("docParams: ", docParams);
  return docParams;
}

// 2. 在 page 组件里，根据 language 和 slug 去读取并渲染对应的 md(x) 内容
export default async function DocPage({
  params,
}: {
  params: Promise<DocParams>;
}) {
  const { language, slug } = await params;

  // 处理 slug 为 undefined 的情况
  const slugArray = slug || [];
  const slugPath = slugArray.join("/");

  const contentRootDir = getContentDir();

  const fullPath = await getDocFullPath(language, slugPath, contentRootDir);

  if (!fullPath) {
    return notFound();
  }

  const isIndexPage = getIndexPageSlugs().some(slug=>fullPath.endsWith(slug));

  const fileContents = await fs.readFile(fullPath, "utf-8");

  const { frontmatter, strippedSource } =
    getFrontmatter<Frontmatter>(fileContents);
  const pageTitle =
    frontmatter?.title || slugArray[slugArray.length - 1] || "文档";

  const navigationItems = await getDocsNavigation(language);

  const hugoRemarkOptions = {
    currentLanguage: language,
    navigationItems: navigationItems,
    currentSlug: slugPath,
    isCurrentSlugIndex: isIndexPage,
  };

  function remarkHugoShortcodePlugin(this: unknown) {
    return remarkHugoShortcode.call(this, hugoRemarkOptions);
  }

  function remarkCsvToTablePlugin() {
    return remarkCsvToTable(hugoRemarkOptions);
  }

  const mdxRawContent: string = strippedSource;
  const remarkPlugins = [
    remarkHeadingId,
    remarkCsvToTablePlugin,
    remarkHugoShortcodePlugin,
    remarkGfm,
    remarkMath,
  ];

  async function ImageComponent(
    props: DetailedHTMLProps<
      ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >
  ) {
    const imagePath = props.src as string;
    return (
      <img
        src={imagePath || ""}
        alt={props.alt || ""}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // 定义组件映射
  const components: MDXComponents = {
    ShortCodeComp: (props) => (
      <ShortCodeComp
        {...props}
        mdContext={{
          currentLanguage: language,
          currentSlug: slugPath,
          isCurrentSlugIndex: isIndexPage,
        }}
      />
    ),
    Link,
    img: ImageComponent,
  };

  const ErrorContent = ({ error }: { error: Error }) => {
    console.log("⚠️ Compile Error: ", { fullPath, error });
    return (
      <article>
        <h1>处理内容时发生错误</h1>
        <p>无法加载或解析文件：{fullPath}</p>
        <pre>{String(error)}</pre>
        <MDXRemote
          source={`\`\`\`\`mdx\n${mdxRawContent}\n\`\`\`\``}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkMath],
              format: "md",
            },
          }}
        />
      </article>
    );
  };

  return (
    <article className="prose dark:prose-invert max-w-none">
      <header>
        <h1>{pageTitle}</h1>
        {/* 你可以在这里添加其他 frontmatter 信息的渲染, e.g., date, author */}
      </header>

      <MDXRemote
        source={mdxRawContent}
        components={components}
        onError={ErrorContent}
        options={{
          mdxOptions: {
            remarkPlugins: remarkPlugins,
            remarkRehypeOptions: {
              footnoteLabel: t("footnoteLabel", language),
              footnoteLabelProperties: {},
            },
            format: "md",
          },
        }}
      />
    </article>
  );
}
