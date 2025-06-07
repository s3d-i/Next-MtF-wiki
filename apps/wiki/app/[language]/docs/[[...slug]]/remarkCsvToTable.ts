import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Code, Table, TableRow, TableCell, Parent, PhrasingContent, Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { hugoShortcodeFromMarkdown } from "mdast-util-md-hugo-marker";
import { getNonSelfClosingElements } from "./utils";
import { hugoShortcode } from "micromark-extension-md-hugo-marker";
import type { RemarkHugoShortcodeOptions } from "./remarkHugoShortcode";
import { getRemarkHugoShortcodeOptions, transformHugoShortcode, transformHugoShortcodeLinks } from "./remarkHugoShortcode";

/**
 * 解析CSV字符串为二维数组，支持引号包围的字段和跨行字段
 * @param csvContent CSV内容字符串
 * @returns 二维数组，每个子数组代表一行
 */
function parseCsv(csvContent: string): string[][] {
  const result: string[][] = [];
  const content = csvContent.trim();
  let i = 0;
  
  while (i < content.length) {
    const { row, nextIndex } = parseCsvRow(content, i);
    if (row.length > 0) {
      result.push(row);
    }
    i = nextIndex;
  }
  
  return result;
}

/**
 * 解析CSV行，支持跨行的引号字段
 * @param content 整个CSV内容
 * @param startIndex 开始解析的位置
 * @returns 解析结果和下一行的开始位置
 */
function parseCsvRow(content: string, startIndex: number): { row: string[], nextIndex: number } {
  const fields: string[] = [];
  let currentField = '';
  let i = startIndex;

  if(content.length === 0) {
    return { row: fields, nextIndex: i };
  }

  let isInQuote = false;

  if(content[0]=== '\"') {
    isInQuote = true;
    i++;
  }
  
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (char === ',') {
      // 字段分隔符（不在引号内）
      fields.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !isInQuote) {
      // 行结束（不在引号内）
      fields.push(currentField.trim());
      // 跳过行结束符
      let nextIndex = i + 1;
      if (char === '\r' && content[nextIndex] === '\n') {
        nextIndex++;
      }
      return { row: fields, nextIndex };
    } else if (char === '\"') {
      isInQuote = !isInQuote;
    } else {
      // 普通字符（包括引号内的换行符）
      currentField += char;
    }
    
    i++;
  }
  
  // 到达文件末尾
  if (currentField.length > 0 || fields.length > 0) {
    fields.push(currentField.trim());
  }
  
  return { row: fields, nextIndex: i };
}


/**
 * 解析单元格内容中的Markdown格式
 * @param cellContent 单元格内容字符串
 * @returns 解析后的内容节点数组
 */
function parseCellContent(cellContent: string, options: RemarkHugoShortcodeOptions): PhrasingContent[] {
  try {
    // 处理末尾反斜杠表示的换行
    let processedContent = cellContent.trim();
    
    // 如果内容以反斜杠结尾，将其转换为Markdown的硬换行
    if (processedContent.endsWith('\\')) {
      // 移除末尾的反斜杠，并添加两个空格+换行符（Markdown硬换行语法）
      processedContent = `${processedContent.slice(0, -1)}  \n`;
    }
    
    // 处理内容中间的反斜杠换行（行末的反斜杠转换为Markdown硬换行）
    processedContent = processedContent.replace(/\\\s*$/gm, '  \n');
    

    const options1 = getRemarkHugoShortcodeOptions(options);

    // 解析Markdown内容
    const ast = fromMarkdown(processedContent, {
      extensions: [hugoShortcode()],
      mdastExtensions: [hugoShortcodeFromMarkdown(options1)],
    });

    // console.log(JSON.stringify(ast, null, 2));

    transformHugoShortcode(ast);

    transformHugoShortcodeLinks(ast);

    // console.log(JSON.stringify(ast, null, 2));

    if(ast.children.length === 1 && (ast.children[0].type === 'mdxJsxFlowElement' || ast.children[0].type === 'mdxJsxTextElement')) {
      return [ast.children[0]] as PhrasingContent[];
    }
    
    // 如果解析结果是一个段落，返回段落的子节点
    if (ast.children.length === 1 && (ast.children[0].type === 'paragraph')) {
      return ast.children[0].children as PhrasingContent[];
    }
    
    // 否则，将所有子节点展平为内联内容
    const flattenedChildren: PhrasingContent[] = [];
    for (const child of ast.children) {
      if (child.type === 'paragraph') {
        flattenedChildren.push(...child.children as PhrasingContent[]);
        // 如果有多个段落，在段落之间添加换行
        if (ast.children.indexOf(child) < ast.children.length - 1) {
          flattenedChildren.push({ type: 'break' });
        }
      } else if (child.type === 'text' || child.type === 'link' || child.type === 'emphasis' || child.type === 'strong') {
        flattenedChildren.push(child as PhrasingContent);
      }
    }
    
    return flattenedChildren.length > 0 ? flattenedChildren : [{ type: 'text', value: cellContent }];
  } catch (error) {
    // 如果解析失败，回退到纯文本
    console.warn('Failed to parse cell content as Markdown:', cellContent, error);
    return [{ type: 'text', value: cellContent }];
  }
}

/**
 * 将二维数组转换为MDAST表格节点
 * @param csvData 二维数组数据
 * @returns MDAST表格节点
 */
function createTableNode(csvData: string[][], options: RemarkHugoShortcodeOptions): Table {
  if (csvData.length === 0) {
    throw new Error('CSV data is empty');
  }

  const rows: TableRow[] = [];
  
  // 创建表格行
  for (let i = 0; i < csvData.length; i++) {
    const rowData = csvData[i];
    const cells: TableCell[] = rowData.map(cellContent => ({
      type: 'tableCell',
      children: parseCellContent(cellContent, options)
    }));
    
    rows.push({
      type: 'tableRow',
      children: cells
    });
  }

  // 创建表格对齐配置（默认左对齐）
  const align = new Array(csvData[0].length).fill('left');

  return {
    type: 'table',
    align: align as ('left' | 'right' | 'center' | null)[],
    children: rows
  };
}

/**
 * Remark插件：将CSV代码块转换为Markdown表格
 */
export default function remarkCsvToTable(options: RemarkHugoShortcodeOptions) {
  return (tree:Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      // 只处理language为csv的代码块
      if (node.lang !== 'csv') {
        return;
      }

      try {
        // 解析CSV内容
        const csvData = parseCsv(node.value);
        
        if (csvData.length === 0) {
          console.warn('Empty CSV content found');
          return;
        }

        // 创建表格节点
        const tableNode = createTableNode(csvData, options);
        
        // 替换代码块为表格
        if (parent && typeof index === 'number' && 'children' in parent) {
          (parent as Parent).children[index] = tableNode;
        }
      } catch (error) {
        console.error('Error processing CSV code block:', error);
        // 如果解析失败，保留原始代码块
      }
    });
  };
};