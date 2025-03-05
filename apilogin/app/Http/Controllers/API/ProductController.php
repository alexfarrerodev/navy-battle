<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\API\BaseController as BaseController;
use App\Models\Product;
use Validator;
use App\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;

class ProductController extends BaseController
{
    /**
     * Display a listing of the resource.
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        try{
            $products = Product::all();
            //Create new anonymous resource collection.
            return $this->sendResponse(ProductResource::collection($products), 'Products retrieved successfully.');
    
        } catch(\Exception $e){
            return $this->sendError($e->getMessage(), 555); 
        }
    }
    /**
     * Store a newly created resource in storage.
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try{
            $input = $request->all();
    
            $validator = Validator::make($input, [
                'name' => 'required',
                'detail' => 'required'
            ]);
    
            if($validator->fails()){
                return $this->sendError('Validation Error.', $validator->errors());       
            }
    
            $product = Product::create($input);
    
            return $this->sendResponse(new ProductResource($product), 'Product created successfully.');
        } catch(\Exception $e){
            return $this->sendError($e->getMessage(), 555); 
        } 
    }

     /**
     * Display the specified resource.
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {   
        try {
            $product = Product::find($id);
    
            if (is_null($product)) {
                return $this->sendError('Product not found.');
            }
            //TODO Utilitzar json_encode i no ProductResource
            return $this->sendResponse(new ProductResource($product), 'Product retrieved successfully.');
            //return $this->sendResponse(json_encode($product), 'Product retrieved successfully.');
      
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), 555);
        }
    }
    
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        try {
            $input = $request->all();
    
            $validator = Validator::make($input, [
                'name' => 'required',
                'detail' => 'required'
            ]);
    
            if($validator->fails()){
                return $this->sendError('Validation Error.', $validator->errors());       
            }
    
            $product->name = $input['name'];
            $product->detail = $input['detail'];
            $product->save();
    
            return $this->sendResponse(new ProductResource($product), 'Product updated successfully.');
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), 555);
        }
    }

    /**
     * Remove the specified resource from storage.
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Product $product): JsonResponse
    {
        try{
            $product->delete();
   
            return $this->sendResponse([], 'Product deleted successfully.');
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), 555);
        }
    }

}
