<?php
require_once '/var/www/html/sys_tienda/config/database.php';

$pdo = db();

echo "=== ACTUALIZANDO BASE DE DATOS A ARGENTINA ===\n";

// 1. Modificar columna metodo_pago en ventas
try {
    $col = $pdo->query("SHOW COLUMNS FROM ventas LIKE 'metodo_pago'")->fetch();
    if ($col && stripos($col['Type'], 'enum') !== false) {
        $pdo->exec("ALTER TABLE ventas MODIFY COLUMN metodo_pago VARCHAR(30) NOT NULL DEFAULT 'EFECTIVO'");
        echo "✓ Columna metodo_pago actualizada a VARCHAR(30)\n";
    }
} catch (Exception $e) {
    echo "! Error en metodo_pago: " . $e->getMessage() . "\n";
}

// 2. Actualizar tabla configuracion
$updates = [
    'empresa_nombre'   => 'Mi Kiosco / Comercio',
    'moneda'           => '$',
    'moneda_codigo'    => 'ARS',
    'moneda_decimales' => '2',
    'sep_decimal'      => ',',
    'sep_miles'        => '.',
    'moneda_posicion'  => 'antes',
    'igv'              => '0',
    'impuesto_nombre'  => 'IVA',
    'zona_horaria'     => 'America/Argentina/Buenos_Aires'
];

$stmt = $pdo->prepare("INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)");
foreach ($updates as $k => $v) {
    $stmt->execute([$k, $v]);
    echo "✓ Configuración '$k' establecida en '$v'\n";
}

// 3. Desbloquear intentos de login y actualizar admin
$passHash = password_hash('admin123', PASSWORD_DEFAULT);
$pdo->exec("DELETE FROM intentos_login");
$pdo->prepare("UPDATE usuarios SET password=?, estado=1, bloqueado_hasta=NULL, cambiar_clave=0 WHERE usuario='admin'")->execute([$passHash]);
echo "✓ Usuario 'admin' desbloqueado con clave 'admin123' (sin cambio obligatorio)\n";

// 4. Crear usuario 'maikol' si no existe
$exists = $pdo->query("SELECT id FROM usuarios WHERE usuario='maikol'")->fetch();
if (!$exists) {
    $ins = $pdo->prepare("INSERT INTO usuarios (rol_id, sucursal_id, nombres, apellidos, usuario, email, password, cambiar_clave, estado) VALUES (1, 1, 'Maikol', 'Admin', 'maikol', 'maikol@tienda.com', ?, 0, 1)");
    $ins->execute([$passHash]);
    echo "✓ Usuario 'maikol' creado como Administrador (clave: admin123)\n";
} else {
    $pdo->prepare("UPDATE usuarios SET password=?, estado=1, bloqueado_hasta=NULL, cambiar_clave=0 WHERE usuario='maikol'")->execute([$passHash]);
    echo "✓ Usuario 'maikol' actualizado (clave: admin123)\n";
}

echo "\n¡LISTO! La base de datos ahora está 100% configurada para Argentina.\n";
