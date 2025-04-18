<div id="map" ></div>

@push('scripts')
<script>

const mapContainer = document.getElementById('map');
const popup = document.getElementById('mapPopup');

if (mapContainer && popup) {
    mapContainer.addEventListener('mouseenter', () => popup.classList.remove('d-none'));
    mapContainer.addEventListener('mouseleave', () => popup.classList.add('d-none'));
    }

// let map;
function initMap() {
    const options = {
        zoom: 10
    };

    window.map = new google.maps.Map(document.getElementById("map"), options);

    const icons = {
        google: {
            url: "/img/icons8-leaving-geo-fence-80.png",
            scaledSize: new google.maps.Size(50, 50)
        }
    };

    const infoWindow = new google.maps.InfoWindow();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                const marker = new google.maps.Marker({
                    position: pos,
                    icon: icons.google,
                    map: map
                });

                marker.addListener("click", () => {
                    infoWindow.setContent("You're here");
                    infoWindow.open({
                        anchor: marker,
                        map
                    });
                });

                map.setCenter(pos);
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}




</script>
<script
  src="https://maps.googleapis.com/maps/api/js?key={{ config('services.google.maps_key') }}&callback=initMap&loading=async"
  async defer>
</script>

@endpush