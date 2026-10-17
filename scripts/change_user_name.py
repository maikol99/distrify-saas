#!/usr/bin/env python3
"""
change_user_name.py — Cambia el nombre del administrador principal en la base de datos.
"""
import subprocess, sys

name = sys.argv[1] if len(sys.argv) > 1 else 'Maikol'
lastname = sys.argv[2] if len(sys.argv) > 2 else 'Administrador'

php_code = f"""<?php
require_once '/var/www/html/sys_tienda/config/database.php';
try {{
    $pdo = db();
    $stmt = $pdo->prepare("UPDATE usuarios SET nombres = ?, apellidos = ? WHERE usuario = 'admin' OR id = 1");
    $stmt->execute(['{name}', '{lastname}']);
    echo "✓ Usuario actualizado con éxito a: {name} {lastname}\\n";
}} catch (Exception $e) {{
    echo "! Error: " . $e->getMessage() . "\\n";
}}
"""

with open('/tmp/change_name.php', 'w') as f:
    f.write(php_code)

subprocess.run(['php', '/tmp/change_name.php'], check=False)
