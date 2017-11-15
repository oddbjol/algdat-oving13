require("google-closure-library");
let _ = require("lodash");
let fs = require("fs");
let readline = require("readline");

let MyNode = require("./MyNode");

goog.require('goog.structs.PriorityQueue');


class Graph{

    constructor(node_file = "", edge_file = "", callback = null) {
        this.nodes = [];

        let _this = this;

        if (!node_file || !edge_file)
            return;

        let lineReader = readline.createInterface({input: fs.createReadStream(node_file)});
        lineReader.on('line', function(line){
            // Read in nodes
            let elements = line.trim().split(/\s+/);
            if(elements.length == 1){
                console.log("Skipping first line");
                return;
            }
            let id = elements[0];
            let lat = elements[1];
            let long = elements[2];
            _this.addNode(id, lat, long);
        });
        lineReader.on('close',function(){

            let lineReader2 = readline.createInterface({input: fs.createReadStream(edge_file)});

            lineReader2.on('line', function(line){
                // Read in edges
                let elements = line.trim().split(/\s+/);
                if(elements.length == 1){
                    console.log("Skipping first line");
                    return;
                }
                let from = elements[0];
                let to = elements[1];
                let weight = elements[2];
                _this.addEdge(from, to, weight);
            });

            lineReader2.on('close',function(){

                if(callback)
                    callback();
            });
        });
    }

    addNode(id, lat, long){
        this.nodes[id] = new MyNode(id, lat, long);
    }

    addEdge(from_id, to_id, weight){
        this.nodes[from_id].addEdge(weight, this.nodes[to_id]);
    }

    djikstra(root_node_id, target_node_id){
        "use strict";

        this._reset();

        let root_node = this.nodes[root_node_id];
        root_node.dist = 0;

        let queue = new goog.structs.PriorityQueue();

        queue.enqueue(root_node.dist, root_node);
        root_node.visited = true;

        while(!queue.isEmpty()){
            let node = queue.dequeue();

            for(let edge of node.edges){
                let neighbour = edge.target;
                if(+node.dist + +edge.weight < neighbour.dist){
                    neighbour.dist = +node.dist + +edge.weight;
                    neighbour.parent = node;
                    neighbour.visited = true;
                    queue.enqueue(neighbour.dist, neighbour);
                }
            }
        }

        console.log("visited with djikstra: " + this._nodesVisited());

        return Graph._getPath(this.nodes[target_node_id]);
    }

    AStar(root_node_id, target_node_id){
        "use strict";

        this._reset();

        let root_node = this.nodes[root_node_id];
        let target_node = this.nodes[target_node_id];
        root_node.dist = 0;

        let queue = new goog.structs.PriorityQueue();

        queue.enqueue(root_node.dist, root_node);
        root_node.visited = true;

        while(!queue.isEmpty()){
            let node = queue.dequeue();

            if(node.id == target_node.id)
                break;

            for(let edge of node.edges){
                let neighbour = edge.target;
                if(+node.dist + +edge.weight < neighbour.dist){
                    neighbour.dist = +node.dist + +edge.weight;
                    neighbour.parent = node;
                    neighbour.visited = true;
                    queue.enqueue(neighbour.dist + neighbour.distanceTo(target_node), neighbour);
                }
            }
        }

        console.log("visited with AStar: " + this._nodesVisited());

        return Graph._getPath(this.nodes[target_node_id]);
    }

    static _getPath(target_node){
        let path = [];
        path.push(target_node);
        let cur_node = target_node;
        while(cur_node.parent){
            path.push(cur_node.parent);
            cur_node = cur_node.parent;
        }
        return path.reverse();
    }

    static pathToString(path){
        let out = "";
        for(let node of path)
            out += node.lat + "," + node.long + "\n";
        return out;
    }

    _reset(){
        for(let node of this.nodes){
            node.dist = Number.MAX_SAFE_INTEGER;
            node.parent = null;
            this.visited = false;
        }
    }

    _nodesVisited(){
        let num_visited = 0;
        for(let node of this.nodes)
            if(node.visited)
                num_visited++;
        return num_visited;
    }
}


function main(){

    let g2 = new Graph("albania-noder.txt","albania-kanter.txt", function(){

        console.time("djikstra");
        let path_djikstra = g2.djikstra(41621, 11342);
        console.timeEnd("djikstra");

        console.time("astar");
        let path_astar = g2.AStar(41621, 11342);
        console.timeEnd("astar");

        console.log("\nare the paths the same? " + _.isEqual(path_djikstra,path_astar) + "\n");
        console.log("Here is the path: \n");
        console.log(Graph.pathToString(path_djikstra));

    });
}

main();

module.exports = Graph;