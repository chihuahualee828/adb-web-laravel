{{-- Sidebar Component --}}

<!-- Desktop Sidebar (visible on lg and up) -->
<div class="sidebar d-none d-lg-block vh-100 p-0">
    <div class="px-4 py-4 mb-2">
        <strong class="fs-4 brand-text">ADB-Web</strong>
      </div>
    <nav class="nav flex-column sidebar-nav">
      <a href="#" class="nav-link"><i class="bi bi-geo-alt-fill me-2"></i> Spatial</a>
      <a href="#dataTableDiv" class="nav-link"><i class="bi bi-table me-2"></i> Data Table</a>
      <a href="#countyChartWrapper" class="nav-link"><i class="bi bi-bar-chart-line-fill me-2"></i> Graph</a>
    </nav>
  </div>
  
  <!-- Mobile Offcanvas Sidebar -->
  <div class="offcanvas offcanvas-start offcanvas-narrow d-lg-none" tabindex="-1" id="offcanvasSidebar" aria-labelledby="offcanvasSidebarLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasSidebarLabel">Menu</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
        <nav class="nav flex-column sidebar-nav">
        <a href="#" class="nav-link"><i class="bi bi-geo-alt-fill me-2"></i> Spatial</a>
        <a href="#dataTableDiv" class="nav-link"><i class="bi bi-table me-2"></i> Data Table</a>
        <a href="#countyChartWrapper" class="nav-link"><i class="bi bi-bar-chart-line-fill me-2"></i> Graph</a>
      </nav>
    </div>
  </div>
  