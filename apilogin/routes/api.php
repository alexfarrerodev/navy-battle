<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\ProductController;


Route::controller(RegisterController::class)->group(function(){
    Route::post('register', 'register');
    Route::post('login', 'login');
});
         
Route::middleware('auth:sanctum')->group( function () {
    
    // El framework genera automàticament totes les rutes RESTful 
    // necessàries per gestionar recursos. 
    // Es poden consultar fent: php artisan route:list
    Route::resource('products', ProductController::class);
});

