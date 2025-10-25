# COMANDOS PARA LA EJECUCION DE LAS MIGRACIONES Y SEEDERS DE LA BD 
## Creacion de las carpetas base
``` Bash
# Crea la estructura base (models, migrations, seeders, etc.)
npx sequelize-cli init 
```
# Configuracion de conexion a la base de datos
Ubicar la el archivo: `/config/config.json`
```Javascript
{
  "development": {
    "username": "root",
    "password": "tu_password",
    "database": "mi_base_datos",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```
**⚠ Importante:** Todas los comandos mencionados a continuacion funcionaran unicamente bajo el supuesto de que ya existe una base de datos llamada: `monitoreo_ambiental`✅ 
## Migraciones
```Bash
# Para ejecutarlos
npx sequelize-cli db:migrate
# Para revertirlos
npx sequelize-cli db:migrate:undo:all
```
## Seeders
```Bash
# Para ejecutarlos
npx sequelize-cli db:seed:all
# Para revertirlos
npx sequelize-cli db:seed:undo:all
```