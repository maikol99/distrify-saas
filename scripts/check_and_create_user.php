<?php
require_once '/var/www/html/sys_tienda/config/database.php';

$pdo = db();

// Desbloquear IPs bloqueadas por intentos fallidos
$pdo->exec("DELETE FROM intentos_login");

// Listar usuarios existentes
$users = $pdo->query("SELECT id, usuario, nombres, apellidos, email, estado, cambiar_clave FROM usuarios")->fetchAll();

echo "USUARIOS REGISTRADOS EN LA BASE DE DATOS:\n";
foreach ($users as $u) {
    echo "- ID: {$u['id']} | Usuario: '{$u['usuario']}' | Nombre: {$u['nombres']} {$u['apellidos']} | Email: {$u['email']}\n";
}

// Resetear contraseña de 'admin' a 'admin123'
$passHash = password_hash('admin123', PASSWORD_DEFAULT);
$pdo->prepare("UPDATE usuarios SET password=?, estado=1, bloqueado_hasta=NULL, cambiar_clave=0 WHERE usuario='admin'")->execute([$passHash]);

// Crear usuario 'maikol' como Administrador si no existe
$exists = $pdo->query("SELECT id FROM usuarios WHERE usuario='maikol'")->fetch();
if (!$exists) {
    $ins = $pdo->prepare("INSERT INTO usuarios (rol_id, sucursal_id, nombres, apellidos, usuario, email, password, cambiar_clave, estado) VALUES (1, 1, 'Maikol', 'Admin', 'maikol', 'maikol@tienda.com', ?, 0, 1)");
    $ins->execute([$passHash]);
    echo "\n-> Se ha creado el usuario 'maikol' con rol Administrador y clave 'admin123'.\n";
} else {
    $pdo->prepare("UPDATE usuarios SET password=?, estado=1, bloqueado_hasta=NULL, cambiar_clave=0 WHERE usuario='maikol'")->execute([$passHash]);
    echo "\n-> Se ha actualizado el usuario 'maikol' con clave 'admin123'.\n";
}

echo "-> La contraseña para 'admin' y 'maikol' ha quedado lista: admin123 (sin bloqueo ni cambio obligatorio).\n";
