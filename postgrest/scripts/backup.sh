#!/bin/bash
# Script principal de backup para PostgreSQL, MongoDB y subida a la nube.

# --- CONFIGURACIÓN ---
DB_USER="postgres"
DB_NAME="videojuegos_retail"
MONGO_DB_NAME="videojuegos_logs"
DATE=$(date +"%Y-%m-%d_%H%M%S")

# Directorios de backup locales
POSTGRES_BACKUP_DIR="/d/backupsRetail/postgres"
MONGO_BACKUP_DIR="/d/backupsRetail/mongo"

# Nombres de los archivos y carpetas de backup
POSTGRES_FILENAME="$POSTGRES_BACKUP_DIR/$DB_NAME-$DATE.bak"
MONGO_DUMP_PATH="$MONGO_BACKUP_DIR/$MONGO_DB_NAME-$DATE"
MONGO_ARCHIVE_NAME="$MONGO_DB_NAME-$DATE.tar.gz"
MONGO_ARCHIVE_PATH="$MONGO_BACKUP_DIR/$MONGO_ARCHIVE_NAME"

# Bucket de Google Cloud Storage
GCS_BUCKET="gs://backups-retail-videojuegos"

# --- LÓGICA ---
mkdir -p "$POSTGRES_BACKUP_DIR"
mkdir -p "$MONGO_BACKUP_DIR"

echo "--- INICIANDO PROCESO DE BACKUP COMPLETO ---"

# 1. Backup de PostgreSQL
echo "Iniciando backup de PostgreSQL..."
export PGPASSWORD='0329' # ¡IMPORTANTE! Usar un método más seguro en producción
pg_dump -U $DB_USER -d $DB_NAME -F c -f "$POSTGRES_FILENAME"
unset PGPASSWORD

if [ $? -ne 0 ]; then
  echo "❌ Error al crear el backup de PostgreSQL."
  exit 1
fi
echo "✅ Backup de PostgreSQL completado: $POSTGRES_FILENAME"

# 2. Backup de MongoDB
echo "Iniciando backup de MongoDB..."
mongodump --db=$MONGO_DB_NAME --out="$MONGO_DUMP_PATH"

if [ $? -ne 0 ]; then
  echo "❌ Error al crear el backup de MongoDB."
  exit 1
fi
echo "✅ Backup de MongoDB completado en: $MONGO_DUMP_PATH"

# 3. Comprimir el backup de MongoDB
echo "Comprimiendo backup de MongoDB..."
# tar -czf [nombre_del_archivo_salida] [carpeta_a_comprimir]
tar -czf "$MONGO_ARCHIVE_PATH" -C "$MONGO_BACKUP_DIR" "$MONGO_DB_NAME-$DATE"

if [ $? -ne 0 ]; then
  echo "❌ Error al comprimir el backup de MongoDB."
  exit 1
fi
echo "✅ Backup de MongoDB comprimido en: $MONGO_ARCHIVE_PATH"


# =================================================================
# 4. Subida a la Nube
# =================================================================
echo "Iniciando subida a Google Cloud Storage..."

# Sube el archivo de PostgreSQL
gcloud storage cp "$POSTGRES_FILENAME" "$GCS_BUCKET/postgres/"
if [ $? -eq 0 ]; then
  echo "✅ Backup de PostgreSQL subido exitosamente a la nube."
else
  echo "❌ Error al subir el backup de PostgreSQL."
  # No salimos del script, intentamos subir el de Mongo
fi

# Sube el archivo comprimido de MongoDB
gcloud storage cp "$MONGO_ARCHIVE_PATH" "$GCS_BUCKET/mongo/"
if [ $? -eq 0 ]; then
  echo "✅ Backup de MongoDB subido exitosamente a la nube."
else
  echo "❌ Error al subir el backup de MongoDB."
fi

# 5. Limpieza (Opcional pero recomendado)
echo "Limpiando archivos locales temporales..."
rm -rf "$MONGO_DUMP_PATH" # Borra la carpeta de mongodump
# rm "$MONGO_ARCHIVE_PATH" # Descomenta si quieres borrar el .tar.gz también

echo "--- PROCESO DE BACKUP FINALIZADO ---"
exit 0