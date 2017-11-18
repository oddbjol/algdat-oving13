'use strict';
let map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoib2RkYmpvbCIsImEiOiJjamE1YmFyMXphZXZkMzNxcTdjeTB5aWExIn0.DVflfmOZPjWAkHNEuORtYw'
}).addTo(map);

$("#findpath").click(function(){
    let from_lat = $("#from_lat").val();
    let from_long = $("#from_long").val();
    let to_lat = $("#to_lat").val();
    let to_long = $("#to_long").val();


    $.ajax({
        type: "POST",
        url: 'http://localhost/rest/getpath',
        data: JSON.stringify({from:{lat: from_lat, long: from_long}, to:{lat: to_lat, long: to_long}}),
        contentType: 'application/json',
        dataType: 'text',
        success: function(data_orig){
            let data = JSON.parse(data_orig);
            map.fitBounds(L.latLngBounds(data));
            L.marker(data[0],{title:'start \nlat: ' + data[0][0] + '\nlong: ' + data[0][1] }).addTo(map);
            L.polyline(data, {color: 'blue'}).addTo(map);
            L.marker(data[data.length-1],{title:'end \nlat: ' + data[data.length-1][0] + '\nlong: ' + data[data.length-1][1] }).addTo(map);
        },
        error: function(bleh, ex){
            alert(ex);
        }
    });
});