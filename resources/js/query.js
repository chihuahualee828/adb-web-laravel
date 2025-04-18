// query.js

export function submitQuery(filters) {
    // const filters = localStorage.getItem('filters');
    if (!filters) return;
    console.log("Filters submitted:", filters);
    // const query = JSON.parse(filters);
    const query = filters;
    if (query[0] === "---" || query[1] === "---") return;

    return fetch('/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify({ query })
    })
      .then(res => res.json())
      .then(data => {
        console.log("Query result:", data);
        return data;
        // You can now call draw_points(data), updateTable(data), etc.
      })
      .catch(err => console.error("Error in query fetch:", err));
  }
  

  
  
export function search(text) {
    if (!text) return;
    console.log(text);
    return fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify({ searchText: text })
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.rows.length);
      // Handle response: draw_points, generateDataTable, etc.
      return data;
    })
    .catch(err => console.error(err));
  }
  


export function checkLayer(id) {
    console.log(document.getElementById('map'));
    const checkBox = document.getElementById(id);
    console.log("Checkbox ID:", id);
    const data = {
      type: "FeatureCollection",
      features: [],
    };
  
    if (checkBox.checked) {
      fetch('/get-layer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ layer: id })
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
  
        map.data.addGeoJson(data);
        map.data.setStyle({ fillColor: 'green' });
      })
      .catch(err => console.error("Layer fetch failed:", err));
  
    } else {
      map.data.forEach(feature => {
        if (feature.getId().includes(id)) {
          map.data.remove(feature);
        }
      });
    }
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
  