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

## Bugs de frontera (requieren coordinar con backend/BD)

## Sospechosos (no modificados)
