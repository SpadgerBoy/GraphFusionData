import { circleLayout} from '../api/layout.js';
import { deepcopy,  } from '../api/function.js';


export function getSubGraphs(GF, k) {
  let graphFusion = JSON.parse(JSON.stringify(GF));

  // 构建邻接表
  const adjList = buildAdjacencyList(graphFusion.nodes, graphFusion.links);

  // 查找所有长度为 k 的环
  const cycles = findCycles(adjList, k);

  // 将环转换为子图
  const subGraphs = cycles.map(cycle => {
    const subGraph = {
      nodes: [],
      links: [],
      constraint_nodes_id: [],
      constraint_nodes_index: [],
    };

    // 收集环中的节点
    cycle.forEach(nodeId => {
      const node = graphFusion.nodes.find(node => node.id === nodeId);
      if (node) {
        subGraph.nodes.push({ ...node });
        subGraph.constraint_nodes_id.push(node.id);
        subGraph.constraint_nodes_index.push(node.index);
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
        subGraph.links.push({ ...link });
      }
    }

    let [cx, cy] = circleLayout(subGraph);
    subGraph.centerX = cx;
    subGraph.centerY = cy;

    return subGraph;
  });

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
      if (path[0] === start && adjList[node].includes(start)) {
        const cycle = [...path];
        if (!cycles.some(c => c.every((v, i) => v === cycle[i]))) {
          cycles.push(cycle);
        }
      }
      return;
    }

    for (const neighbor of adjList[node]) {
      if (path.includes(neighbor)) continue;
      dfs(neighbor, start, [...path, neighbor], depth + 1);
    }
  }

  for (const node in adjList) {
    dfs(node, node, [node], 1);
  }

  return cycles;
}
