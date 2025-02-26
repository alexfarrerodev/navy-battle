#!/bin/bash

close_ports() {
    echo "Verificando y cerrando puertos si están en uso..."
    
    # Verificar y cerrar puerto 8000 (Laravel)
    if lsof -i :8000 > /dev/null 2>&1; then
        echo "Puerto 8000 en uso. Cerrando procesos..."
        kill -9 $(lsof -t -i:8000) 2>/dev/null || echo "No se pudo cerrar el puerto 8000"
    else
        echo "Puerto 8000 libre"
    fi
    
    # Verificar y cerrar puerto 3000 (Angular)
    if lsof -i :3000 > /dev/null 2>&1; then
        echo "Puerto 3000 en uso. Cerrando procesos..."
        kill -9 $(lsof -t -i:3000) 2>/dev/null || echo "No se pudo cerrar el puerto 3000"
    else
        echo "Puerto 3000 libre"
    fi
    
    # Esperar un momento para asegurar que los puertos se liberen
    sleep 1
}

run_server(){
    close_ports
    cd "navy-battle-laravel" 
    php artisan serve
}

run_client(){
    close_ports
    cd "navy-battle-angular" 
    ng serve -o
}

# Si se llama al script con parámetros, ejecutar la función correspondiente
if [ "$1" = "server" ]; then
    run_server
elif [ "$1" = "client" ]; then
    run_client
elif [ "$1" = "all" ]; then
    # Ejecutar ambos en background
    run_server &
    run_client &
else
    echo "Uso: $0 [server|client|all]"
    echo "  server: Inicia solo el servidor Laravel"
    echo "  client: Inicia solo el cliente Angular"
    echo "  all: Inicia ambos"
fi