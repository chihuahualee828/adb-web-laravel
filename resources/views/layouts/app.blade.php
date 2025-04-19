<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('title', 'ADB-Web')</title>

  {{-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
  <!-- DataTables -->

  <!-- DataTables Bootstrap 5 CSS -->
  <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet"> --}}

  {{-- <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>

  <!-- Bootstrap 5 JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

  <!-- DataTables JS -->
  <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>

  <!-- DataTables Bootstrap 5 JS -->
  <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script> --}}

  @vite(['resources/css/app.css', 'resources/js/app.js', ])
  @stack('styles')
  <meta name="csrf-token" content="{{ csrf_token() }}">

</head>
<body data-bs-spy="scroll" data-bs-target=".sidebar-nav" data-bs-offset="100" tabindex="0">

  @include('partials.topbar')
  @include('partials.sidebar')

  <main class="main-content">
    @yield('content')
  </main>

  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  @stack('scripts')
</body>
</html>
