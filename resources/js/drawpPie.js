// Remove the import as we will manage controllers locally
// import { currentAbortController } from './query.js'; 

const chartAbortControllers = {};

export function abortAllCharts() {
    Object.keys(chartAbortControllers).forEach(key => {
        if (chartAbortControllers[key]) {
            console.log(`%c[Abort] Aborting chart request: ${key}`, "color: orange; font-weight: bold;");
            chartAbortControllers[key].abort();
        }
        delete chartAbortControllers[key];
    });
}

export function drawPieChart({ searchText, searchBy, groupBy, county = null }) {
    const canvasId =
      groupBy === "season" ? "seasonChart" :
      groupBy === "district" ? "districtChart" :
      "countyChart";
    
    // Abort previous request for this specific chart if it exists
    if (chartAbortControllers[canvasId]) {
        chartAbortControllers[canvasId].abort();
    }
    
    // Create a new controller for this request and store it
    const controller = new AbortController();
    chartAbortControllers[canvasId] = controller;


    const canvas = document.getElementById(canvasId);
    if (!canvas) return console.warn(`Canvas with id "${canvasId}" not found.`);
    const canvasContainer = canvas.parentElement;
    const wrapper = document.getElementById(canvasId + "Wrapper");
    
  
    // Show loading state
    wrapper.classList.remove('d-none'); // Ensure wrapper is visible
    canvasContainer.classList.add('d-none');     // Hide canvas container
    
    // Set loading spinner HTML inside the wrapper
    wrapper.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center h-100 p-4">
            <div class="spinner-border text-primary mb-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted small mb-0">Loading data...</p>
        </div>
    `;

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
      signal: controller.signal
    })
      .then(res => res.json())
      .then(({ fields, rows }) => {
        // console.log(rows);
        
        // Handle "No data" case
        if (!rows || rows.length === 0) {
            console.log("Chart data: No data for", groupBy);
            canvasContainer.classList.add('d-none');
            wrapper.classList.remove('d-none');
            wrapper.innerHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center h-100 p-4">
                    <i class="bi bi-info-circle fs-4 d-block mb-2"></i>
                    <p class="mb-0">No chart to display</p>
                </div>
            `;
            return; 
        }

        // We have data, so hide wrapper and show canvas container
        wrapper.classList.add('d-none');
        canvasContainer.classList.remove('d-none');

        console.log("Chart data:", groupBy);

        // Sort data by value (descending) for better presentation
        // Assuming rows are [label, value]
        rows.sort((a, b) => b[1] - a[1]);

        // Limit to top N slices + "Others"
        const MAX_SLICES = 10;
        let displayRows = rows;
        if (rows.length > MAX_SLICES) {
            const topRows = rows.slice(0, MAX_SLICES);
            const otherRows = rows.slice(MAX_SLICES);
            const otherSum = otherRows.reduce((sum, r) => sum + r[1], 0);
            topRows.push(["Others", otherSum]);
            displayRows = topRows;
        }

        const labels = displayRows.map(r => r[0]);
        const values = displayRows.map(r => r[1]);

        // Modern, professional color palette
        const palette = [
            'rgba(54, 162, 235, 0.8)',   // Blue
            'rgba(255, 99, 132, 0.8)',   // Red
            'rgba(255, 206, 86, 0.8)',   // Yellow
            'rgba(75, 192, 192, 0.8)',   // Teal
            'rgba(153, 102, 255, 0.8)',  // Purple
            'rgba(255, 159, 64, 0.8)',   // Orange
            'rgba(199, 199, 199, 0.8)',  // Grey
            'rgba(83, 102, 255, 0.8)',   // Indigo
            'rgba(40, 167, 69, 0.8)',    // Green
            'rgba(220, 53, 69, 0.8)'     // Dark Red
        ];
        
        // Assign colors cyclically
        const colors = labels.map((_, i) => palette[i % palette.length]);
        const borders = colors.map(c => c.replace('0.8)', '1)')); // Solid border

  
        new Chart(canvas, {
          type: "doughnut", // Doughnut looks cleaner than pie
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: colors,
              borderColor: borders,
              borderWidth: 1,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%', // Makes the doughnut thinner
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
              legend: {
                position: "right",
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    font: {
                        size: 11
                    }
                }
              },
              tooltip: {
                backgroundColor: "rgba(0,0,0,0.8)",
                padding: 12,
                cornerRadius: 8,
                titleFont: { weight: 'bold' },
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const val = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((val / total) * 100).toFixed(1) + '%';
                        return `${label}: ${val} (${percentage})`;
                    }
                }
              }
            }
          }
        });

        if (rows.length === 0) {
            wrapper.classList.remove('d-none');
            canvasContainer.classList.add('d-none');
            wrapper.innerHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center h-100 p-4">
                    <i class="bi bi-info-circle fs-4 d-block mb-2"></i>
                    <p class="mb-0">No chart to display</p>
                </div>
            `;
        } else {
            wrapper.classList.add('d-none');
            canvasContainer.classList.remove('d-none');
        }
      })
      .catch(err => {
          if (err.name === 'AbortError') {
              console.log(`%c[Abort] Fetch aborted for ${canvasId}`, "color: orange; font-style: italic;");
              return; 
          }
          console.error("Chart error:", err);
          // Show error state
            canvasContainer.classList.add('d-none');
            wrapper.classList.remove('d-none');
            wrapper.innerHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center h-100 text-danger p-4">
                    <i class="bi bi-exclamation-triangle fs-4 d-block mb-2"></i>
                    <p class="mb-0">Error loading data</p>
                </div>
            `;
      });
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
  