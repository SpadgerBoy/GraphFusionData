
import fs from 'fs';
import path from 'path';
import { getNewGraph } from './components/GetNewGraph.js';


// 指定要读取的文件夹路径
const __dirname = process.cwd();
const input_dir = path.join(__dirname, 'static');
const output_dir = path.join(__dirname, 'output');
// 读取文件夹中的所有文件
fs.readdir(input_dir, (err, files) => {
  if (err) {
    return console.error('无法扫描目录: ' + err);
  } 

  // 过滤出 JSON 文件
  const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

  
  // 逐个读取 JSON 文件
  jsonFiles.forEach(file => {
    const filePath = path.join(input_dir, file);
    // 去掉后缀名
    const fileNameWithoutExtension = path.basename(filePath, path.extname(filePath));
  
    var graphFusion = {};

    console.log(`Load graph from ${filePath}...`)
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return console.error(`无法读取文件: ${filePath}, 错误: ${err}`);
        }
        // 解析 JSON 数据
        const jsonData = JSON.parse(data);
        // const jsonData = data;

        graphFusion.nodes = jsonData.nodes;
        graphFusion.links = jsonData.links;

        // var output_path = path.join(output_dir, 'data.json');
        // saveJsonToFile(jsonData, output_path)

        // console.log('load graph:',  jsonData)
        getNewGraph(jsonData, output_dir, fileNameWithoutExtension)

        console.log(`已处理文件: ${file}`);
    });
  });
});