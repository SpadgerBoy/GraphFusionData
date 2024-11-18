
import { extent, sum, average,  deepcopy} from '../api/function.js';
export function GetWholeGraph(graphdata) {

    let graph = graphdata
    // console.log('load graph:',  deepcopy(graph))

    let radius = 10
    let width = 700
    let height = 700

    if ('x' in graph.nodes[0]) {

        let xdomain = extent(graph.nodes, d => d.x);
        let ydomain = extent(graph.nodes, d => d.y);
        let smallW = xdomain[1] - xdomain[0]
        let smallH = ydomain[1] - ydomain[0]
        let avr_x = average(graph.nodes, d => d.x);
        let avr_y = average(graph.nodes, d => d.y);

        
        graph.nodes.forEach(d => {
            d.x = d.x - avr_x + width / 2
            d.fx = d.x
        })

        graph.nodes.forEach(d => {
            d.y = d.y - avr_y + height / 2
            d.fy = d.y
        })

        // console.log('NewGraph:', deepcopy(graph))
    }
    // let ids = []
    // graph.nodes.forEach(d => {
    //   ids.push(d.id)
    // })
    // graph.links.forEach(d => {
    //   d.source = ids.indexOf(d.source)
    //   d.target = ids.indexOf(d.target)
    // })
    // console.log('NewGraph1:', deepcopy(graph))
    return graph
    
  

}

// module.exports = { GetWholeGraph };