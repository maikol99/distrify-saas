# Política de Seguridad

## Reporte de Vulnerabilidades

Si descubrís una vulnerabilidad de seguridad en Distrify, por favor **no la reportes públicamente** en issues de GitHub. En su lugar, envía un reporte confidencial a:

**Email:** info@cuyocode.com.ar

Nos comprometemos a:
- Responder en un plazo de 72 horas confirmando la recepción
- Mantenerte informado sobre el progreso de la solución
- Publicar un aviso de seguridad una vez que la vulnerabilidad esté corregida
- Dar crédito público al investigador (si así lo desea)

## Alcance

Este proyecto sigue prácticas de seguridad estándar para aplicaciones NestJS. Las áreas de mayor interés para tests de seguridad incluyen:

- Autenticación JWT y manejo de cookies HTTP-only
- Aislamiento multi-tenant (ShopGuard)
- Protección CSRF en endpoints de cambio de estado
- Validación de entrada en todos los endpoints
- Sanitización de datos en plantillas de email

## Prácticas de Seguridad

- **Cookies HTTP-only**: Los tokens JWT se almacenan exclusivamente en cookies `httpOnly: true, secure: true, sameSite: 'strict'`
- **Autenticación global**: Todos los endpoints requieren autenticación JWT por defecto. Rutas públicas marcadas explícitamente con `@Public()`
- **Validación de entrada**: ValidationPipe global con `whitelist: true` y `forbidNonWhitelisted: true`
- **Rate limiting**: 50 req/min global, límites más estrictos en endpoints de auth (3-5 req/min)
- **Headers de seguridad**: Helmet configurado con CSP, HSTS, y otras cabeceras
- **Aislamiento multi-tenant**: ShopGuard global fuerza que cada usuario solo acceda a datos de su negocio
- **Passwords**: Bcrypt con salt rounds configurables (default: 12)
- **Revocación de tokens**: Sistema de tokenVersion que invalida todos los tokens al hacer logout

## Divulgación Responsable

Pedimos que:
1. No exploits ni pruebas en instancias de producción
2. No acceso a datos de otros usuarios
3. No ataques de denegación de servicio
4. No ingeniería social

Agradecemos profundamente a quienes nos ayuden a mantener Distrify seguro para todos los usuarios.
