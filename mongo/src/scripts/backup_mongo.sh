#!/bin/bash
# Script de backup para MongoDB

# --- CONFIGURACIÓN ---
DB_NAME="videojuegos_logs"
BACKUP_DIR="/home/tu_usuario/backups_db/mongo" # Directorio específico para Mongo
DATE=$(date +"%Y-%m-%d_%H%M%S")
FILENAME="$BACKUP_DIR/$DB_NAME-$DATE"

# --- LÓGICA ---
# Crear el directorio de backup si no existe
mkdir -p "$BACKUP_DIR"
echo "Iniciando backup de la base de datos MongoDB '$DB_NAME'..."

# Ejecutar el comando mongodump para exportar la base de datos
mongodump --db=$DB_NAME --out=$FILENAME

# Comprobar si el comando anterior se ejecutó correctamente
if [ $? -eq 0 ]; then
  echo "✅ Backup de MongoDB completado exitosamente en: $FILENAME"
else
  echo "❌ Error al crear el backup de MongoDB."
  exit 1
fi