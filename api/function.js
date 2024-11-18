
// 计算 x 和 y 的极值
function extent(nodes, accessor) {
  let min = Infinity;
  let max = -Infinity;

  for (const node of nodes) {
    const value = accessor(node);
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return [min, max];
}

// 计算 x 和 y 的总和
function sum(nodes, accessor) {
  let total = 0;

  for (const node of nodes) {
    total += accessor(node);
  }

  return total;
}

// 计算 x 和 y 的平均值
function average(nodes, accessor) {
  const total = sum(nodes, accessor);
  return total / nodes.length;
}

import _ from 'lodash';
function deepcopy(o) {

  //  var output = $.extend(true, {}, o); 

   return _.cloneDeep(o);
}

function graphPosRescale(graph) {
    let xdomain = extent(graph.nodes, d => d.x);
    let ydomain = extent(graph.nodes, d => d.y);
    let w = xdomain[1] - xdomain[0]
    let h = ydomain[1] - ydomain[0]
    
    let max_length = Math.max(w, h)
    
    graph.nodes.forEach(node => {
        node.x = (node.x - xdomain[0]) / max_length
        node.y = (node.y - ydomain[0]) / max_length
    });
}



export {
    extent, 
    sum, 
    average, 
    deepcopy,
    graphPosRescale,

}