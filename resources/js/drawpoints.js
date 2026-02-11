import { createMarkerWithPopup } from './mapUtils.js';
import { MarkerClusterer } from "@googlemaps/markerclusterer";

let clusterer; // keep global

// Shared state for this draw session
export let markersArray = [];
export let infoWindows = [];
export function drawPoints(response, icon) {
    const bounds = new google.maps.LatLngBounds();
    // const icons = {
    //     dollar: {
    //         url: "img/dollar_marker.png",
    //         scaledSize: new google.maps.Size(32, 32),
    //     },
    // };

    

    const { fields, rows } = response;
    const latIndex = fields.indexOf('lat');
    const longIndex = fields.indexOf('long');

    // Clear existing markers
    if (clusterer) {
        clusterer.clearMarkers();
    }
    markersArray.forEach(marker => marker.setMap(null));
    markersArray.length = 0; 

	infoWindows.forEach(iw => iw.close());
    infoWindows.length = 0;

    const rmIdIndex = fields.indexOf('rm_id');

    if (rmIdIndex !== -1) {
        // Group by rm_id
        const groups = {};
        for (let j = 0; j < rows.length; j++) {
            const row = rows[j];
            const id = row[rmIdIndex];
            if (!groups[id]) {
                groups[id] = [];
            }
            groups[id].push(row);
        }

        // Add count field for display
        const newFields = [...fields, 'location_count'];

        Object.values(groups).forEach(group => {
            const count = group.length;
            // Create a new row with the count appended
            const representativeRow = [...group[0], count];
            createMarkerWithPopup(representativeRow, newFields, latIndex, longIndex, icon, map, infoWindows, markersArray, bounds);
        });
    } else {
        for (let j = 0; j < rows.length; j++) {
            const each = rows[j];
            createMarkerWithPopup(each, fields, latIndex, longIndex, icon, map, infoWindows, markersArray, bounds);
        }
    }

    // Initialize or update clusterer
    if (!clusterer) {
        clusterer = new MarkerClusterer({ map, markers: markersArray });
    } else {
        clusterer.addMarkers(markersArray);
    }

    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
    if (map.getZoom() > 12) {
        map.setZoom(12);
    }
}

export function createLayer(response, icon) {
    const bounds = new google.maps.LatLngBounds();
    const localMarkers = [];
    const localInfoWindows = [];

    const { fields, rows } = response;
    const latIndex = fields.indexOf('lat');
    const longIndex = fields.indexOf('long');
    const rmIdIndex = fields.indexOf('rm_id');

    // Ensure we have a map reference
    const mapInstance = window.map;

    if (rmIdIndex !== -1) {
       // Group by rm_id
       const groups = {};
       for (let j = 0; j < rows.length; j++) {
           const row = rows[j];
           const id = row[rmIdIndex];
           if (!groups[id]) {
               groups[id] = [];
           }
           groups[id].push(row);
       }
   
        // Add count field for display
       const newFields = [...fields, 'location_count'];

       Object.values(groups).forEach(group => {
           const count = group.length;
           const representativeRow = [...group[0], count];
            createMarkerWithPopup(representativeRow, newFields, latIndex, longIndex, icon, mapInstance, localInfoWindows, localMarkers, bounds);
       });
   } else {
       for (let j = 0; j < rows.length; j++) {
           const each = rows[j];
           createMarkerWithPopup(each, fields, latIndex, longIndex, icon, mapInstance, localInfoWindows, localMarkers, bounds);
       }
   }
   
   return localMarkers;
}


// export function drawPoints(response, icon) {
//     var bounds = new google.maps.LatLngBounds();
//     const icons = {
//         dollar: {
//             url: "img/dollar_marker.png",
//             scaledSize: new google.maps.Size(32, 32),
//         },
//     };

//     // Clear existing markers
//     markersArray.forEach(marker => marker.setMap(null));
//     markersArray = [];

//     const { fields, rows } = response;

// 	console.log(fields,rows);
//     var latIndex = fields.indexOf('lat');
//     var longIndex = fields.indexOf('long');
// 	console.log(latIndex, longIndex);
//     for (let j = 0; j < rows.length; j++) {
//         var each = rows[j];
// 		// console.log(each);
//         const pos = {
//             lat: parseFloat(each[latIndex]),
//             lng: parseFloat(each[longIndex])
//         };

//         const infowindow = new google.maps.InfoWindow({
//             content: each.map((val, index) => {
//                 if (fields[index].includes("id") || fields[index] === "product_name" || fields[index] === "arrival_address_normalized") {
//                     return `<p>${fields[index]}: ${val} <button class='btn btn-success' style='margin-left:10px;' onclick='small_search("${val}")'><i class='fas fa-search fa-sm' style='margin:-5px'></i></button>`;
//                 } else {
//                     return `<p>${fields[index]}: ${val}`;
//                 }
//             }).join(""),
//             position: pos,
//             pixelOffset: new google.maps.Size(0, -40),
//         });

//         infoWindows.push(infowindow);

//         var marker = new google.maps.Marker({
//             position: pos,
//             icon: icons[icon],
//             map: map,
//         });

//         markersArray.push(marker);
//         bounds.extend(pos);

//         marker.addListener("click", () => {
//             infoWindows.forEach(iw => iw.close());
//             infowindow.open({
// 				anchor: marker,
// 				map,
// 				shouldFocus: false,
// 			  },pos);
//         });
		
//     }

//     map.setCenter(bounds.getCenter());
//     map.fitBounds(bounds);
//     if (map.getZoom() > 12) {
//         map.setZoom(12);
//     }
// }

