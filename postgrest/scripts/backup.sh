#!/bin/bash
# Script principal de backup para PostgreSQL, MongoDB y subida a la nube.

# --- CONFIGURACIÓN ---
DB_USER="postgres"
DB_NAME="videojuegos_retail"
BACKUP_DIR="/d/backupsRetail/postgres" 
DATE=$(date +"%Y-%m-%d_%H%M%S")
FILENAME="$BACKUP_DIR/$DB_NAME-$DATE.bak"

# --- NUEVO: Configuración para Google Cloud Storage ---
GCS_BUCKET="gs://tu-bucket-de-backups" # Reemplaza con el nombre de tu bucket

# --- LÓGICA ---
mkdir -p "$BACKUP_DIR"
echo "Iniciando backup de la base de datos '$DB_NAME'..."

# 1. Backup de PostgreSQL (como antes)
export PGPASSWORD='tu_contraseña_de_postgres'
pg_dump -U $DB_USER -d $DB_NAME -F c -f "$FILENAME"
unset PGPASSWORD

if [ $? -ne 0 ]; then
  echo "❌ Error al crear el backup de PostgreSQL."
  exit 1
fi
echo "✅ Backup de PostgreSQL completado: $FILENAME"

# 2. Backup de MongoDB (como antes)
echo "Invocando script de backup de MongoDB..."
/ruta/completa/a/tu/proyecto/scripts/backup_mongo.sh
if [ $? -ne 0 ]; then
  echo "❌ Error durante el backup de MongoDB."
  exit 1
fi

# =================================================================
# Subida a la Nube
#    Se ejecuta después de que los backups locales se han creado.
echo "Iniciando subida a Google Cloud Storage..."

# Sube el archivo de PostgreSQL a la nube
gcloud storage cp "$FILENAME" "$GCS_BUCKET/postgres/"

# Comprobar si la subida fue exitosa
if [ $? -eq 0 ]; then
  echo "✅ Backup de PostgreSQL subido exitosamente a la nube."
else
  echo "❌ Error al subir el backup de PostgreSQL a la nube."
  exit 1
fi

# (Opcional) Aquí también podrías añadir la lógica para subir el backup de MongoDB
# Por ejemplo, comprimiendo la carpeta y subiendo el .zip

# (Opcional) Limpiar backups locales antiguos para ahorrar espacio
# find "$BACKUP_DIR" -type f -mtime +7 -name '*.bak' -delete
# echo "Limpiando backups locales de más de 7 días."

exit 0