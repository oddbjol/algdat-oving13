let restify = require("restify");
let Graph = require("../graph/Graph");

let server = restify.createServer();

let g; // the graph

const CONFIG_PROD = {
    nodes: 'graph/noder.txt',
    edges: 'graph/kanter.txt',
    pointsOfInterest: 'graph/interessepkt.txt'
};

const CONFIG_DEBUG = {
    nodes: 'graph/albania-noder.txt',
    edges: 'graph/albania-kanter.txt',
    pointsOfInterest: 'graph/albania-interessepkt.txt'
};

const CONFIG = CONFIG_DEBUG;

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
    console.log("request body: " + JSON.stringify(req.body));
    let from = req.body.from;
    let to = req.body.to;

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

    let path = g.AStar(from_index, to_index);
    res.send(path);
    return next();
});

server.get('rest/getnodes',function(req,res,next){
    let out = [];
    for(let i = 0; i < g.nodes.length; i++)
        out.push([g.nodes[i].lat,g.nodes[i].long]);
    res.send(out);
    return next();
});

server.get('rest/closestnode/:latlng',function(req,res,next){
    let latlng = JSON.parse(req.params.latlng);
    let closest_node = g.closestNode(latlng[0],latlng[1]);
    res.send([closest_node.lat, closest_node.long]);
    return next();
});

server.listen(80, function(){
    console.log("loading map data...");

    g = new Graph(CONFIG.nodes, CONFIG.edges, CONFIG.pointsOfInterest, function(){
        console.log("Done loading map data.");
    });
});