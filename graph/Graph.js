require("google-closure-library");
let _ = require("lodash");
let fs = require("fs");
let readline = require("readline");

let MyNode = require("./MyNode");
let Edge = require("./Edge");

goog.require('goog.structs.PriorityQueue');


class Graph{

    constructor(node_file = "", edge_file = "", poi_file = "", callback = null) {
        this.nodes = [];
        this.pointsOfInterest = {};

        let _this = this;

        if (!node_file || !edge_file || !poi_file)
            return;

        console.log("reading node file " + node_file);
        console.time("read node file");
        let lineReader = readline.createInterface({input: fs.createReadStream(node_file)});
        lineReader.on('line', function(line){
            // Read in nodes
            let elements = line.split(' ');
            if(elements.length == 1)
                return;

            let id = parseInt(elements[0]);
            let lat = parseFloat(elements[1]);
            let long = parseFloat(elements[2]);
            _this.addNode(id, lat, long);
        });
        lineReader.on('close',function(){

            console.timeEnd("read node file");
            console.time("read edge file");

            console.log("reading edge file " + edge_file);

            let lineReader2 = readline.createInterface({input: fs.createReadStream(edge_file)});

            lineReader2.on('line', function(line){
                // Read in edges
                let elements = line.split(' ');
                if(elements.length == 1)
                    return;

                let from = parseInt(elements[0]);
                let to = parseInt(elements[1]);
                let weight = parseInt(elements[2]);
                _this.nodes[from].edges.push(new Edge(weight, _this.nodes[to]));
            });

            lineReader2.on('close',function(){

                console.timeEnd("read edge file");

                let lineReader3 = readline.createInterface({input: fs.createReadStream(poi_file)});

                console.log('reading poi file ' + poi_file);

                lineReader3.on('line', function(line){
                    let elements = line.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
                    if(elements.length == 1)
                        return;

                    _this.pointsOfInterest[elements[2]] = parseInt(elements[0]);
                });

                lineReader3.on('close',function(){
                    if(callback)
                        callback();
                });


            });
        });
    }

    addNode(id, lat, long){
        this.nodes[id] = new MyNode(id, lat, long);
    }

    djikstra(from_node_id, to_node_id){
        "use strict";

        this._reset();

        let root_node = this.nodes[from_node_id];
        root_node.dist = 0;

        let target_node = this.nodes[to_node_id];

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
                    queue.enqueue(neighbour.dist, neighbour);
                }
            }
        }

        return {path: Graph._getPath(target_node), path_duration_ms: target_node.dist};
    }

    AStar(from_node_id, to_node_id){
        "use strict";

        this._reset();

        let root_node = this.nodes[from_node_id];
        let target_node = this.nodes[to_node_id];
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

        return {path: Graph._getPath(target_node), path_duration_ms: target_node.dist*10};
    }

    static _getPath(target_node){
        let path = [];
        let cur_node = target_node;
        while(cur_node){
            path.push(cur_node.latlong);
            cur_node = cur_node.parent;
        }
        return path;
    }

    _reset(){
        for(let node of this.nodes){
            node.dist = Number.MAX_SAFE_INTEGER;
            node.parent = null;
            node.visited = false;
        }
    }

    nodesVisited(){
        let num_visited = 0;
        for(let node of this.nodes)
            if(node.visited)
                num_visited++;
        return num_visited;
    }

    closestNode(lat,long){
        let search_node = new MyNode(0,lat,long);
        let lowest_dist_found = Number.MAX_SAFE_INTEGER;
        let closest_node_found = null;
        for(let node of this.nodes){
            let dist = Math.sqrt(Math.pow(node.lat - search_node.lat, 2) + Math.pow(node.long - search_node.long, 2));
            if(dist < lowest_dist_found){
                lowest_dist_found = dist;
                closest_node_found = node;
            }
        }
        return closest_node_found;
    }

    indexOf(lat,long){
        for(let i = 0; i < this.nodes.length; i++){
            if(lat == this.nodes[i].lat && long == this.nodes[i].long)
                return i;
        }
        return -1;
    }

    indexOfName(name){
        let id = this.pointsOfInterest['"' + name + '"'];
        console.log("finding index of " + name + " => " + id);
        return id ? id : -1;
    }
}

module.exports = Graph;