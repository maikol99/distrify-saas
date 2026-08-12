# 🚀 Portfolio — Maikol Tomás Alegre

Portfolio personal moderno y responsive. Construido con HTML, CSS y JavaScript puro. Listo para deployar en Netlify.

## 📂 Archivos

```
portfolio/
├── index.html       → Estructura y contenido
├── style.css        → Estilos (tema dark azul/violeta)
├── script.js        → Animaciones e interactividad
├── profile.jpg      → Foto de perfil (reemplazar con la real)
├── cv-maikol-alegre.pdf  → CV para descarga (agregar)
└── netlify.toml     → Configuración de deploy
```

## ✅ Personalización antes de subir

1. **Foto de perfil**: Reemplazá `profile.jpg` con tu foto real
2. **CV**: Agregá tu `cv-maikol-alegre.pdf` en esta carpeta
3. **Datos personales**: Editá en `index.html`:
   - Email (`maikol@ejemplo.com`)
   - WhatsApp (`+54 9 11 1234-5678`)
   - Links de GitHub y LinkedIn
   - Descripción, proyectos, experiencia, educación
4. **Script.js**: Ajustá los roles del typewriter si querés

## 🌐 Deploy en Netlify

### Opción 1 — Drag & Drop (más fácil)
1. Andá a [netlify.com](https://netlify.com) → Sign up / Log in
2. En el dashboard → **"Add new site"** → **"Deploy manually"**
3. Arrastrá la carpeta `portfolio/` completa al área de drop
4. ¡Listo! En segundos tenés una URL pública

### Opción 2 — GitHub + Deploy automático
1. Subí esta carpeta a un repositorio de GitHub
2. En Netlify → **"Add new site"** → **"Import from Git"**
3. Conectá tu repo, branch `main`
4. Build settings:
   - **Publish directory**: `portfolio` (o `.` si el repo es solo el portfolio)
5. Cada push a `main` actualiza el sitio automáticamente

### Dominio personalizado
- En Netlify → Site settings → Domain management → Add custom domain

---
*Hecho con ❤️ para Maikol Tomás Alegre*
