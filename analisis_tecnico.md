# Sección 6: Análisis Técnico de Performance

> **Caso:** El módulo donde los asesores de admisiones ven los agendamientos del día tarda entre 6 y 10 segundos en cargar. Los usuarios se quejan.

Si yo recibiera este ticket, aplicaría el siguiente proceso de investigación paso a paso para identificar la raíz del problema antes de escribir o cambiar una sola línea de código:

### Paso 1: Reproducir el problema y medir en el cliente (Frontend)
Lo primero es validar si el problema es real y constante. Entraría al módulo afectado con las **DevTools del navegador (Network tab)** abiertas:
- Mediría el **Time to First Byte (TTFB)** y la **duración total** de las peticiones a la API.
- Observaría el tamaño del *payload* (¿Estamos descargando megabytes de datos innecesarios?).
- Analizaría si las peticiones ocurren en paralelo o si existe un bloqueo (waterfall).
- *Si la petición tarda milisegundos pero el navegador se congela, el problema es de renderizado en el Frontend (React/Vue procesando demasiada data en memoria).*

### Paso 2: Aislar el Backend (API)
Si el tab de Network muestra que el endpoint específico (`GET /api/agendamientos/dia`) tarda los 6-10 segundos, probaría consumir el endpoint directamente usando herramientas como **Postman**, **Insomnia** o **cURL**.
- Esto me permite descartar completamente el Frontend, la red local del cliente, o problemas de latencia en la CDN del frontend.

### Paso 3: Análisis de Infraestructura (Descarte)
Si el backend es lento, usaría paneles de monitoreo (AWS CloudWatch, Datadog, New Relic o equivalente) para revisar los recursos del servidor durante la ejecución del request:
- ¿Hay picos de CPU del 100%? Podría indicar que Node.js está bloqueando el Event Loop con cálculos pesados.
- ¿Hay problemas de Memoria/OOM?
- *Si todo está normal (CPU y RAM estables), el cuello de botella está muy probablemente en la Base de Datos.*

### Paso 4: Perfilar la Base de Datos y Queries
Si llegamos a la base de datos, habilitaría el logging de queries (ej. `log: ['query']` en Prisma o revisando los logs de PostgreSQL/pg_stat_statements).
- Extraería la query SQL exacta que está ejecutando el ORM.
- La ejecutaría manualmente en un cliente de base de datos (DBeaver, DataGrip) prefijándola con `EXPLAIN ANALYZE`.
- Esto revelará si la base de datos está haciendo un *Sequential Scan* (buscando fila por fila) porque falta un índice en una columna clave (como `fecha_agendamiento` o `estado`).

### Paso 5: Identificar el problema N+1 o Fetching excesivo
Revisaría el código del controlador de backend para confirmar cómo se están trayendo los datos:
- Si usamos un ORM, revisaría si estamos trayendo todas las relaciones (estudiantes, sedes, programas) una a una dentro de un bucle `for`, lo que genera un problema de consulta "N+1" (cientos de consultas a la DB por un solo request).
- Validaría si estamos usando paginación. Si hay 5,000 agendamientos en el día y estamos intentando mandarlos todos al frontend, explicaría la lentitud.

### Paso 6: Hablar con el equipo y los asesores (Contexto)
Finalmente, hablaría con los asesores (QA o Product) para entender el patrón de uso:
- ¿Pasa solo en la mañana o a toda hora? (Podría ser un cronjob compitiendo por recursos).
- ¿Pasa solo en sedes con muchos agendamientos o en todas?

**Conclusión:** Siguiendo este embudo (Navegador -> Red -> Backend -> Base de Datos), puedo asegurar que el esfuerzo de código se invierta exactamente donde está el problema (ej: agregando un índice en SQL, implementando paginación, o cambiando la lógica de carga del Frontend).
