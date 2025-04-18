<?php

use Illuminate\Support\Facades\Route;

// Show the `resources/views/index.blade.php` view at “/”
Route::view('/', 'index')
     ->name('dashboard.index');

use App\Http\Controllers\QueryController;

Route::post('/query', [QueryController::class, 'submit']);
Route::post('/search', [QueryController::class, 'search']);


use App\Http\Controllers\LayerController;

Route::post('/get-layer', [LayerController::class, 'getLayer']);