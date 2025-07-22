#!/bin/bash
# Script principal que orquesta el backup distribuido.

# --- CONFIGURACIÓN ---
DB_USER="postgres"
DB_NAME="videojuegos_retail"
DATE=$(date +"%Y-%m-%d_%H%M%S")
POSTGRES_BACKUP_DIR="/d/backupsRetail/postgres"
POSTGRES_FILENAME="$POSTGRES_BACKUP_DIR/$DB_NAME-$DATE.bak"
GCS_BUCKET="gs://backups-retail-videojuegos"

# --- CONFIGURACIÓN REMOTA ---
# IP de Tailscale y puerto del servidor del Estudiante 2
MONGO_SERVER_IP="100.85.94.86" # <-- REEMPLAZAR CON LA IP REAL DE PC 2
MONGO_SERVER_PORT="5000"
# Clave secreta que ambos estudiantes deben acordar
BACKUP_SECRET="backup123"

# --- LÓGICA ---
mkdir -p "$POSTGRES_BACKUP_DIR"
echo "[PC 1] --- INICIANDO PROCESO DE BACKUP COMPLETO ---"

# 1. Backup de PostgreSQL
echo "[PC 1] Iniciando backup de PostgreSQL..."
export PGPASSWORD='0329'
pg_dump -U $DB_USER -d $DB_NAME -F c -f "$POSTGRES_FILENAME"
unset PGPASSWORD
if [ $? -ne 0 ]; then echo "❌ [PC 1] Error en pg_dump."; exit 1; fi
echo "✅ [PC 1] Backup de PostgreSQL completado."

# 2. Dar la orden de backup a la PC 2 (MongoDB)
echo "[PC 1] Enviando orden de backup a la PC 2..."
curl -X POST http://$MONGO_SERVER_IP:$MONGO_SERVER_PORT/internal/backup \
-H "x-backup-secret: $BACKUP_SECRET"

if [ $? -ne 0 ]; then echo "⚠️ [PC 1] No se pudo enviar la orden a la PC 2, pero se continuará con la subida local."; fi

# 3. Subir el backup de PostgreSQL a la nube
echo "[PC 1] Subiendo backup de PostgreSQL a la nube..."
gcloud storage cp "$POSTGRES_FILENAME" "$GCS_BUCKET/postgres/"
if [ $? -ne 0 ]; then echo "❌ [PC 1] Error al subir backup de PostgreSQL."; fi

echo "[PC 1] --- PROCESO EN PC 1 FINALIZADO ---"
exit 0
