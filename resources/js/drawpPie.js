import { currentAbortController } from './query.js';

export function drawPieChart({ searchText, searchBy, groupBy, county = null }) {
    const canvasId =
      groupBy === "season" ? "seasonChart" :
      groupBy === "district" ? "districtChart" :
      "countyChart";
    
    if (currentAbortController) {
        currentAbortController.abort();
    }
    
    // Create a new controller for this request
    currentAbortController = new AbortController();


    const canvas = document.getElementById(canvasId);
    const wrapper = document.getElementById(canvasId + "Wrapper");
    if (!canvas) return console.warn(`Canvas with id "${canvasId}" not found.`);
  
    // Destroy existing chart if present
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();
  
    fetch("/chart-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        searchText,
        searchBy,
        groupBy,
        county
      }),
      signal: currentAbortController.signal
    })
      .then(res => res.json())
      .then(({ fields, rows }) => {
        // console.log(rows);
        if (!rows || rows.length === 0) return;
        console.log("Chart data:", groupBy);
        const labels = rows.map(r => r[0]);
        const values = rows.map(r => r[1]);
        const colors = labels.map((_, i) =>
          `hsl(${(i * 360) / labels.length}, 70%, 60%)`
        );
  
        new Chart(canvas, {
          type: "pie",
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: colors,
              borderColor: "#fff",
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom"
              },
              tooltip: {
                padding: 10,
                backgroundColor: "#fff",
                borderColor: "#ccc",
                borderWidth: 1,
                titleColor: "#000",
                bodyColor: "#333"
              }
            }
          }
        });

        if (rows.length === 0) {
            wrapper.classList.remove('d-none');
            canvas.classList.add('d-none');
        } else {
            wrapper.classList.add('d-none');
            canvas.classList.remove('d-none');
        }
      })
      .catch(err => console.error("Chart error:", err));

  }
  
let dataTableInstance;
  
export function generateDataTable(response) {
	const { fields, rows } = response;
	// const tbody = document.getElementById('dataTableBody');
	

	if (!fields || !rows) {
	  console.warn("Invalid table data:", response);
	  return;
	}
	

	// Clear tbody manually
	// tbody.empty();
	const columnKeys = fields.map(col => ({ title: col }));


    // Destroy the old instance (if it exists)
    if (dataTableInstance) {
        dataTableInstance.destroy();
    }
	// if ($.fn.DataTable.isDataTable('#dataTable')) {
	// 	$('#dataTable').DataTable().clear().destroy();
	//   }
    const table = document.getElementById('dataTable');
    // const existing = DataTable.get(table); // Returns instance or null
    const wrapper = document.getElementById('dataTableWrapper');

  	table.innerHTML = '';
	// console.log(columnKeys,rows[0]);
	// Generate <thead> with dynamic columns
	const thead = document.createElement('thead');
	const headerRow = document.createElement('tr');
	fields.forEach(col => {
		// console.log(col);
		const th = document.createElement('th');
		th.textContent = col;
		headerRow.appendChild(th);
	});
	thead.appendChild(headerRow);
	table.appendChild(thead);
	
		
	// $('#dataTable').dataTable().fnDestroy();
	// $('#dataTable').empty();
	
    dataTableInstance = new DataTable(table, {
        destroy: true,
		columns: columnKeys,
		data: rows,
		pageLength: 10,
		lengthChange: false,
		searching: true,
		ordering: true,
		scrollX: true,
	});

    
	// $('#dataTable').DataTable({
		
	// 	destroy: true,
	// 	columns: columnKeys,
	// 	data: rows,
	// 	pageLength: 10,
	// 	lengthChange: false,
	// 	searching: true,
	// 	ordering: true,
	// 	scrollX: true,
	// });
	document.getElementById('dataTableDiv').getElementsByTagName('thead')[0].style.display='';

    if (rows.length === 0) {
        wrapper.classList.remove('d-none');
    } else {
        wrapper.classList.add('d-none');
    }
    // $('#dataTable tbody').on('click', 'tr', function () {
    //     const rowData = table.row(this).data();
    //     const latIndex = response.fields.indexOf('lat');
    //     const longIndex = response.fields.indexOf('long');
    //     const lat = parseFloat(rowData[latIndex]);
    //     const lng = parseFloat(rowData[longIndex]);
    
    //     const clickedPosition = { lat, lng };
    
    //     // Find the marker that matches this position
    //     const marker = markersArray.find(m =>
    //         m.getPosition().lat().toFixed(6) === lat.toFixed(6) &&
    //         m.getPosition().lng().toFixed(6) === lng.toFixed(6)
    //     );
    
    //     if (marker) {
    //         map.setCenter(marker.getPosition());
    //         map.setZoom(15); // Optional: zoom in closer
    //         google.maps.event.trigger(marker, 'click'); // Simulate click to show infowindow
    //     }
    // });
	
  }
  