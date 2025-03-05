<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\API\BaseController as BaseController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Validator;
use Illuminate\Http\JsonResponse;

class RegisterController extends BaseController
{
    /**
     * Register api
     * @return Illuminate\Http\JsonResponse
     */
    public function register (Request $request): JsonResponse {
        // Validar la request de registre
        // make(dades_a_validar, regles_validacio)
        // https://laravel.com/docs/11.x/validation#available-validation-rules
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email',
            'password' => 'required',
            'c_password' => 'required|same:password',
        ]);

        if($validator->fails()){
            //Metode definit a BaseController.
            return $this->sendError('Validation Error.', $validator->errors());       
        }

        try{
            //Recupero tota la info de la request
            $input = $request->all();
        
            //encripta el psw per guardar a la base de dades
            $input['password'] = bcrypt($input['password']);
        
            // Insert usuari a base de dades
            $user = User::create($input);
       
            //Construeixo variable $success per retornar com a resposta
          //  $success['token'] =  $user->createToken('MyApp')->plainTextToken; RSA
            $success['name'] =  $user->name;

            return $this->sendResponse($success, 'User register successfully.');
       } catch (\Exception $e){
            return $this->sendError($e->getMessage(), 555); 
       }
    }

    /**
    * Login api
    * @return \Illuminate\Http\JsonResponse
    */
    public function login(Request $request):JsonResponse {
       try{ 
            //Les credencials son email + psw
            //https://laravel.com/api/9.x/Illuminate/Support/Facades/Auth.html#method_attempt
            if(Auth::attempt(['email' => $request->email, 'password' => $request->password])){ 
                //Recupera l'usuari
                $user = Auth::user(); 
                //Construiex la variable per la resposta
                $user->tokens()->delete(); // Elimina tots els tokens antics
                $success['token'] =  $user->createToken('MyApp')->plainTextToken; 
                $success['name'] =  $user->name;
    
                return $this->sendResponse($success, 'User login successfully.');
            } 
            else{ 
                return $this->sendError('Unauthorised.', ['error'=>'Unauthorised']);
            } 
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), 555); 
        }
    }
}
