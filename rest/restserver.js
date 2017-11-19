let restify = require("restify");
let Graph = require("../graph/Graph");

let argv = process.argv.slice(2);

let server = restify.createServer();

let g;  //  the graph

const CONFIG_PROD = {
    nodes: 'graph/data/noder.txt',
    edges: 'graph/data/kanter.txt',
    pointsOfInterest: 'graph/data/interessepkt.txt'
};

const CONFIG_DEBUG = {
    nodes: 'graph/data/albania-noder.txt',
    edges: 'graph/data/albania-kanter.txt',
    pointsOfInterest: 'graph/data/albania-interessepkt.txt'
};

let CONFIG;

if(argv[0] == 'debug')
    CONFIG = CONFIG_DEBUG;
else
    CONFIG = CONFIG_PROD;

const corsMiddleware = require('restify-cors-middleware');

const cors = corsMiddleware({
    origins: ['*'],
    allowHeaders: ['API-Token'],
    exposeHeaders: ['API-Token-Expiry']
});

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.queryParser({
    mapParams: true
}));
server.use(restify.plugins.bodyParser({
    mapParams: true
}));

server.post('rest/getpath',function(req, res, next){
    console.log("getpath called with body: " + JSON.stringify(req.body));
    let from = req.body.from;
    let to = req.body.to;
    let method = req.body.method;

    let from_index, to_index;

    if(Array.isArray(from) && Array.isArray(to)){
        from_index = g.indexOf(from[0],from[1]);
        to_index = g.indexOf(to[0],to[1]);
    }
    else{
        from_index = g.indexOfName(from);
        to_index = g.indexOfName(to);
    }

    if(from_index < 0 || to_index < 0)
        return next(false);

    let path;

    let time = process.hrtime();

    if(method == 'djikstra')
        path = g.djikstra(from_index, to_index);
    else if(method == 'astar')
        path = g.AStar(from_index, to_index);
    else return next(false);

    console.log("getpath returning with path length " + path.path.length);

    time = process.hrtime(time);
    time = parseFloat(time.toString().replace(',','.')).toFixed(3);

    res.send({path: path.path, path_duration_ms: path.path_duration_ms, nodesVisited: g.nodesVisited(), time: time});
    return next();
});

server.get('rest/closestnode/:latlng',function(req,res,next){
    console.log("closestnode called with params: " + JSON.stringify(req.params));
    let latlng = JSON.parse(req.params.latlng);
    let closest_node = g.closestNode(latlng[0],latlng[1]);
    console.log("closestnode returning with " + [closest_node.lat, closest_node.long]);
    res.send([closest_node.lat, closest_node.long]);
    return next();
});

server.listen(80, function(){
    console.log("loading map data...");

    g = new Graph(CONFIG.nodes, CONFIG.edges, CONFIG.pointsOfInterest, function(){
        console.log("Done loading map data.");
    });
});