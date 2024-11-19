import { GetWholeGraph } from './WholeGraph.js';
import { saveJsonToFile } from './SaveJsonFile.js';
import { getSubGraphs } from './GetSubGraph.js';
import { LaplacianForceLayout } from './GetGraphFusion.js';
import { deepcopy, graphPosRescale } from '../api/function.js';
import { circleLayout, rectLayout} from '../api/layout.js';
import * as path from 'path';


export function getNewGraph_grids(graph, output_dir, fileNameWithoutExtension) {
    

    rectLayout(graph)
    // new_Graph = simplify(new_Graph)
    let new_Graph = simplify2(graph)
    // console.log(deepcopy(new_Graph))

    // new_Graph.constraint_nodes_id = subgraph.constraint_nodes_id
    // new_Graph.constraint_nodes_index = subgraph.constraint_nodes_index
            
    var output_path = path.join(output_dir, `${fileNameWithoutExtension}-grid.json`);
    saveJsonToFile(new_Graph, output_path)
    
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

function simplify2(graph){
    let pos = []
    let edge_index = []
    for (let i in graph.nodes) {
        let pos_i = [graph.nodes[i].x, graph.nodes[i].y]
        pos.push(pos_i)
    }
    for (let i in graph.links) {
        let link = [+graph.links[i].source, +graph.links[i].target]
        edge_index.push(link)
    }
    // return { 'nodes': new_nodes, 'links': new_links, 'scale': graph.setting.scale }
    return { 'pos': pos, 'edge_index': edge_index}
}