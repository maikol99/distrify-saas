#!/usr/bin/env bash
# ============================================================
# Instalador Automático de Kiosco / POS Argentina (1 solo paso)
# Compatible con Ubuntu / Debian
# ============================================================

set -e

echo "========================================================="
echo "   Iniciando Instalación Automática del Sistema Kiosco   "
echo "========================================================="

# 1. Comprobar permisos de root
if [ "$EUID" -ne 0 ]; then
  echo "Por favor ejecuta este script con permisos de administrador: sudo ./instalar_kiosco.sh"
  exit 1
fi

echo "-> [1/6] Instalando servidor web Apache, PHP y MySQL..."
apt-get update -y > /dev/null
apt-get install -y apache2 mysql-server php php-mysql php-mbstring php-gd php-curl php-zip php-xml unzip > /dev/null

echo "-> [2/6] Configurando Apache y soporte para reescritura..."
a2enmod rewrite > /dev/null
sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf
systemctl restart apache2

echo "-> [3/6] Preparando base de datos MySQL..."
systemctl start mysql
mysql -e "CREATE DATABASE IF NOT EXISTS sys_tienda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'tienda_user'@'localhost' IDENTIFIED BY 'TiendaPass123!';"
mysql -e "GRANT ALL PRIVILEGES ON sys_tienda.* TO 'tienda_user'@'localhost'; FLUSH PRIVILEGES;"

echo "-> [4/6] Desplegando archivos del sistema en /var/www/html/sys_tienda..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ZIP_PATH="$SCRIPT_DIR/sys_tienda_argentina.zip"

if [ -f "$ZIP_PATH" ]; then
    rm -rf /var/www/html/sys_tienda
    unzip -q "$ZIP_PATH" -d /var/www/html/
elif [ -d "/var/www/html/sys_tienda" ]; then
    echo "Archivos ya presentes en /var/www/html/sys_tienda."
fi

# 5. Configurar conexión local
cat << 'EOF' > /var/www/html/sys_tienda/config/local.php
<?php
define('APP_ENV', 'desarrollo');
define('DB_HOST', 'localhost');
define('DB_USER', 'tienda_user');
define('DB_PASS', 'TiendaPass123!');
define('DB_NAME', 'sys_tienda');
define('DB_PORT', 3306);
define('TIMEZONE', 'America/Argentina/Buenos_Aires');
EOF

chown -R www-data:www-data /var/www/html/sys_tienda
chmod -R 775 /var/www/html/sys_tienda

echo "-> [5/6] Ejecutando autoinstalador con datos de Argentina..."
rm -f /var/www/html/sys_tienda/config/installed.lock
curl -s http://localhost/sys_tienda/install.php > /dev/null || php /var/www/html/sys_tienda/install.php > /dev/null

echo "-> [6/6] Ajustando usuarios iniciales..."
php -r "
require '/var/www/html/sys_tienda/config/database.php';
\$p = db();
\$pass = password_hash('admin123', PASSWORD_DEFAULT);
\$p->exec(\"DELETE FROM intentos_login\");
\$p->prepare(\"UPDATE usuarios SET password=?, estado=1, bloqueado_hasta=NULL, cambiar_clave=0 WHERE usuario='admin'\")->execute([\$pass]);
"

echo "========================================================="
echo "   ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!                 "
echo "========================================================="
echo ""
echo "Acceso al sistema:"
echo "  URL:     http://localhost/sys_tienda/"
echo "  Usuario: admin"
echo "  Clave:   admin123"
echo ""
echo "Configuración activa:"
echo "  - Moneda:       $ (Pesos Argentinos)"
echo "  - Impuesto:     IVA (0% precio final)"
echo "  - Margen POS:   +50% automático en productos"
echo "  - Métodos pago: Efectivo, Mercado Pago, Transferencia, Débito, Crédito, Fiado"
echo "  - Documentos:   CUIT / CUIL / DNI"
echo "========================================================="

# Abrir el navegador si hay entorno gráfico
if command -v xdg-open &> /dev/null && [ -n "$DISPLAY" ]; then
    xdg-open "http://localhost/sys_tienda/" 2>/dev/null || true
fi
