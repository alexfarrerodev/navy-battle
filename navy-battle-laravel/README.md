# Batalla Naval API

Este repositorio contiene una API para el juego de Batalla Naval desarrollada con Laravel 12.

## Requisitos

- PHP 8.2 o superior
- Composer
- MySQL/MariaDB
- Node.js y npm (para el frontend, si aplica)

## Instalación y Ejecución

### Inicio Rápido

Para ejecutar la aplicación completa:

1. Navega al directorio raíz del proyecto (directorio padre):

```bash
cd ../
```

2. Ejecuta el script de inicialización con el parámetro "all":

```bash
./run-all.sh all
```

Este comando configurará y lanzará todos los componentes necesarios para la aplicación.

### Opciones del Script

Para ver todas las opciones disponibles del script de ejecución:

```bash
./run-all.sh
```

Esto mostrará la ayuda con todas las opciones y comandos disponibles.

## Pruebas con Postman

Se incluyen colecciones de Postman para probar todos los endpoints de la API:

### Ubicación de los Archivos

```bash
cd navy-battle-laravel/POSTMAN-TESTS-EXPORTS
```

### Importar en Postman

1. Abre Postman
2. Haz clic en "Import" (botón superior izquierdo)
3. Selecciona los archivos de la carpeta POSTMAN-TESTS-EXPORTS
4. Importa tanto la colección como el entorno (si está disponible)

### Configuración del Entorno

Para probar la API correctamente:

1. Configura la variable de entorno `base_url` con la URL correcta de tu API (por defecto: `http://localhost:8000/api`)
2. Las variables `token` y `game_id` se actualizarán automáticamente durante la ejecución de las pruebas

### Secuencia de Pruebas Recomendada

1. Registra un usuario o inicia sesión (Autenticación > Registro/Login)
2. El token se guardará automáticamente
3. Inicia un nuevo juego (Juegos > Iniciar Nuevo Juego)
4. Realiza disparos y comprueba el estado del juego
5. Explora el resto de endpoints según necesites

## Estructura de la API

La API sigue una estructura RESTful con los siguientes grupos principales de endpoints:

- **Autenticación**: Registro, login, logout y datos del usuario actual
- **Usuarios**: Gestión de usuarios y estadísticas
- **Juegos**: Creación, listado y detalles de juegos
- **Juego en Curso**: Interacción con un juego activo (disparos, estado, tablero)
- **Rankings**: Consulta de clasificaciones

## Notas Adicionales

- La API utiliza autenticación con tokens JWT mediante Laravel Sanctum
- Todos los endpoints protegidos requieren un token válido en el header de Authorization
- Para más detalles sobre cada endpoint, consulta la documentación incluida en la colección de Postman

## Solución de Problemas

Si encuentras problemas al ejecutar los tests de Postman:

1. Verifica que la API esté en funcionamiento
2. Comprueba que la URL base sea correcta
3. Asegúrate de que el token se está guardando correctamente después del login
4. Revisa la consola de Postman para ver mensajes de error detallados
