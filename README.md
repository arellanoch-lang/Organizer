# Mi Organizador

App personal (PWA) para saber cada día qué toca. Se instala en la pantalla de inicio del móvil y funciona sin conexión.

## Secciones

- **Mi día** (pantalla de inicio, la app siempre abre aquí): cómo se organiza hoy, primero lo que va «durante el día» y luego lo que tiene hora. Debajo, lo atrasado (con «pasar a hoy / mañana»), el siguiente paso de UNIXO y los próximos 7 días. Cada tarea se toca para ver sus opciones.
- **Repaso semanal** (desde «Mi día»): qué se hizo, qué quedó pendiente (pasarlo todo de golpe), cómo viene la semana siguiente y notas del repaso.
- **10K**: plan para la Saucony 10K de París (6 dic 2026) con progreso (km por semana, ritmo medio, sensaciones), «Cómo fue» con capturas del reloj en cada entreno, calentamiento en los rodajes suaves y hybrid martes y jueves a las 19:00.
- **Insta**: calendario de publicaciones (vacío a la espera del nuevo) con textos para copiar.
- **Clientes**: CRM del freelance de apps y webs. Cifras (por contactar, en juego, en propuestas, ganado), búsqueda, filtros por estado y ficha de cada cliente con próxima acción, actividad (llamada, WhatsApp, email, reunión, nota), proyecto (servicio, presupuesto, origen, enlace a la propuesta) y datos de contacto. **Mensajes tipo** (envío de propuesta, seguimiento, oferta final) que se rellenan solos y se envían por WhatsApp o email, y **presupuesto en PDF** con la identidad de marca (logo de la C, Jost y Manrope, colores papel y verde gris, como el «Presupuesto Forno Bomba»), editable por cliente.
- **UNIXO**: plan de las sudaderas por fases y pasos, ordenados por fecha, con el siguiente paso siempre visible.
- **Ideas**: bandeja de ideas sin fecha y tareas programadas.
- **Botón +**: añade una tarea o idea, un cliente, un paso de UNIXO o una publicación desde cualquier pantalla.

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
