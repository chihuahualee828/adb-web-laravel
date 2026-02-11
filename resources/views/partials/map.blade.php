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

    // Call global function if available (set by dashboard.js)
    if (window.moveToCurrentPosition) {
        window.moveToCurrentPosition();
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