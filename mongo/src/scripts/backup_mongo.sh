#!/bin/bash
# Script para respaldar la base de datos de MongoDB.

# --- CONFIGURACIÓN ---
DB_NAME="videojuegos_logs"
# Crea una subcarpeta para los backups de Mongo
BACKUP_DIR="/c/Users/Javier/ALMACENAJE/backup-retail" 
DATE=$(date +"%Y-%m-%d_%H%M%S")
# mongodump guarda en un directorio, no en un solo archivo
BACKUP_PATH="$BACKUP_DIR/$DB_NAME-$DATE"

# --- LÓGICA ---
mkdir -p "$BACKUP_DIR"
echo "Iniciando backup de MongoDB '$DB_NAME'..."

mongodump --db=$DB_NAME --out="$BACKUP_PATH"

if [ $? -eq 0 ]; then
  echo "✅ Backup de MongoDB completado en: $BACKUP_PATH"
  exit 0 # Éxito
else
  echo "❌ Error al crear el backup de MongoDB."
  exit 1 # Fallo
fi