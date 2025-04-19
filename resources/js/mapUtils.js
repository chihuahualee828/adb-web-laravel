

export function createMarkerWithPopup(each, fields, latIndex, longIndex, icon, map, infoWindows, markersArray, bounds) {
    const pos = {
        lat: parseFloat(each[latIndex]),
        lng: parseFloat(each[longIndex])
    };
    let count;
    const content = each.map((val, index) => {
        const field = fields[index];
        if (field.includes("id") || field === "product_name" || field === "arrival_address_normalized") {
            return `<p>${field}: ${val}
                <button class="btn btn-outline-primary map-popup-btn " data-search="${val}" style="padding: 4px 6px; border-radius: 6px;">
                    <i class="bi bi-search"></i>
                </button>
            </p>`;
        }
        if (field === "count") {
            count = val;
        }
        return `<p>${field}: ${val}</p>`;
    }).join("");

    let color = '#00FF00'; // bright neon green
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
            scale: 8 + normalized * 10, // size varies slightly with count
            fillColor: color,
            fillOpacity: 0.9,
            strokeColor: '#333',
            strokeWeight: 1,
        },
        map: map,
    });

    marker.addListener("click", () => {
        infoWindows.forEach(iw => iw.close());
        infowindow.open({ anchor: marker, map, shouldFocus: false }, pos);
    });

    infoWindows.push(infowindow);
    markersArray.push(marker);
    bounds.extend(pos);
}


