import '../api/numeric.js';
import { deepcopy} from '../api/function.js';
export function LaplacianForceLayout(base_graph, dense_graph, mentalMaps, alphaArr, alphaMax, initNodes) {
    // graph 主图、每个点都和其他点相连 边数：n*(n-1)/2
    // mentalMaps（子图集合，每个子图都是约束后的位置
    // alphaArr（子图约束点的权重为1000，权重数组）、
    // alphaMax（最大权重）
    // initNodes 初始化节点，加入约束后的，未迭代的节点
    
    // console.log('base_graph:', JSON.parse(JSON.stringify(base_graph)))
    // console.log('dense_graph:', JSON.parse(JSON.stringify(dense_graph)))
    // console.log('mentalMaps:', mentalMaps[0])
    // console.log('alphaArr:', alphaArr)
    // console.log('alphaMax:', alphaMax)
    // console.log('initNodes:', JSON.parse(JSON.stringify(initNodes)))
    
    var iterationThreshold = 0.00005;
    var iterationLowNumber = 100;
    var iterationUpNumber = 999;
    
    // console.log('Laplacian Force Layout...')
    var nodeLen = dense_graph.nodes.length
    var edgeLen = dense_graph.links.length
    var nodeIdMap = [];
    var mentalNodeIdMaps = [];
    var row = [];
    var mentalGraphs = [];

    // nodeIdMap 用来存储主图中节点名称到索引的映射。
    for (var i = 0; i < nodeLen; i++) {
        row.push(0);
        nodeIdMap[dense_graph.nodes[i].name] = i;
    }
    // 每一个子图，创建了 mentalNodeIdMap 来存储该子图中节点名称到索引的映射，
    for (var i in mentalMaps) {
        var mentalMap = mentalMaps[i]
        var mentalNodeIdMap = []
        for (var i = 0, mn = mentalMap.nodes.length; i < mn; i++) {
          mentalNodeIdMap[mentalMap.nodes[i].name] = i
        }
        mentalNodeIdMaps.push(mentalNodeIdMap)
        mentalMap = calIdealDistance(mentalMap, mentalNodeIdMap)
        mentalGraphs.push(mentalMap)
    }
    // 定义了 calDistance2 和 calDistance 函数来分别计算两点间距离的平方和实际距离。
    function calDistance2(a, b) {
      let small = 0.00000000000001
      let v = (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])
      if (Math.abs(v - small) < small) return small
      else return v
    }

    function calDistance(a, b) {
      let small = 0.00000000000001
      let v = Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]))
      if (Math.abs(v - small) < small) return small
      else return v
    }
    // calIdealDistance 函数来计算并存储每一对节点之间的理想距离。
    function calIdealDistance(subgraph, subgraphNodeIdMap) {
        let snum = subgraph.nodes.length
        let distanceIdMap = {}
        for(let i = 0; i < snum; i++) {
            for(let j = i+1; j< snum; j++) {
                let d = calDistance(subgraph.nodes[i].pos, subgraph.nodes[j].pos)
                distanceIdMap[i + ',' + j] = d
                distanceIdMap[j + ',' + i] = d
            }
        }
      subgraph['distanceIdMap'] = distanceIdMap
      return subgraph
    }
    // return

    //创建全部元素都为0的空矩阵
    // row = [0, 0, 0, 0, 0 ,0, 0, 0, ]
    var Lw = numeric.diag(row);
    var Lwd = numeric.diag(row);
    // console.log('row:', row)
    // console.log('Lw:', JSON.parse(JSON.stringify(Lw)))
    // console.log('Lwd:', JSON.parse(JSON.stringify(Lwd)))
    
    
    // 子图任意两点间的边长参数
    var byEdges = false;
    if (byEdges) {
      for (var k = 0, mgn = mentalGraphs.length; k < mgn; k++) {
        for (var i = 0, en = mentalGraphs[k].links.length; i < en; i++) {
          var s = mentalNodeIdMaps[k][mentalGraphs[k].links[i].source];
          var t = mentalNodeIdMaps[k][mentalGraphs[k].links[i].target];
          var sr = nodeIdMap[mentalGraphs[k].links[i].source];
          var tr = nodeIdMap[mentalGraphs[k].links[i].target];
          if (s != undefined && t != undefined && sr != undefined && tr != undefined) {
            //  console.log(mentalMap.links[i].source + ', ' + mentalMap.links[i].target);
            // 理想边长
            //  直接计算出来
            var posS = mentalGraphs[k].nodes[s].pos;
            var posT = mentalGraphs[k].nodes[t].pos;
            // 实际边长
            var posSreal = dense_graph.nodes[sr].pos;
            var posTreal = dense_graph.nodes[tr].pos;

            Lw[sr][tr] = Lw[tr][sr] += -1.0 / calDistance2(posS, posT) * alphaArr[k];
            Lwd[sr][tr] = Lwd[tr][sr] += -1.0 / (calDistance(posS, posT) * calDistance(posSreal, posTreal)) * alphaArr[k];
          }
        }
      }

    } else { // 任意两点之间 graph 的 Lw, Lw,dfl
      for (var k = 0, mgn = mentalGraphs.length; k < mgn; k++) {
        var mentalMapLen = mentalGraphs[k].nodes.length;
        let distanceIdMap = mentalGraphs[k].distanceIdMap
        for (var i = 0; i < mentalMapLen - 1; i++) {
          for (var j = i + 1; j < mentalMapLen; j++) {
            var s = nodeIdMap[mentalGraphs[k].nodes[i].name];
            var t = nodeIdMap[mentalGraphs[k].nodes[j].name];
            if (s != undefined && t != undefined) {
              //  console.log(mentalMap.nodes[i].name + ', ' + mentalMap.nodes[j].name);
              // 理想边长
              // 直接计算出来，预先算好
              // var posS = mentalGraphs[k].nodes[i].pos;
              // var posT = mentalGraphs[k].nodes[j].pos;
              let idealDistance = distanceIdMap[i + ',' + j]
              // 实际边长
              var posSreal = dense_graph.nodes[s].pos;
              var posTreal = dense_graph.nodes[t].pos;

              // Lw[s][t] = Lw[t][s] += -1.0 / calDistance2(posS, posT) * alphaArr[k];
              // Lw始终保持不变
              Lw[s][t] = Lw[t][s] += -1.0 / (idealDistance * idealDistance) * alphaArr[k];
              Lwd[s][t] = Lwd[t][s] += -1.0 / (idealDistance * calDistance(posSreal, posTreal)) * alphaArr[k];
            }
          }
        }
      }
    }


    // 不包含子图中边的边参数
    for (var i = 0; i < edgeLen; i++) {
      var s = nodeIdMap[dense_graph.links[i].source];
      var t = nodeIdMap[dense_graph.links[i].target];
      if (s != undefined && t != undefined) {
        var d = -1.0 / calDistance2(dense_graph.nodes[s].pos, dense_graph.nodes[t].pos);
        Lw[s][t] += d;
        Lw[t][s] += d;
        Lwd[s][t] += d;
        Lwd[t][s] += d;
      }
    }

    // 计算对角线元素
    for (var i = 0; i < nodeLen; i++) {
      for (var j = 0; j < nodeLen; j++) {
        if (i != j) {
          Lw[i][i] += -1.0 * Lw[i][j];
          Lwd[i][i] += -1.0 * Lwd[i][j];
        }
      }
    }

    var curPositionX = [];
    var curPositionY = [];

    //mentalMap
    //
    // 初始解, 不同的赋值方式
    // 从 initNodes 中提取每个节点的初始x和y坐标，存储在 curPositionX 和 curPositionY 数组中。
    for (var i = 0, n = initNodes.length; i < n; i++) {
      curPositionX.push(initNodes[i].pos[0]);
      curPositionY.push(initNodes[i].pos[1]);
    }

    // console.log('curPosition', curPositionX, curPositionY)
    var times = nodeLen * 2, time0 = -1;
    var E = 0, E0 = 0;
      
    // 使用 D3.js 的 forceSimulation 来设置迭代过程。

    let iterNum = 0;
    // console.log('iterNum: ', iterNum);
    // force.start( function() {
    while(1){
        // console.log('iterNum: ', iterNum);
        iterNum++;
        // 在每次迭代（tick事件）中，使用共轭梯度法（ConjugateGradientMethod）来计算新的节点位置。
        var newPositionX = ConjugateGradientMethod(Lw, numeric.dot(Lwd, curPositionX), curPositionX);
        var newPositionY = ConjugateGradientMethod(Lw, numeric.dot(Lwd, curPositionY), curPositionY);
        // var newPositionX = curPositionX
        // var newPositionY = curPositionY
        // 更新能量函数 E，它反映了当前布局与理想布局之间的差距。
        E0 = E;
        E = 0;
        if (byEdges) {
            for (var k = 0, mgn = mentalGraphs.length; k < mgn; k++) {
            for (var i = 0, men = mentalGraphs[k].links.length; i < men; i++) {
                var source = mentalGraphs[k].links[i].source;
                var target = mentalGraphs[k].links[i].target;
                var s = mentalNodeIdMaps[k][source];
                var t = mentalNodeIdMaps[k][target];
                var sr = nodeIdMap[source];
                var tr = nodeIdMap[target];
                if (s != undefined && t != undefined && sr != undefined && tr != undefined) {
                // 理想边长
                // var posS = mentalGraphs[k].nodes[s].pos;
                // var posT = mentalGraphs[k].nodes[t].pos;
                // var ideal = distance(posS, posT);
                // 
                // 实际边长
                var posSreal = [newPositionX[sr], newPositionY[sr]];
                var posTreal = [newPositionX[tr], newPositionY[tr]];
                var real = distance(posSreal, posTreal);

                E += alphaMax * (1.0 / (ideal * ideal)) * (real - ideal) * (real - ideal);
                }
            }
            }

        } else {
            for (var k = 0, mgn = mentalGraphs.length; k < mgn; k++) {
            var mentalMapLen = mentalGraphs[k].nodes.length;
            let distanceIdMap = mentalGraphs[k].distanceIdMap
            for (var i = 0; i < mentalMapLen - 1; i++) {
                for (var j = i + 1; j < mentalMapLen; j++) {
                var s = nodeIdMap[mentalGraphs[k].nodes[i].name];
                var t = nodeIdMap[mentalGraphs[k].nodes[j].name];
                if (s != undefined && t != undefined) {
                    // 理想边长
                    // var posS = mentalGraphs[k].nodes[i].pos;
                    // var posT = mentalGraphs[k].nodes[j].pos;
                    // var ideal = distance(posS, posT);
                    let idealDistance = distanceIdMap[i + ',' + j]
                    // 实际边长
                    var posSreal = [newPositionX[s], newPositionY[s]];
                    var posTreal = [newPositionX[t], newPositionY[t]];
                    var real = calDistance(posSreal, posTreal);
                    E += alphaMax * Math.abs(real - idealDistance)
                }
                }
            }
            }
        }

        // if (1==1) {
        // 不包含子图中边的边参数
        for (var i = 0; i < edgeLen; i++) {
            var s = nodeIdMap[dense_graph.links[i].source];
            var t = nodeIdMap[dense_graph.links[i].target];
            if (s != undefined && t != undefined) {
            // 理想边长
            var posS = dense_graph.nodes[s].pos;
            var posT = dense_graph.nodes[t].pos;
            var ideal = calDistance(posS, posT);

            // 实际边长
            var posSreal = [newPositionX[s], newPositionY[s]];
            var posTreal = [newPositionX[t], newPositionY[t]];
            var real = calDistance(posSreal, posTreal);
            E += Math.abs(real - ideal)
            }
        }

        // console.log(E, E0)

        if ((Math.abs(E - E0) / E < iterationThreshold && iterNum > iterationLowNumber) || iterNum > iterationUpNumber) {

            // console.log('Laplacian stop.')
            return base_graph
        }

        // console.log(time0, E, E0)

        curPositionX = newPositionX;
        curPositionY = newPositionY;

        var updateT = Math.random()
        // newPositionX = []
        // newPositionY = []
        // for (var i = 0, n = initNodes.length; i < n; i++) {
        //   newPositionX.push(initNodes[i].pos[0]);
        //   newPositionY.push(initNodes[i].pos[1]);
        // }
        // console.log('position', newPositionX, newPositionY)
        var newPosition = []
        var minx = 10000000000000000;
        var miny = 10000000000000000;
        for (var i = 0; i < newPositionX.length; i++) {
            newPosition.push([newPositionX[i], newPositionY[i]]);
            minx = minx < curPositionX[i] ? minx : newPositionX[i];
            miny = miny < curPositionY[i] ? miny : newPositionY[i];
        }
        for (var i = 0; i < newPositionX.length; i++) {
            newPosition[i][0] -= minx;
            newPosition[i][1] -= miny;
        }
        var new_position = newPosition
        var center = [0, 0]
        for (var i in new_position) {
            center[0] += new_position[i][0]
            center[1] += new_position[i][1]
        }
        center[0] /= new_position.length
        center[1] /= new_position.length

        for (var i = 0, ni = Lwd.length; i < ni; i++) {
            for (var j = 0, nj = Lwd[i].length; j < nj; j++) {
            Lwd[i][j] = 0;
            }
        }

        if (byEdges) {
            for (var k = 0, mgn = mentalGraphs.length; k < mgn; k++) {
            for (var i = 0, en = mentalGraphs[k].links.length; i < en; i++) {
                var s = mentalNodeIdMaps[k][mentalGraphs[k].links[i].source];
                var t = mentalNodeIdMaps[k][mentalGraphs[k].links[i].target];
                var sr = nodeIdMap[mentalGraphs[k].links[i].source];
                var tr = nodeIdMap[mentalGraphs[k].links[i].target];
                if (s != undefined && t != undefined && sr != undefined && tr != undefined) {
                // 理想边长
                var posS = mentalGraphs[k].nodes[s].pos;
                var posT = mentalGraphs[k].nodes[t].pos;
                // 实际边长
                var posSreal = [curPositionX[sr], curPositionY[sr]];
                var posTreal = [curPositionX[tr], curPositionY[tr]];

                Lw[sr][tr] = Lw[tr][sr] += -1.0 / calDistance2(posS, posT) * alphaArr[k];
                Lwd[sr][tr] = Lwd[tr][sr] += -1.0 / (distance(posS, posT) * distance(posSreal, posTreal)) * alphaArr[k];
                }
            }
            }

        } else {
            for (var k = 0, mgn = mentalGraphs.length; k < mgn; k++) {
            var mentalMapLen = mentalGraphs[k].nodes.length;
            let distanceIdMap = mentalGraphs[k].distanceIdMap
            for (var i = 0; i < mentalMapLen - 1; i++) {
                for (var j = i + 1; j < mentalMapLen; j++) {
                var s = nodeIdMap[mentalGraphs[k].nodes[i].name];
                var t = nodeIdMap[mentalGraphs[k].nodes[j].name];
                if (s != undefined && t != undefined) {
                    // 理想边长
                    // var posS = mentalGraphs[k].nodes[i].pos;
                    // var posT = mentalGraphs[k].nodes[j].pos;
                    let idealDistance = distanceIdMap[i + ',' + j]
                    // 实际边长
                    var posSreal = [curPositionX[s], curPositionY[s]]; //graph.nodes[s].pos;
                    var posTreal = [curPositionX[t], curPositionY[t]]; //graph.nodes[t].pos;

                    Lwd[s][t] = Lwd[t][s] += -1.0 / ( idealDistance * calDistance(posSreal, posTreal)) * alphaArr[k];
                }
                }
            }
            }
        }

        // 不包含子图中边的边参数
        for (var i = 0; i < edgeLen; i++) {
            var s = nodeIdMap[dense_graph.links[i].source];
            var t = nodeIdMap[dense_graph.links[i].target];
            if (s != undefined && t != undefined) {
            var posS = dense_graph.nodes[s].pos;
            var posT = dense_graph.nodes[t].pos;

            var posSreal = [curPositionX[s], curPositionY[s]];
            var posTreal = [curPositionX[t], curPositionY[t]];
            var d = -1.0 / (calDistance(posS, posT) * calDistance(posSreal, posTreal));
            Lwd[s][t] += d;
            Lwd[t][s] += d;
            }
        }
        // 计算对角线元素
        for (var i = 0; i < nodeLen; i++) {
            for (var j = 0; j < nodeLen; j++) {
            if (i != j) {
                Lwd[i][i] += -1.0 * Lwd[i][j];
            }
            }
        }

        base_graph.nodes.forEach(function(d){
            let x = new_position[nodeIdMap[d.id]][0];
            let y = new_position[nodeIdMap[d.id]][1];
            d.x = x;
            d.y = y;
        })
    }
    

}



// 共轭梯度 Ax= b
function ConjugateGradientMethod(A, b, x) {
    //https://en.wikipedia.org/wiki/Conjugate_gradient_method
    var n = b.length;
    var r = numeric.sub(b, numeric.dot(A, x)) // 初始残差
    var p = []  // 初始搜索方向
    for (let i = 0; i < n; i++) {
      p.push(r[i])
    }
    var rsold = numeric.dot(r, r)  // 初始残差平方
    // var iterations = n * 5;
    var iterations = n;
    var Ap;
    var alpha;
    var rsnew;

    while (iterations--) {
      Ap = numeric.dot(A, p)  // A * p
      alpha = rsold / (numeric.dot(p, Ap))  // 计算步长
      x = numeric.add(x, numeric.mul(alpha, p))  // 更新解
      r = numeric.sub(r, numeric.mul(alpha, Ap))  // 更新残差
      rsnew = numeric.dot(r, r) // 新的残差平方

      // 检查收敛条件
      if (Math.sqrt(rsnew) < 1e-10) break
      // 更新搜索方向
      p = numeric.add(r, numeric.mul(rsnew / rsold, p))
      // 更新旧的残差平方
      rsold = rsnew
    }
    return x;
}

