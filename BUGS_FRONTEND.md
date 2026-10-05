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
- **Después:** ``find((p) => pathname === p || pathname.startsWith(`${p}/`))``
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

## Bug #16 — "Mis grupos" del docente no filtraba por el periodo abierto al entrar
- **Archivo:** `src/app/(app)/docente/grupos/page.tsx` (línea 21)
- **Problema:** Sin `?period=` en la URL, el selector marcaba el periodo abierto pero la consulta solo filtraba si había `requested`; se listaban los grupos de **todos** los periodos aunque el selector dijera otra cosa.
- **Antes:** ``${typeof requested === "string" && selected !== "todos" ? `&period=${selected}` : ""}``
- **Después:** ``${selected && selected !== "todos" ? `&period=${selected}` : ""}``
- **Cómo verificar:** Como docente, entrar a "Mis grupos" sin parámetros: solo aparecen los grupos del periodo abierto, como indica el selector.

## Bug #17 — "Faltan X%" del plan de evaluación con el signo invertido
- **Archivo:** `src/app/(app)/docente/grupos/[id]/evaluations-panel.tsx` (línea 44)
- **Problema:** `remaining = total - 100` daba negativo cuando faltaba porcentaje; con 60% decía "Te pasaste 40%" y con 120% decía "Faltan 20%".
- **Antes:** `const remaining = total - 100;`
- **Después:** `const remaining = 100 - total;`
- **Cómo verificar:** En un grupo, pestaña "Evaluaciones", con evaluaciones que sumen 60%: la tarjeta dice "Faltan 40% para completar el plan."

## Bug #18 — La planilla rechazaba notas escritas con coma ("4,5")
- **Archivo:** `src/app/(app)/docente/grupos/[id]/grade-sheet-panel.tsx` (línea 19)
- **Problema:** El comentario dice que se acepta coma o punto, pero el regex solo admite punto; "4,5" se marcaba como nota inválida y bloqueaba el botón Guardar.
- **Antes:** `const t = text.trim();`
- **Después:** `const t = text.trim().replace(",", ".");`
- **Cómo verificar:** En la pestaña "Notas", escribir `4,5` en una celda: se resalta como cambio válido (no en rojo) y se guarda como 4.5.

## Bug #19 — "Guardar nombre" siempre deshabilitado en Mi cuenta
- **Archivo:** `src/app/(app)/cuenta/account-forms.tsx` (línea 79)
- **Problema:** El botón exige `dirty`, pero `setDirty` nunca se llamaba (el lint lo marcaba: "'setDirty' is assigned a value but never used"). El usuario no podía cambiar su nombre.
- **Antes:** `onChange={(e) => setNewName(e.target.value)}`
- **Después:** `onChange={(e) => { setNewName(e.target.value); setDirty(true); }}`
- **Cómo verificar:** En "Mi cuenta", cambiar el nombre: el botón "Guardar nombre" se habilita y al pulsarlo aparece "Nombre actualizado." `npm run lint` ya no muestra el warning.

## Bug #20 — "Materias matriculadas" del inicio contaba también canceladas y de periodos pasados
- **Archivo:** `src/app/(app)/estudiante/page.tsx` (línea 16)
- **Problema:** La tarjeta dice "Matrículas activas este periodo", pero la consulta no filtraba por estado y contaba todas las matrículas del historial (canceladas, aprobadas y reprobadas).
- **Antes:** `"/enrollments/mine?limit=1"`
- **Después:** `"/enrollments/mine?limit=1&status=activa"`
- **Cómo verificar:** Con un estudiante con materias aprobadas en periodos anteriores, la tarjeta de inicio muestra solo las matrículas en curso (igual que las de "En curso" en "Mis materias").

## Bug #21 — Los filtros del panel de administración se perdían al cambiar de página
- **Archivo:** `src/components/admin/resource-manager.tsx` (línea 115)
- **Problema:** Los filtros solo se mandaban a la API si `page === 1`. Al pulsar "Siguiente", la página 2 traía registros sin filtrar (p. ej. usuarios de cualquier rol aunque se filtrara por "Docente").
- **Antes:** `if (page === 1) Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));`
- **Después:** `Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));`
- **Cómo verificar:** En "Usuarios", filtrar por rol "Estudiante" y pasar a la página 2: todos los registros siguen siendo estudiantes.

## Bug #22 — Las tablas de administración se cortaban en pantallas pequeñas
- **Archivo:** `src/components/admin/resource-manager.tsx` (línea 187)
- **Problema:** La tabla tiene `min-w-[40rem]` dentro de una `Card` con `overflow-hidden`, pero el contenedor no tenía `overflow-x-auto`; en móvil o ventanas angostas las columnas de la derecha (incluida "Acciones") quedaban ocultas sin poder desplazarse. Las demás tablas de la app sí usan `overflow-x-auto`.
- **Antes:** `<div>`
- **Después:** `<div className="overflow-x-auto">`
- **Cómo verificar:** Abrir "Grupos" o "Usuarios" con la ventana a ~400 px de ancho: la tabla se puede desplazar horizontalmente y se ven los botones de Acciones.

## Bug #23 — El formulario de edición de usuarios no se podía cerrar
- **Archivo:** `src/components/admin/resource-manager.tsx` (línea 297)
- **Problema:** Para saber si había cambios se comparaban los valores del formulario con la fila cruda de la API (`row`), que tiene otra forma (`_id`, `createdAt`, sin `password`…). Siempre daba "con cambios", y como Usuarios usa `keepOpenIfDirty`, ni "Cancelar" ni la X cerraban el modal de edición.
- **Antes:** `JSON.stringify(row ?? config.initial(null))`
- **Después:** `JSON.stringify(config.initial(row))`
- **Cómo verificar:** En "Usuarios", pulsar Editar y luego "Cancelar" sin tocar nada: el modal se cierra. Si se modifica un campo, sigue abierto (comportamiento esperado de `keepOpenIfDirty`).

## Bug #24 — El admin no podía cancelar matrículas (método HTTP equivocado)
- **Archivo:** `src/components/admin/operations.tsx` (línea 346)
- **Problema:** Igual que en el estudiante: se usaba `PATCH /enrollments/:id/cancel`, pero el backend define `POST`. El modal mostraba error y la matrícula no se cancelaba.
- **Antes:** `{ method: "PATCH" }`
- **Después:** `{ method: "POST" }`
- **Cómo verificar:** En "Matrículas", pulsar el ícono de cancelar de una matrícula en curso y confirmar: el modal se cierra y el estado pasa a "Cancelada".

## Bug #25 — "Matricular estudiante" (admin) enviaba `group` en vez de `groupId`
- **Archivo:** `src/components/admin/operations.tsx` (línea 336)
- **Problema:** El backend espera `{ student, groupId }` y rechaza propiedades desconocidas; con `group` respondía 400 y el admin no podía matricular a nadie.
- **Antes:** `toBody: (v) => ({ student: text(v.student), group: text(v.group) })`
- **Después:** `toBody: (v) => ({ student: text(v.student), groupId: text(v.group) })`
- **Cómo verificar:** En "Matrículas" → "Matricular estudiante", elegir estudiante y grupo y pulsar "Crear": aparece "Registro creado correctamente." y la matrícula sale en la tabla.

## Bugs de frontera (requieren coordinar con backend/BD)

## Sospechosos (no modificados)
