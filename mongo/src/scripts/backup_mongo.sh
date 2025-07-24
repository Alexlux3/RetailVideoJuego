#!/bin/bash
# Script para respaldar y subir MongoDB a la nube.

# --- CONFIGURACIÓN ---
DB_NAME="videojuegos_logs"
BACKUP_DIR="/c/Users/Javier/ALMACENAJE/backup-retail/mongo" # Tu ruta local
DATE=$(date +"%Y-%m-%d_%H%M%S")
DUMP_PATH="$BACKUP_DIR/$DB_NAME-$DATE"
ARCHIVE_NAME="$DB_NAME-$DATE.tar.gz"
ARCHIVE_PATH="$BACKUP_DIR/$ARCHIVE_NAME"
GCS_BUCKET="gs://backups-retail-videojuegos"

# --- LÓGICA ---
mkdir -p "$BACKUP_DIR"
echo "Iniciando backup de MongoDB..."
mongodump --db=$DB_NAME --out="$DUMP_PATH"
if [ $? -ne 0 ]; then echo "Error en mongodump."; exit 1; fi

echo "Comprimiendo backup..."
tar -czf "$ARCHIVE_PATH" -C "$BACKUP_DIR" "$DB_NAME-$DATE"
if [ $? -ne 0 ]; then echo "Error al comprimir."; exit 1; fi

echo "Subiendo a Google Cloud Storage..."
gcloud storage cp "$ARCHIVE_PATH" "$GCS_BUCKET/mongo/"
if [ $? -ne 0 ]; then echo "Error al subir a la nube."; exit 1; fi

rm -rf "$DUMP_PATH" # Limpieza
echo "Backup de MongoDB completado y subido."
exit 0