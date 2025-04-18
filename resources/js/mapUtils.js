

export function createMarkerWithPopup(each, fields, latIndex, longIndex, icon, map, icons, infoWindows, markersArray, bounds) {
    const pos = {
        lat: parseFloat(each[latIndex]),
        lng: parseFloat(each[longIndex])
    };

    const content = each.map((val, index) => {
        const field = fields[index];
        if (field.includes("id") || field === "product_name" || field === "arrival_address_normalized") {
            return `<p>${field}: ${val}
                <button class="btn btn-outline-primary map-popup-btn " data-search="${val}" style="padding: 4px 6px; border-radius: 6px;">
                    <i class="bi bi-search"></i>
                </button>
            </p>`;
        }
        return `<p>${field}: ${val}</p>`;
    }).join("");

    const infowindow = new google.maps.InfoWindow({
        content,
        position: pos,
        pixelOffset: new google.maps.Size(0, -40),
    });

    const marker = new google.maps.Marker({
        position: pos,
        icon: icons[icon],
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


