// query.js
import { getCachedLayer, saveCachedLayer } from './indexedDbUtils.js';
import { chartAbortControllers } from './drawpPie.js';

export let currentAbortController = null;
export let currentRequestToken = null;

// Abort all pending requests when page is being unloaded (refresh/close)
window.addEventListener('beforeunload', () => {
    if (currentAbortController) {
        currentAbortController.abort();
    }
    
    // Also abort all chart requests synchronously
    Object.keys(chartAbortControllers).forEach(key => {
        if (chartAbortControllers[key]) {
            chartAbortControllers[key].abort();
        }
    });
});

export function submitQuery(filters) {
    // const filters = localStorage.getItem('filters');
    if (!filters) return;
    console.log("Filters submitted:", filters);
    // const query = JSON.parse(filters);
    // const query = filters;
    // if (query[0] === "---" || query[1] === "---") return;
    if (currentAbortController) {
        currentAbortController.abort();
    }
    
    // Create a new controller for this request
    currentAbortController = new AbortController();

    const requestToken = Symbol('query');
    currentRequestToken = requestToken;


    return fetch('/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify(filters),
      signal: currentAbortController.signal // attach the signal here
    })
      .then(res => res.json())
      .then(data => {
        // console.log("Query result:", data);
        // return data;
        return { data, token: requestToken }; 
        // You can now call draw_points(data), updateTable(data), etc.
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('%c[Abort] Previous main query aborted', "color: orange; font-weight: bold;");
        } else {
          console.error('Query error:', err);
        }
      });
  }
  

  
  
export function search(text) {
    if (!text) return;
    console.log(text);

    if (currentAbortController) {
        currentAbortController.abort();
    }
    
    // Create a new controller for this request
    currentAbortController = new AbortController();

    const requestToken = Symbol('query');
    currentRequestToken = requestToken;

    return fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify({ searchText: text }),
      signal: currentAbortController.signal
    })
    .then(res => res.json())
    .then(data => {
      // Handle response: draw_points, generateDataTable, etc.
        //   return data;
        return { data, token: requestToken }; 
    })
    .catch(err => {
        if (err.name === 'AbortError') {
          console.log('%c[Abort] Previous search aborted', "color: orange; font-weight: bold;");
        } else {
          console.error('Query error:', err);
        }
      });
  }
  


export async function checkLayer(id) {

    // const checkBox = document.getElementById(id);
    console.log("Checkbox ID:", id);

    // Check IndexedDB first
    const cachedData = await getCachedLayer(id);
    if (cachedData) {
        console.log("Using IndexedDB cached layer for:", id);
        map.data.addGeoJson(cachedData);
        map.data.setStyle({ fillColor: 'green' });
        return;
    }

    const data = {
      type: "FeatureCollection",
      features: [],
    };

    // Abort previous layer request if exists
    if (currentAbortController) {
        currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    // if (checkBox.checked) {
      fetch('/get-layer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ layer: id }),
        signal: currentAbortController.signal
      })
      .then(response => response.json())
      .then(response => {

        const indexOfGeoJson = response[0].indexOf('st_asgeojson');
        response.shift();
        let featureId = 0;
  
        response.forEach(each => {
          const geojson = JSON.parse(each[indexOfGeoJson]);
          const feature = {
            type: "Feature",
            id: id + featureId,
            properties: { title: each[indexOfGeoJson - 1] },
            geometry: geojson
          };
          data.features.push(feature);
          featureId++;
        });

        // Save to IndexedDB
        saveCachedLayer(id, data);
  
        map.data.addGeoJson(data);
        map.data.setStyle({ fillColor: 'green' });
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          console.log('%c[Abort] Layer fetch aborted', "color: orange; font-style: italic;");
        } else {
          console.error("Layer fetch failed:", err);
        }
      });
  
  }

  export function unCheckLayer(id) {

    // const checkBox = document.getElementById(id);
    console.log("Checkbox ID:", id);
    const data = {
      type: "FeatureCollection",
      features: [],
    };

    map.data.forEach(feature => {
        if (feature.getId().includes(id)) {
          map.data.remove(feature);
        }
      });
  
  }


  
// export function small_search(searchText) {
//     if (!searchText) return;
  
//     fetch('/search', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({ searchText }),
//     })
//       .then(res => res.json())
//       .then(response => {
//         console.log(response);
//         if (response && response.length > 1) {
//           draw_points(response, "dollar");
//           generateDataTable(response);
  
//           const fields = response[0];
//           if (fields.includes("product_id")) {
//             draw_pie_chart(searchText, "product_id", "county");
//             draw_pie_chart(searchText, "product_id", "season");
//           } else if (fields.includes("product_name")) {
//             draw_pie_chart(searchText, "product_name", "county");
//             draw_pie_chart(searchText, "product_name", "season");
//           } else if (fields.includes("primary_category")) {
//             draw_pie_chart(searchText, "primary_category", "county");
//             draw_pie_chart(searchText, "primary_category", "season");
//           }
//         } else {
//           alert("no result");
//         }
//       })
//       .catch(err => console.error(err));
//   }
  