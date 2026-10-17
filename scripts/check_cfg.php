<?php
require_once '/var/www/html/sys_tienda/config/database.php';

$pdo = db();
$cfg = $pdo->query("SELECT clave, valor FROM configuracion")->fetchAll(PDO::FETCH_KEY_PAIR);

echo "CONFIGURACIÓN EN BASE DE DATOS:\n";
foreach ($cfg as $k => $v) {
    echo "- $k: '$v'\n";
}
