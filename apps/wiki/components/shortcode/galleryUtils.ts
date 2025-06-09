import fs from 'node:fs';
import path from 'node:path';
import { getContentDir } from "@/app/[language]/(documents)/[...slug]/utils";
import { getDirPath } from '@/service/directory-service';

export interface GalleryImage {
  path: string;
  alt?: string;
  width?: number;
  height?: number;
  name: string;
}

export function getGalleryImages(
  language: string,
  slug: string,
  pattern: string
): GalleryImage[] {
  try {
    // 构建当前文档的目录路径
    const contentDir = getContentDir();
    const relativePathDir = getDirPath(path.join(language, ...slug.split('/')));
    const docDir = path.join(contentDir, relativePathDir)  ;
    
    // 如果目录不存在，返回空数组 
    if (!fs.existsSync(docDir)) {
      return [];
    }
    
    // 读取目录中的所有文件
    const files = fs.readdirSync(docDir);

    // console.log("files: ",  JSON.stringify(files, null, 2));
    
    // 过滤出图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // 根据pattern过滤图片
    const matchedImages = imageFiles.filter(file => {
      if (!pattern) return true;
      
      // 支持通配符匹配
      const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
      return regex.test(file);
    });
    
    // 构建图片信息
    const images: GalleryImage[] = matchedImages.map(filename => {
      const relativePath = `/hugo-files/${relativePathDir}/${filename}`;
      
      return {
        path: relativePath,
        name: filename,
        alt: path.parse(filename).name,
        // 在SSG环境中，我们无法动态获取图片尺寸，可以使用默认值
        width: undefined,
        height: undefined
      };
    });
    
    return images;
  } catch (error) {
    console.error('Error reading gallery images:', error);
    return [];
  }
} 