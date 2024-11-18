
输入文件夹：static/

输出文件夹： output/

获取数据集：

```bash
node main.js
```


输出文件名的格式：`{文件名}_{环的大小}_{索引}.json`

输出文件的格式：

- nodes: 节点信息
- links: 边信息
- constraint_nodes_id: 被约束节点的id
- constraint_nodes_index: 被约束节点的index

```json
{
  "nodes": [
    {
      "id": "34",
      "index": 0,
      "x": 0.2195565864187859,
      "y": 0.6045215142914989
    },
    ...
  ],
  "links": [
    {
      "source": "34",
      "target": "40"
    },
    ...
  ],
  "constraint_nodes_id": ["34", "40", "41"],
  "constraint_nodes_index": [0, 1, 2]
}
```

环的大小：components/GetNewGraph.js
```js
  // k为环的长度
  for (let k=3; k<=5; k++){ 
    //...  
  }   
```

约束子图的尺度：api/layout.js

```js
  //设置约束子图的尺度
  // let width = w * 2.0
  // let height = h * 2.0
  let layoutR = Math.min(width, height) * 0.8
```