let Edge = require("./Edge");

const EARTH_RADIUS = 6371000; // meters

function toRadians(deg){
    return deg * Math.PI / 180;
}

class MyNode {
    constructor(id, lat, long, dist = Number.MAX_SAFE_INTEGER) {
        this.id = id;
        this.lat = lat;
        this.lat_cos = Math.cos(toRadians(lat));
        this.long = long;
        this.dist = dist;
        this.edges = [];
        this.parent = null;
        this.visited = false;
    }

    addEdge(weight, target){
        this.edges.push(new Edge(weight, target));
    }

    toString(){
        return this.lat + "," + this.long;
    }

    get latlong() {
        return [this.lat, this.long];
    }


    //Jordens radius er 6371 km, høyeste fartsgrense 110km/t, 3600 sek/time
    //For å få hundredels sekunder: 2*6371/110*3600*100 = 41701090.90909090909090909091

    distanceTo(target){
        return 41701090.90909090909090909091 *
        Math.asin(
            Math.sqrt(
                Math.pow(
                    Math.sin(toRadians((this.lat - target.lat)/2)), 2
                )
                +
                this.lat_cos*target.lat_cos*
                Math.pow(
                    Math.sin(toRadians(this.long - target.long)/2), 2
                )
            )
        );
    }
}

module.exports = MyNode;