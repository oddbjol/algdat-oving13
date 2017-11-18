'use strict';
let map = L.map('map').setView([50, 20], 3);

let markerPoints = []; // 0 is 'from', 1 is 'to'

let from_marker, to_marker;
let path_line;
let result_popup;

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoib2RkYmpvbCIsImEiOiJjamE1YmFyMXphZXZkMzNxcTdjeTB5aWExIn0.DVflfmOZPjWAkHNEuORtYw'
}).addTo(map);

$("#findpath").click(function(){
    let from_name = $("#from_name").val();
    let from_lat = $("#from_lat").val();
    let from_long = $("#from_long").val();

    let to_name = $("#to_name").val();
    let to_lat = $("#to_lat").val();
    let to_long = $("#to_long").val();

    let method = $("input[name='method']:checked").val();
    
    let from,to;

    if(from_lat && from_long && to_lat && to_long) {
        from = [from_lat, from_long];
        to = [to_lat, to_long];
    }
    else if(from_name && to_name){
        from = from_name;
        to = to_name;
    }
    else{
        alert('invalid input');
        return;
    }

    $.ajax({
        type: "POST",
        url: 'http://localhost/rest/getpath',
        data: JSON.stringify({from: from, to: to, method: method}),
        contentType: 'application/json',
        dataType: 'text',
        success: function(data_orig){
            let data = JSON.parse(data_orig);
            //map.fitBounds(L.latLngBounds(data));

            resetMap();

            let infostring =    "jumps : " + data.path.length + "<br>";
            infostring +=       "method used: " + method + "<br>";

            result_popup = L.popup({autoClose: false, closeOnClick: false}).setLatLng(data.path[0]).setContent(infostring);
            map.addLayer(result_popup);

            if(path_line)
                map.removeLayer(path_line);
            path_line = L.polyline(data.path, {color: 'blue'});
            map.addLayer(path_line);
        },
        error: function(bleh, ex){
            alert(ex);
        }
    });
});

let marker_counter = 0;

map.on('click', function(e){

    $.get('http://localhost/rest/closestnode/' + JSON.stringify([e.latlng.lat,e.latlng.lng]),function(data){

        markerPoints[marker_counter % 2] = data;
        
        if(markerPoints[0]){
            $("#from_lat").val(markerPoints[0][0]);
            $("#from_long").val(markerPoints[0][1]);
        }
        if(markerPoints[1]){
            $("#to_lat").val(markerPoints[1][0]);
            $("#to_long").val(markerPoints[1][1]);
        }


        drawMarkers();
        
        marker_counter++;
    });

});

function drawMarkers() {

    if(from_marker) map.removeLayer(from_marker);
    if(to_marker) map.removeLayer(to_marker);

    if(markerPoints[0]){
        from_marker = new L.Marker(markerPoints[0],{title:'start \nlat: ' + markerPoints[0][0] + '\nlong: ' +markerPoints[0][1]});
        map.addLayer(from_marker);
    }
    if(markerPoints[1]){
        to_marker = new L.Marker(markerPoints[1],{title:'end \nlat: ' + markerPoints[1][0] + '\nlong: ' +markerPoints[1][1]});
        map.addLayer(to_marker);
    }


}

function resetMap(){
    if(from_marker) map.removeLayer(from_marker);
    if(to_marker) map.removeLayer(to_marker);
    markerPoints = [];
    marker_counter = 0;

    if(result_popup)
        map.removeLayer(result_popup);
}



