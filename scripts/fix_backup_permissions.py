#!/usr/bin/env python3
"""
fix_backup_permissions.py
Otorga permisos de escritura al servidor web (www-data) en la carpeta de respaldos y subidas.
"""
import os, subprocess

BASE = '/var/www/html/sys_tienda'

paths = [
    f'{BASE}/backups',
    f'{BASE}/assets/uploads',
    f'{BASE}/assets/uploads/productos',
    f'{BASE}/assets/uploads/empresa',
    f'{BASE}/assets/uploads/comprobantes'
]

for p in paths:
    os.makedirs(p, exist_ok=True)
    subprocess.run(['chmod', '-R', '777', p], check=False)

print("✅ Permisos de escritura corregidos en la carpeta de respaldos y uploads.")
