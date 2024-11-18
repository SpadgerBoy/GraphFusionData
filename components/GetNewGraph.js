import { GetWholeGraph } from './WholeGraph.js';
import { saveJsonToFile } from './SaveJsonFile.js';
import { getSubGraphs } from './GetSubGraph.js';
import { LaplacianForceLayout } from './GetGraphFusion.js';
import { deepcopy, graphPosRescale } from '../api/function.js';
import * as path from 'path';


export function getNewGraph(graph, output_dir, fileNameWithoutExtension) {
    
    // k为环的长度
    for (let k=3; k<=6; k++){   
        
        console.log('Get subgraphs...')
        let subgraphs = getSubGraphs(graph, k);
    
        // console.log('subgraphs:', deepcopy(subgraphs))

        // let graph = GetWholeGraph(graph);
        
        let dense_graph = {};

        { // 获取一个稠密图, 不这样 group 可能会overlap
            let new_nodes = extract(graph).nodes 
            let new_links = []
            for (let i = 0; i < new_nodes.length; i++) {
            for (let j = i + 1; j < new_nodes.length; j++) {
                new_links.push({ 'source': new_nodes[i].name, 'target': new_nodes[j].name })
            }
            }
            dense_graph = { 'nodes': new_nodes, 'links': new_links }
        }

        if (subgraphs.length == 0) return;
       
        for (let i = 0; i < subgraphs.length; i++) {
            
            let base_graph = deepcopy(graph);
            
            // 将约束后的子图的节点坐标加入主图 
            let subgraph = subgraphs[i];
            subgraph.nodes.forEach(node => {
                const mainNode = base_graph.nodes.find(n => n.id === node.id);
                if (mainNode) {
                    mainNode.x = node.x;
                    mainNode.y = node.y;
                }
            });
            
            // let base_graph = extract(graph);

            let dense_graph_ = deepcopy(dense_graph)
            let subgraph_ = [extract(subgraph)]
            let initNodes = extract(base_graph).nodes    // 初始布局应该为约束后节点位置, 并不一定是全局最优
            let alphaMax = 1000
            let alphaArr = [1000]

            let new_Graph = LaplacianForceLayout(base_graph, dense_graph_, subgraph_, alphaArr, alphaMax, initNodes)
            new_Graph = simplify(new_Graph)
            // console.log(deepcopy(new_Graph))

            graphPosRescale(new_Graph)
            // console.log(deepcopy(new_Graph))

            new_Graph.constraint_nodes_id = subgraph.constraint_nodes_id
            new_Graph.constraint_nodes_index = subgraph.constraint_nodes_index
            
            var output_path = path.join(output_dir, `${fileNameWithoutExtension}_${k}_${i+1}.json`);
            saveJsonToFile(new_Graph, output_path)
        }
    }
}

function extract(graph) {
    let new_nodes = []
    let new_links = []
    for (let i in graph.nodes) {
        let node = {}
        node['name'] = graph.nodes[i].id
        node['pos'] = [graph.nodes[i].x, graph.nodes[i].y]
        new_nodes.push(node)
    }
    for (let i in graph.links) {
        let link = {}
        link.source = graph.links[i].source
        link.target = graph.links[i].target
        new_links.push(link)
    }
    // return { 'nodes': new_nodes, 'links': new_links, 'scale': graph.setting.scale }
    return { 'nodes': new_nodes, 'links': new_links}
}

//简化图的信息，便于保存
function simplify(graph){
    let new_nodes = []
    let new_links = []
    for (let i in graph.nodes) {
        let node = {}
        node['id'] = graph.nodes[i].id
        node['index'] = graph.nodes[i].index
        node['x'] = graph.nodes[i].x
        node['y'] = graph.nodes[i].y
        new_nodes.push(node)
    }
    for (let i in graph.links) {
        let link = {}
        link.source = graph.links[i].source
        link.target = graph.links[i].target
        new_links.push(link)
    }
    // return { 'nodes': new_nodes, 'links': new_links, 'scale': graph.setting.scale }
    return { 'nodes': new_nodes, 'links': new_links}
}