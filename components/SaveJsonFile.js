import fs from 'fs';
import path from 'path';
/**
 * 将 JSON 数据保存到指定的文件中
 * @param {Object} data - 要保存的 JSON 数据
 * @param {string} outputFileName - 输出文件名（包括路径）
 */
export function saveJsonToFile(data, outputFileName) {
  // 确保输出目录存在
  const outputDir = path.dirname(outputFileName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 将 JSON 数据写入文件
  fs.writeFile(outputFileName, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error('无法写入文件:', err);
    } else {
      console.log(`文件已成功保存到: ${outputFileName}`);
    }
  });
}

