[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# moleculer-microservices

## Uso

Para iniciar el proyecto, se debe ejecutar el comando `npm install`. Con este instalaremos las dependencias necesarias.

Una vez instalados los paquetes, se debe iniciar el proyecto ejecuntado `npm start`, el servidor será levantado en: http://localhost:3000/.

En la terminal, quedaran habilitados los comandos:
- `nodes` - Listado de todos nodes.
- `actions` - Lista de todos las acciones de los servicios.

## Services
- **api**: API Gateway services
- **customer**: Info de usuario
- **logistics**: Logistica del seguimiento de una order,
- **products**: Manejo de productos por usuario,
- **purchase**: Listado de items y api de compra de producto/servicio,
- **services**: Manejo de servicios por usuario,

## Mixins
- **db.mixin**: Acceso a bases de datos mixin para los servicios. Basado en [moleculer-db](https://github.com/moleculerjs/moleculer-db#readme)


## links

* Moleculer: https://moleculer.services/
* Moleculer Documentation: https://moleculer.services/docs/0.14/

## NPM scripts

- `npm start`: Inicia el servidor con todos los servicios de manera local con hot-reload