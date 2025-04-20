<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// // Show the `resources/views/index.blade.php` view at “/”
// Route::view('/', 'index')
//      ->name('dashboard.index');

// same as:

Route::get('/', function (Request $request) {
    $request->session()->forget('messages');
    return view('index');
})->name('dashboard.index');


use App\Http\Controllers\QueryController;

Route::post('/query', [QueryController::class, 'submit']);
Route::post('/search', [QueryController::class, 'search']);


use App\Http\Controllers\LayerController;

Route::post('/get-layer', [LayerController::class, 'getLayer']);


use App\Http\Controllers\ChartController;
Route::post('/chart-data', [ChartController::class, 'getPieChartData']);


use App\Http\Controllers\ChatController;

// Route::get('/', [ChatController::class, 'index']);
Route::post('/send', [ChatController::class, 'send'])->name('chat.send');