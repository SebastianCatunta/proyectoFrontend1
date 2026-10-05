# Bugs Frontend

## Bug #1 — Typo en el nombre del día lunes
- **Archivo:** `src/lib/format.ts` (línea 6)
- **Problema:** La etiqueta del lunes decía "Lrrrrunes", así que el horario semanal del estudiante y del docente mostraba ese texto en la columna del lunes.
- **Antes:** `lunes: "Lrrrrunes",`
- **Después:** `lunes: "Lunes",`
- **Cómo verificar:** Entrar como estudiante o docente a "Horario": la primera columna se titula "Lunes".

## Bug #2 — Matrícula reprobada se muestra como "Aprobada"
- **Archivo:** `src/lib/format.ts` (línea 25)
- **Problema:** `STATUS_LABEL.reprobada` tenía el texto "Aprobada", así que una materia perdida aparecía como aprobada (con badge rojo) en Mis materias, Notas, Historial y en la lista de estudiantes del docente.
- **Antes:** `reprobada: "Aprobada",`
- **Después:** `reprobada: "Reprobada",`
- **Cómo verificar:** Como estudiante con una materia perdida, ir a "Historial": el badge rojo dice "Reprobada".

## Bug #3 — El proxy solo protegía la raíz de cada área por rol
- **Archivo:** `src/proxy.ts` (línea 20)
- **Problema:** La comparación `pathname === p` solo coincidía con `/admin`, `/docente` y `/estudiante` exactos. Un estudiante podía abrir `/admin/usuarios` o `/docente/grupos` porque las subrutas no se revisaban.
- **Antes:** `find((p) => pathname === p)`
- **Después:** `find((p) => pathname === p || pathname.startsWith(\`${p}/\`))`
- **Cómo verificar:** Iniciar sesión como estudiante y escribir `/admin/usuarios` en la barra de direcciones: redirige a `/estudiante`.

## Bug #4 — Puerto del backend equivocado en `.env.example`
- **Archivo:** `.env.example` (línea 2)
- **Problema:** `BACKEND_URL` apuntaba a `http://localhost:3005`, pero el backend corre en el puerto 3000 (README del front, README y `.env.example` del backend, y el valor por defecto de `src/lib/server.ts`). Al copiar el archivo a `.env.local`, el front no encontraba la API.
- **Antes:** `BACKEND_URL=http://localhost:3005`
- **Después:** `BACKEND_URL=http://localhost:3000`
- **Cómo verificar:** `cp .env.example .env.local`, levantar el front e iniciar sesión: el login llega al backend y no muestra "No se pudo conectar con el servidor".

## Bug #5 — Enlaces del menú lateral invisibles (blanco sobre blanco)
- **Archivo:** `src/components/app-shell.tsx` (línea 83)
- **Problema:** Los enlaces no activos del menú usaban `text-white` sobre el fondo `bg-surface` (blanco), así que no se veían; solo se veía el enlace activo.
- **Antes:** `: "text-white hover:bg-primary-50 hover:text-ink"`
- **Después:** `: "text-muted hover:bg-primary-50 hover:text-ink"`
- **Cómo verificar:** Iniciar sesión con cualquier rol: todos los enlaces del menú lateral se leen en gris y el activo en morado.

## Bug #6 — Títulos de sección del menú invisibles
- **Archivo:** `src/components/app-shell.tsx` (líneas 106 y 112)
- **Problema:** Los encabezados de grupo del menú ("Catálogo", "Operación", "Personas", "Cuenta") usaban `text-white` sobre fondo blanco y no se veían.
- **Antes:** `text-xs font-bold tracking-wider text-white uppercase`
- **Después:** `text-xs font-bold tracking-wider text-muted uppercase`
- **Cómo verificar:** Entrar como admin: en el menú lateral se leen los títulos "CATÁLOGO", "OPERACIÓN", "PERSONAS" y "CUENTA".

## Bug #7 — Las clases del sábado aparecían en la columna del viernes
- **Archivo:** `src/components/week-schedule.tsx` (líneas 13-15)
- **Problema:** `Math.min(DAYS.indexOf(d), 4)` juntaba el sábado (índice 5) con el viernes (índice 4). La tarjeta "Sábado" siempre decía "Sin clases" y el viernes mostraba clases que no eran suyas.
- **Antes:** `const slots = DAYS.filter((d) => Math.min(DAYS.indexOf(d), 4) === col).flatMap((d) => byDay[d] ?? []);`
- **Después:** `const slots = byDay[day] ?? [];`
- **Cómo verificar:** Con un grupo que tenga clase el sábado, abrir "Horario": la clase aparece en la tarjeta "Sábado", no en "Viernes".

## Bug #8 — El saludo del estudiante mostraba el apellido
- **Archivo:** `src/app/(app)/estudiante/page.tsx` (línea 22)
- **Problema:** Se tomaba `split(" ")[1]` (segunda palabra del nombre); para "Juliana Herrera" decía "Hola, Herrera", y con nombres de una sola palabra decía "Hola, undefined".
- **Antes:** `` `Hola, ${me.name.split(" ")[1]}` ``
- **Después:** `` `Hola, ${me.name.split(" ")[0]}` ``
- **Cómo verificar:** Entrar como juliana.herrera147@universidad.edu: el encabezado dice "Hola, Juliana".

## Bug #9 — Cancelar matrícula usaba el método HTTP equivocado
- **Archivo:** `src/app/(app)/estudiante/materias/cancel-button.tsx` (línea 17)
- **Problema:** Se llamaba `PATCH /enrollments/:id/cancel`, pero el backend define `@Post(':id/cancel')`. La cancelación respondía 404 y la matrícula no se cancelaba.
- **Antes:** `{ method: "PATCH" }`
- **Después:** `{ method: "POST" }`
- **Cómo verificar:** En "Mis materias" pulsar "Cancelar" y luego "Sí, cancelar": no aparece error y la matrícula pasa a "Cancelada".

## Bug #10 — La lista no se actualizaba después de cancelar
- **Archivo:** `src/app/(app)/estudiante/materias/cancel-button.tsx` (líneas 4, 9 y 20)
- **Problema:** La página es un Server Component; tras cancelar no se pedía `router.refresh()`, así que la tarjeta seguía como "En curso" con el botón Cancelar hasta recargar a mano.
- **Antes:** `setConfirming(false); setLoading(false);` (sin refresco)
- **Después:** se agrega `const router = useRouter();` y `router.refresh();` tras cancelar
- **Cómo verificar:** Cancelar una materia: la tarjeta pasa sola a "Cancelada" (atenuada y sin botón), sin recargar la página.

## Bug #11 — "Mis materias" ordenaba los periodos del más viejo al más nuevo
- **Archivo:** `src/app/(app)/estudiante/materias/page.tsx` (línea 22)
- **Problema:** El comentario y el diseño piden "el más reciente primero", pero el `sort` era ascendente; el periodo abierto quedaba al final de la página.
- **Antes:** `.sort(([a], [b]) => a.localeCompare(b))`
- **Después:** `.sort(([a], [b]) => b.localeCompare(a))`
- **Cómo verificar:** En "Mis materias", con matrículas en varios periodos, el primero que aparece es el más reciente (p. ej. 2026-2 antes que 2026-1).

## Bug #12 — Matricular enviaba el campo `group` en vez de `groupId`
- **Archivo:** `src/app/(app)/estudiante/matricula/enroll-view.tsx` (línea 50)
- **Problema:** El backend (`CreateEnrollmentDto`) espera `groupId` y tiene `forbidNonWhitelisted`, así que el body `{ group }` se rechazaba con 400 ("property group should not exist") y nadie podía matricularse.
- **Antes:** `body: { group: g.group }`
- **Después:** `body: { groupId: g.group }`
- **Cómo verificar:** En "Matricular", pulsar "Matricular" en un grupo: aparece "Quedaste matriculado en …" y los créditos suben.

## Bug #13 — Una nota de 3.0 se pintaba como reprobada
- **Archivo:** `src/app/(app)/estudiante/notas/page.tsx` (línea 73)
- **Problema:** Se aprueba con 3.0 o más, pero la condición `value <= PASSING` ponía en rojo las notas de exactamente 3.0.
- **Antes:** `value <= PASSING ? "text-danger-600"`
- **Después:** `value < PASSING ? "text-danger-600"`
- **Cómo verificar:** En "Notas", una evaluación con 3.0 se ve en verde; una con 2.9, en rojo.

## Bug #14 — El acumulado de notas era un promedio simple y no ponderado
- **Archivo:** `src/app/(app)/estudiante/notas/page.tsx` (línea 40)
- **Problema:** "Acumulado (X% evaluado)" sumaba las notas y dividía por la cantidad, sin usar el peso de cada evaluación. El backend (`academic.service.ts`) calcula `accumulated += value * (weight / 100)`, así que el estudiante veía un número distinto al de la planilla del docente.
- **Antes:** `graded.length > 0 ? graded.reduce((sum, r) => sum + (r.value ?? 0), 0) / graded.length : 0`
- **Después:** `graded.reduce((sum, r) => sum + (r.value ?? 0) * (r.ev.weight / 100), 0)`
- **Cómo verificar:** Con un parcial de 30% calificado con 4.0, el acumulado muestra 1.20 (antes mostraba 4.00), igual que la columna "Acumulado" del docente.

## Bug #15 — Cupo del grupo invertido en "Mis grupos" del docente
- **Archivo:** `src/app/(app)/docente/grupos/page.tsx` (línea 52)
- **Problema:** El badge mostraba `capacidad / matriculados` (p. ej. "30 / 12 estudiantes"), al revés que en el detalle del grupo.
- **Antes:** `{g.capacity} / {g.enrolled} estudiantes`
- **Después:** `{g.enrolled} / {g.capacity} estudiantes`
- **Cómo verificar:** Como docente, en "Mis grupos" el badge dice "12 / 30 estudiantes", igual que dentro del grupo.

## Bugs de frontera (requieren coordinar con backend/BD)

## Sospechosos (no modificados)
