import { circleLayout} from '../api/layout.js';
import { deepcopy,  } from '../api/function.js';

// 重构后的函数
export function getSubGraphs (GF, k) {

  let graphFusion = JSON.parse(JSON.stringify(GF))
  // 构建邻接表
  const adjList = buildAdjacencyList(graphFusion.nodes, graphFusion.links);
  
  // 查找所有长度为 k 的环
  const cycles = findCycles(adjList, k);

  // 将环转换为子图
  const subGraphs = cycles.map(cycle => {
    const subGraph = {
      nodes: [],
      links: [],
      constraint_nodes_id:[],
      constraint_nodes_index:[],
    };

    // 收集环中的节点
    cycle.forEach(nodeId => {
      const node = graphFusion.nodes.find(node => node.id === nodeId);
      if (node) {
        // 创建一个新的节点对象，并添加 index 属性
        subGraph.nodes.push(deepcopy(node));
        subGraph.constraint_nodes_id.push(deepcopy(node.id));
        subGraph.constraint_nodes_index.push(deepcopy(node.index));
      }
    });

    // 收集环中的边
    for (let i = 0; i < cycle.length; i++) {
      const sourceId = cycle[i];
      const targetId = cycle[(i + 1) % cycle.length];
      const link = graphFusion.links.find(link => (
        (link.source === sourceId && link.target === targetId) ||
        (link.source === targetId && link.target === sourceId)
      ));
      if (link) {
        // console.log('11:', link)
        subGraph.links.push(link);
      }
    }

    let [cx, cy] = circleLayout(subGraph)
    subGraph.centerX = cx;
    subGraph.centerY = cy;

    return subGraph;
  });
  // console.log(JSON.parse(JSON.stringify(subGraphs[0])))
  return subGraphs;
}

// 构建邻接表
function buildAdjacencyList(nodes, links) {
  const adjList = {};

  nodes.forEach(node => {
    adjList[node.id] = [];
  });

  links.forEach(link => {
    const source = link.source;
    const target = link.target;
    if (!adjList[source]) adjList[source] = [];
    if (!adjList[target]) adjList[target] = [];
    adjList[source].push(target);
    adjList[target].push(source);
  });

  return adjList;
}

// 查找所有长度为 k 的环
function findCycles(adjList, k) {
  const cycles = [];
  const visited = new Set();

  function dfs(node, start, path, depth) {
    if (depth === k) {
      if (adjList[path[path.length - 1]].includes(start)) {
        // 找到一个长度为 k 的环
        // const cycle = [...path, start].sort();
        const cycle = [...path].sort();
        if (!cycles.some(c => c.every((v, i) => v === cycle[i]))) {
          // console.log('cirle:', cycle)
          cycles.push(cycle);
        }
      }
      return;
    }

    for (const neighbor of adjList[node]) {
      if (path.includes(neighbor)) continue; // 避免回溯
      if (neighbor === start && depth < k - 1) continue; // 避免过早回到起点
      dfs(neighbor, start, [...path, neighbor], depth + 1);
    }
  }

  for (const node in adjList) {
    if (visited.has(node)) continue;
    visited.add(node);
    dfs(node, node, [node], 1);
  }

  return cycles;
}
