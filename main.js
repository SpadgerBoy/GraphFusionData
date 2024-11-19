
import fs from 'fs';
import path from 'path';
import { getNewGraph } from './components/GetNewGraph.js';
import { getNewGraph_grids } from './components/GetNewGraph_grids.js';


// 指定要读取的文件夹路径
const __dirname = process.cwd();
const input_dir = path.join(__dirname, 'static1');
const output_dir = path.join(__dirname, 'output1');
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
        let new_nodes = []
        let new_links = []
        for(let i =0; i<jsonData.pos.length; i++){
            let node = {}
            node['id'] = `${i}`
            node['index'] = i
            node['x'] = jsonData.pos[i][0]
            node['y'] = jsonData.pos[i][1]
            new_nodes.push(node)
        }
        for(let i=0; i<jsonData.edge_index.length; i++){
            let link = {}
            link.source = `${jsonData.edge_index[i][0]}`
            link.target = `${jsonData.edge_index[i][1]}`
            new_links.push(link)
        }
        // graphFusion = {"nodes": new_nodes, "links": new_links}
        graphFusion.nodes = new_nodes
        graphFusion.links = new_links
        
        // console.log('load graph:',  graphFusion)

        // var output_path = path.join(output_dir, 'data.json');
        // saveJsonToFile(jsonData, output_path)

        // console.log('load graph:',  jsonData)
        // getNewGraph(graphFusion, output_dir, fileNameWithoutExtension)
        getNewGraph_grids(graphFusion, output_dir, fileNameWithoutExtension)
        console.log(`已处理文件: ${file}`);
    });
  });
});