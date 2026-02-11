@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="container-fluid">

  {{-- Query Form --}}
  <div class="card shadow-sm mb-3">
    <div class="card-header fw-bold">Select your query</div>
    <div class="card-body row gx-2 gy-3 align-items-end">
      <div class="col-md-3">
        <label for="query" class="form-label">Query</label>
        <select id="query" class="form-select">
            <option value="0">---</option>
            <option value="1">Best Seller</option>
            <option value="2">Top Category</option>
            <option value="3">Best Logistics Cetner Location</option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="county" class="form-label">County</label>
        <select id="county" class="form-select">
                <option value="0" >-- All --</option>
                <option value="1">台北市</option>
                <option value="2">新北市</option>
                <option value="3">桃園市</option>
                <option value="4">台中市</option>
                <option value="5">台南市</option>
                <option value="6">高雄市</option>
                <option value="7">新竹市</option>
                <option value="8">新竹縣</option>
                <option value="9">苗栗縣</option>
                <option value="10">彰化縣</option>
                <option value="11">南投縣</option>
                <option value="12">雲林縣</option>
                <option value="13">嘉義市</option>
                <option value="14">嘉義縣</option>
                <option value="15">屏東縣</option>
                <option value="16">宜蘭縣</option>
                <option value="17">花蓮縣</option>
                <option value="18">台東縣</option>
                <option value="19">澎湖縣</option>
                <option value="20">金門縣</option>
                <option value="21">連江縣</option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="district" class="form-label">District</label>
        <select id="district" class="form-select">
          <option>-- All --</option>
        </select>
      </div>
      <div class="col-md-2">
        <label for="season" class="form-label">Season</label>
        <select id="season" class="form-select">
            <option value="0" >---</option>
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
        </select>
      </div>
      <div class="col-md-1 text-end">
        <button id="applyQuery" class="btn btn-primary w-100">Apply</button>
      </div>
    </div>
  </div>

  {{-- Map + Layers --}}
  <div class="row g-3 mb-3">
    <div class="col-lg-9">
      <div class="card shadow-sm h-100">
        <div class="card-header">Map</div>
        <div class="card-body p-0 position-relative" style="height: 400px;">
          {{-- <div id="map" class="w-100 h-100"></div> --}}
          <div class="w-100 h-100">
            @include('partials.map')
          </div>
        </div>
      </div>
    </div>
    <div class="col-lg-3">
      <div class="card shadow-sm h-100">
        <div class="card-header">Layers</div>
        {{-- <div class="card-body">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="layerDistrict">
            <label class="form-check-label" for="layerDistrict">District</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="layerCounty">
            <label class="form-check-label" for="layerCounty">County</label>
          </div>
          <!-- NEW for saved layers -->
            <div id="customLayers" class="mt-3"></div>
        </div> --}}

        <div class="card-body d-flex flex-column gap-0">
            <div class="layer-block" data-layer="county" id="layerCounty">County</div>
            <div class="layer-block" data-layer="district" id="layerDistrict">District</div>
            <!-- Keep this for dynamic layers -->
            {{-- <div class="layer-block" data-layer="custom" id="customLayers"></div> --}}
            <div id="customLayers" class="mt-3 d-none"></div>
          </div>

        <button id="saveLayerBtn" class="btn btn-outline-primary">
            <i class="bi bi-plus-circle"></i> Save Current Layer
        </button>
      </div>
    </div>
  </div>

  {{-- Data Table --}}
  <div id="dataTableDiv" class="card shadow-sm mb-3">
    <div class="card-header fw-bold">Data Table</div>
    <div class="card-body px-3">
        <div class="card-body text-center text-muted" id="dataTableWrapper">
            <i class="bi bi-info-circle fs-4 d-block mb-2"></i>
            <p class="mb-0">No data to display</p>
          </div>
        <div class="table-responsive"> 
            {{-- <table id="dataTable" class="table table-sm table-hover mb-0 w-100"></table> --}}
            <table id="dataTable" class="table table-sm table-hover table-striped table-bordered mb-0 w-100"></table>
        </div>
        
    </div>
  </div>
  

  {{-- Charts Section --}}
  <div class="card shadow-sm mb-5">
    <div class="card-header fw-bold">Breakdown Summary</div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header">County</div>
            <div class="card-body p-0">
                <div class="d-flex align-items-center justify-content-center text-muted" id="countyChartWrapper" style="min-height: 200px;">
                    <div class="text-center p-4">
                        <i class="bi bi-info-circle fs-4 d-block mb-2"></i>
                        <p class="mb-0">No chart to display</p>
                    </div>
                </div>
                <div class="position-relative d-none" style="height: 300px; padding: 10px;">
                  <canvas class="w-100 h-100" id="countyChart"></canvas>
                </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header">District</div>
            <div class="card-body p-0">
                <div class="d-flex align-items-center justify-content-center text-muted" id="districtChartWrapper" style="min-height: 200px;">
                    <div class="text-center p-4">
                        <i class="bi bi-info-circle fs-4 d-block mb-2"></i>
                        <p class="mb-0">No chart to display</p>
                    </div>
                </div>
                <div class="position-relative d-none" style="height: 300px; padding: 10px;">
                  <canvas class="w-100 h-100" id="districtChart"></canvas>
                </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header">Season</div>
            <div class="card-body p-0">
                <div class="d-flex align-items-center justify-content-center text-muted" id="seasonChartWrapper" style="min-height: 200px;">
                    <div class="text-center p-4">
                        <i class="bi bi-info-circle fs-4 d-block mb-2"></i>
                        <p class="mb-0">No chart to display</p>
                    </div>
                </div>
                <div class="position-relative d-none" style="height: 300px; padding: 10px;">
                  <canvas class="w-100 h-100" id="seasonChart"></canvas>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- Floating AI Chat Button -->
  <button class="btn btn-primary shadow rounded-circle ai-float-btn" id="openAiPopup2"
    type="button"
    data-bs-toggle="offcanvas"
    data-bs-target="#aiChatOffcanvas"
    aria-controls="aiChatOffcanvas"
    title="AI Assistant">
    <i class="bi bi-robot fs-4"></i>
  </button>

</div>
@endsection

{{-- @push('styles')
<style>

</style>
@endpush --}}

@push('scripts')
<script>
  // Modern Chart.js defaults
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof Chart !== 'undefined' && Chart.defaults) {
        Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
        Chart.defaults.color = '#64748b';
        Chart.defaults.scale.grid.color = '#f1f5f9';
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
    }
  });

//   function dummyPie(id) {
//     const ctx = document.getElementById(id);
//     if (!ctx) return;
//     new Chart(ctx, {
//       type: 'pie',
//       data: {
//         labels: ['A', 'B', 'C'],
//         datasets: [{
//           data: [12, 19, 7],
//           backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e'],
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         plugins: { legend: { position: 'top' } }
//       }
//     });
//   }


//   document.addEventListener('DOMContentLoaded', function () {
//     dummyPie('countyChart');
//     dummyPie('districtChart');
//     dummyPie('seasonChart');

//     const mapContainer = document.getElementById('map');
//     const popup = document.getElementById('mapPopup');
//     if (mapContainer && popup) {
//       mapContainer.addEventListener('mouseenter', () => popup.classList.remove('d-none'));
//       mapContainer.addEventListener('mouseleave', () => popup.classList.add('d-none'));
//     }
//   });

//   document.addEventListener('DOMContentLoaded', function () {
//   dummyPie('countyChart');
//   dummyPie('districtChart');
//   dummyPie('seasonChart');

</script>



@endpush
