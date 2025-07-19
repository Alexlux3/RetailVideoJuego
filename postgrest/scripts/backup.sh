#!/bin/bash

# --- CONFIGURACIÓN ---
DB_USER="postgres"
DB_NAME="videojuegos_retail"
# Define una ruta segura FUERA de la carpeta de tu proyecto
BACKUP_DIR="/D/ProyectoRetail/respaldo" 
DATE=$(date +"%Y-%m-%d_%H%M%S")
FILENAME="$BACKUP_DIR/$DB_NAME-$DATE.bak"

# --- LÓGICA ---
# Crear el directorio de backup si no existe
mkdir -p "$BACKUP_DIR"

echo "Iniciando backup de la base de datos '$DB_NAME'..."

# Ejecutar el comando pg_dump
# La variable PGPASSWORD se usa para evitar que se pida la contraseña interactivamente
export PGPASSWORD='tu_contraseña_de_postgres' # Reemplaza con tu contraseña de superusuario
pg_dump -U $DB_USER -d $DB_NAME -F c -f "$FILENAME"
unset PGPASSWORD # Limpiar la variable de entorno

# Comprobar si el backup se creó correctamente
if [ $? -eq 0 ]; then
  echo "✅ Backup completado exitosamente: $FILENAME"
else
  echo "❌ Error al crear el backup."
  exit 1
fi