import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 源目录和目标目录
const sourceDir = path.join(__dirname, '..', 'source', 'content');
const targetDir = path.join(__dirname, '..', 'apps', 'wiki', 'public', 'hugo-files');

// 创建目标目录（如果不存在）
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    
    console.log(`创建目录: ${dirPath}`);
  }
}

// 复制文件
function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    ensureDirectoryExists(destDir);
    
    fs.copyFileSync(src, dest);
    console.log(`复制文件: ${src} -> ${dest}`);
  } catch (error) {
    console.error(`复制文件失败: ${src}`, error.message);
  }
}

// 递归遍历目录
function traverseDirectory(currentDir, relativePath = '') {
  try {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const newRelativePath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // 递归处理子目录
        traverseDirectory(fullPath, newRelativePath);
      } else if (stats.isFile()) {
        // 检查文件扩展名，排除 .md 文件
        const ext = path.extname(item).toLowerCase();
        if (ext !== '.md') {
          const targetPath = path.join(targetDir, newRelativePath);
          copyFile(fullPath, targetPath);
        } else {
          console.log(`跳过 Markdown 文件: ${fullPath}`);
        }
      }
    }
  } catch (error) {
    console.error(`遍历目录失败: ${currentDir}`, error.message);
  }
}

// 主函数
function main() {
  console.log('开始复制非 Markdown 文件...');
  console.log(`源目录: ${sourceDir}`);
  console.log(`目标目录: ${targetDir}`);
  console.log('=====================================');
  
  // 检查源目录是否存在
  if (!fs.existsSync(sourceDir)) {
    console.error(`源目录不存在: ${sourceDir}`);
    process.exit(1);
  }
  
  // 确保目标目录存在
  ensureDirectoryExists(targetDir);
  
  // 开始遍历和复制
  traverseDirectory(sourceDir);
  
  console.log('=====================================');
  console.log('复制完成！');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main }; 