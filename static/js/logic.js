var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Grab the json
d3.json(queryUrl).then(function(earthquakeData) {
    // console.log(earthquakeData)
    var features = earthquakeData.features;
    var markers = [];
    
    // Loop through the features array of each earthquake
    for (var i = 0; i < features.length; i++){
        
        var feature = features[i];
        var lon = feature.geometry.coordinates[0];
        var lat = feature.geometry.coordinates[1];
        var depth = feature.geometry.coordinates[2];
        var location = feature.properties.place;
        var time = feature.properties.time;
        var color = '';

        // Setting color depth for each earthquake
        if (depth >= 90){
            color = "red"
        } else if (depth >= 70){
            color = "orange"
        } else if (depth >= 50){
            color = "tan"
        } else if (depth >= 30){
            color = "yellow"
        } else if (depth >= 10){
            color = "darkgreen"
        } else {
            color = "lightgreen"
        }

        // For each earthquake create a marker that binds to a popup
        var marker = L.circle([lat, lon], {
            radius: feature.properties.mag * 12000,
            fillColor: color,
            fillOpacity: 0.75,
            weight: 0.5
        }).bindPopup(`<h2> Magnitude: ${feature.properties.mag} </h2> <hr> <h4> Location: ${location} </h4> <p> Time: ${new Date(time)} </p>`)

        markers.push(marker);
    }

    // Create a earthquakes variable to hold the markers layers
    var earthquakes = L.layerGroup(markers)

    //Pass variable to createMap function to display on map
    createMap(earthquakes);
});

function createMap(earthquakes){
   
    var streetmap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
        attribution: 'Tiles &copy; CartoDB'});

    var map = L.map("map", {
        center: [37.333, -120.523],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    var baseMap = {
        "Gray map": streetmap
    };
     
    var overlayMaps = {
        "Earthquake": earthquakes
    };

    L.control.layers(baseMap, overlayMaps, {
        collapsed: false,
    }).addTo(map);

    // legend colors
    function getColor(mags) {
        return mags > 90 ? 'red':
        mags > 70 ? "orange":
        mags > 50 ? "tan":
        mags > 30 ? 'yellow':
        mags > 10 ? 'darkgreen':
        'lightgreen';
    }

    // A legend to display info about map mags.
    var legendDisplay = L.control({
        position: "bottomright"
    });

    // When the layer control is added insert div class "legend".
    legendDisplay.onAdd = function(map) {
        var div = L.DomUtil.create("div", "info legend");
        mags = [-10, 10, 30, 50, 70, 90];
        labels = [];

        // Loop though mags numbers for legend color match
        for (var i=0; i < mags.length; i++) {
            // Push to labels array to add to DOM element
            div.innerHTML += `<i style="background:`+ getColor(mags[i]+1)+`"></i>` + mags[i]+(mags[i+1] ? '&ndash;' +
            mags[i+1] + '<br>': '+')
        }
        return div;
    };

    // Add to legend to map
    legendDisplay.addTo(map);
}