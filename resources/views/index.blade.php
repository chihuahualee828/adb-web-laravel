@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="container-fluid">

  {{-- Query Form --}}
  <div class="card mb-3">
    <div class="card-header fw-bold bg-primary text-white">Select your query</div>
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
      <div class="card h-100">
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
      <div class="card h-100">
        <div class="card-header">Layers</div>
        <div class="card-body">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="layerDistrict">
            <label class="form-check-label" for="layerDistrict">District</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="layerCounty">
            <label class="form-check-label" for="layerCounty">County</label>
          </div>
          <!-- 👇 NEW container for saved layers -->
            <div id="customLayers" class="mt-3"></div>
        </div>
        <button id="saveLayerBtn" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-plus-circle"></i> Save Current Layer
        </button>
      </div>
    </div>
  </div>

  {{-- Data Table --}}
  <div id="dataTableDiv" class="card mb-3">
    <div class="card-header fw-bold">Data Table</div>
    <div class="card-body p-0">
        <table id="dataTable" class="table table-sm table-hover mb-0"></table>
    </div>
  </div>
  

  {{-- Charts Section --}}
  <div class="card mb-5">
    <div class="card-header fw-bold">Breakdown Summary</div>
    <div class="card-body d-flex flex-wrap gap-3 justify-content-between">
      <div class="card flex-fill">
        <div class="card-header">County</div>
        <div class="card-body">
          <canvas id="countyChart" height="200"></canvas>
        </div>
      </div>
      <div class="card flex-fill">
        <div class="card-header">District</div>
        <div class="card-body">
          <canvas id="districtChart" height="200"></canvas>
        </div>
      </div>
      <div class="card flex-fill">
        <div class="card-header">Season</div>
        <div class="card-body">
          <canvas id="seasonChart" height="200"></canvas>
        </div>
      </div>
    </div>
  </div>

</div>
@endsection

{{-- @push('styles')
<style>

</style>
@endpush --}}

@push('scripts')
<script>

  function dummyPie(id) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['A', 'B', 'C'],
        datasets: [{
          data: [12, 19, 7],
          backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } }
      }
    });
  }


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
