

export function createMarkerWithPopup(each, fields, latIndex, longIndex, icon, map, infoWindows, markersArray, bounds) {
    const pos = {
        lat: parseFloat(each[latIndex]),
        lng: parseFloat(each[longIndex])
    };
    let count;
    // Extract title if 'product_name' exists, else default
    const nameIndex = fields.indexOf("product_name");
    let title = "Details";
    if (nameIndex > -1) {
        title = each[nameIndex];
    }

    const itemsHtml = each.map((val, index) => {
        const field = fields[index];
        
        // Skip product_name from body since it's the header
        if (field === "product_name") return "";
        
        if (field === "count") {
            count = val;
        }

        let valueContent = val;
        // Add search button for specific fields
        if (field.includes("id") || field === "arrival_address_normalized") {
            valueContent = `
                <span>${val}</span>
                <span class="popup-btn-container">
                    <button class="map-popup-btn" data-search="${val}" title="Search this value">
                        <i class="bi bi-search"></i> Search
                    </button>
                </span>`;
        }

        return `
            <div class="popup-row">
                <span class="popup-label">${field.replace(/_/g, " ")}</span>
                <span class="popup-value">${valueContent}</span>
            </div>`;
    }).join("");

    const content = `
        <div class="modern-map-popup">
            <h6 class="popup-title">${title}</h6>
            ${itemsHtml}
        </div>`;

    let color = '#00a6ff'; // bright neon green
    let normalized = 0;    // default normalization
    if (count) {   
        const maxIntensity = 200;  // lowest green/blue component
        normalized = Math.min(Math.max(count / 100, 0), 1); // normalize to 0–1

        const gbValue = Math.floor(maxIntensity * (1 - normalized));
        color = `rgb(255, ${gbValue}, ${gbValue})`; // ranges from pink to deep red
    }
    const infowindow = new google.maps.InfoWindow({
        content,
        position: pos,
        pixelOffset: new google.maps.Size(0, -40),
    });

    const marker = new google.maps.Marker({
        position: pos,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6 + normalized * 10, // size varies slightly with count
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: '#333',
            strokeWeight: 0,
        },
        // map: map, // Handled by clusterer
    });

    marker.addListener("click", () => {
        infoWindows.forEach(iw => iw.close());
        infowindow.open({ anchor: marker, map, shouldFocus: false }, pos);
    });

    infoWindows.push(infowindow);
    markersArray.push(marker);
    bounds.extend(pos);
}

let currentLocationMarker = null;

export function moveToCurrentPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                if (window.map) {
                     window.map.panTo(pos);
                     window.map.setZoom(15); // Zoom in
                     
                     if (currentLocationMarker) {
                        currentLocationMarker.setMap(null);
                     }

                     currentLocationMarker = new google.maps.Marker({
                        position: pos,
                        map: window.map,
                        animation: google.maps.Animation.DROP,
                        title: "Current Location",
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "white",
                            strokeWeight: 2,
                        },
                     });
                }
            },
            () => {
                alert("Error: The Geolocation service failed.");
            }
        );
    } else {
        alert("Error: Your browser doesn't support geolocation.");
    }
}


