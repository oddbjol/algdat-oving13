let restify = require("restify");
let Graph = require("../graph/Graph");

let server = restify.createServer();

let g; // the graph

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

    let from_index = g.indexOf(from.lat,from.long);
    let to_index = g.indexOf(to.lat,to.long);

    if(from_index < 0 || to_index < 0)
        return next(false);

    console.log("from: " + from_index);
    console.log("to: " + to_index);

    let path = g.AStar(from_index, to_index);
    res.send(path);
    return next();
});

server.listen(80, function(){
    console.log("loading map data...");

    g = new Graph("graph/albania-noder.txt","graph/albania-kanter.txt", function(){
        console.log("Done loading map data.");
    });
});