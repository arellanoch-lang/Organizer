# Mi Organizador

App personal (PWA) para saber cada día qué toca. Se instala en la pantalla de inicio del móvil y funciona sin conexión.

## Secciones

- **Mi día** (pantalla de inicio, la app siempre abre aquí): cómo se organiza hoy, primero lo que va «durante el día» y luego lo que tiene hora. Debajo, lo atrasado, el siguiente paso de UNIXO, un campo para apuntar ideas y los próximos 7 días.
- **10K**: plan de entrenamiento para la Saucony 10K de París (6 dic 2026), con sesiones marcables, calentamiento de fuerza en los rodajes suaves y hybrid martes y jueves a las 19:00. Cualquier entreno o clase se puede cambiar de día.
- **Insta**: calendario de publicaciones de @lemondenais (octubre) con textos para copiar. Se pueden añadir más publicaciones.
- **Clientes**: freelance de apps y webs. Contactos con estado, notas, historial y «cuándo y por qué contactar».
- **UNIXO**: plan de las sudaderas por fases y pasos, con el siguiente paso siempre visible.
- **Ideas**: bandeja de ideas sin fecha y tareas programadas.

## Avisos

El botón 🔔 crea un aviso (archivo `.ics` con alarma) para guardarlo en la app de calendario del móvil, que avisa a la hora aunque el organizador esté cerrado. Sin servidor, la app no puede mandar notificaciones por sí sola.

## Datos

Todo se guarda en el propio dispositivo (`localStorage`). Desde el menú `⋯` se descarga una copia de seguridad en JSON y se restaura en otro móvil.

## Publicarla

Necesita servirse por HTTPS para poder instalarse. Con GitHub Pages: *Settings → Pages → Deploy from a branch* y elegir la rama. Después, abrir la URL en el móvil y «Añadir a pantalla de inicio».

Al cambiar archivos, sube la versión de `CACHE` en `sw.js`.

## Probar en local

```
python3 -m http.server 8000
```

y abrir http://localhost:8000
