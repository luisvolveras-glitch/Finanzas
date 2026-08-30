# Mis Finanzas

App personal de ingresos y gastos, con:

- Panel principal estilo tarjetas (balance, gastos por categoría, movimientos recientes).
- Sección "Resumen cruzado" con tabla de Ingresos vs. Gastos por mes y tabla por categoría.
- Formulario para agregar/editar/eliminar movimientos desde la web.
- API protegida para conectar el atajo de **Shortcuts** de iPhone y registrar ingresos/gastos por voz o con un toque.

La app está protegida con una contraseña simple (una sola persona/hogar la usa).

## Stack técnico

- Next.js (App Router) + TypeScript + Tailwind CSS
- Base de datos: SQLite (archivo local, vía `better-sqlite3`) — no requiere servicios externos de base de datos.

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y edita las claves
npm run dev
```

Abre `http://localhost:3000`, inicia sesión con el `APP_PASSWORD` que definiste.

## Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `APP_PASSWORD` | Contraseña para entrar a la web. |
| `API_TOKEN` | Token secreto que usará el Atajo de iPhone para poder crear movimientos. |
| `DATABASE_PATH` | Ruta del archivo SQLite. En producción debe apuntar a un **disco persistente** (ver despliegue abajo). Si no se define, usa `./data/finanzas.db`. |

## Despliegue (recomendado: Railway)

Como la app usa un archivo SQLite, necesitas un hosting con **disco persistente** (no serverless). Railway es la opción más simple:

1. Crea una cuenta en [railway.app](https://railway.app) y conéctala a tu GitHub.
2. **New Project → Deploy from GitHub repo** y elige este repositorio y la rama `claude/income-expense-app-6wnaj6` (o la rama principal una vez que fusiones tus cambios).
3. Railway detecta que es un proyecto Node/Next.js automáticamente (build: `npm run build`, start: `npm run start`).
4. Ve a la pestaña **Volumes** del servicio y crea un volumen montado en `/data`.
5. En **Variables**, agrega:
   - `APP_PASSWORD` = una contraseña tuya
   - `API_TOKEN` = un token largo y aleatorio (por ejemplo, generado con `openssl rand -hex 24`)
   - `DATABASE_PATH` = `/data/finanzas.db`
6. Despliega. Railway te da una URL pública tipo `https://tu-app.up.railway.app`.

**Alternativa: Render.** Mismo procedimiento, pero el disco persistente ("Disks") solo está disponible en planes pagos de Render; en el plan gratuito el archivo SQLite se perdería en cada redeploy.

> Vercel **no** sirve para este proyecto tal como está armado (es serverless y no tiene disco persistente). Si en el futuro prefieres Vercel, se puede migrar la base de datos a Postgres — dímelo y lo ajusto.

## Configurar el Atajo de iPhone (Shortcuts)

Con esto podrás decirle a Siri "Agregar gasto" o tocar un ícono en tu pantalla de inicio para registrar un movimiento sin abrir la web.

### Atajo para registrar un gasto

1. Abre la app **Atajos** → toca **+** para crear uno nuevo.
2. Agrega la acción **"Preguntar por entrada"** (Ask for Input):
   - Tipo: **Número**
   - Pregunta: "¿Cuánto gastaste?"
   - Guarda el resultado en la variable **Monto**.
3. Agrega otra **"Preguntar por entrada"**:
   - Tipo: **Texto**
   - Pregunta: "¿En qué fue?"
   - Guarda el resultado en la variable **Detalle**.
4. (Opcional) Agrega **"Elegir de una lista"** con tus categorías (ej. Comida, Transporte, Vivienda, Servicios, Entretenimiento, Salud, Compras, Educación, Otro gasto) y guarda el resultado en **Categoría**.
5. Agrega la acción **"Obtener contenido de URL"** (Get Contents of URL) y configúrala así:
   - **URL**: `https://tu-app.up.railway.app/api/transactions`
   - **Método**: `POST`
   - **Encabezados**:
     - `Authorization` → `Bearer TU_API_TOKEN`
     - `Content-Type` → `application/json`
   - **Cuerpo de la solicitud**: tipo **JSON**, con estos campos:
     - `type` → texto fijo `expense`
     - `amount` → variable **Monto**
     - `detail` → variable **Detalle**
     - `category` → variable **Categoría** (si la agregaste)
6. (Opcional) Agrega **"Obtener valor del diccionario"** con la clave `balance` sobre el resultado anterior, y luego **"Mostrar notificación"** mostrando algo como "Gasto registrado. Balance actual: [balance]".
7. Guarda el atajo como **"Agregar gasto"**. Puedes agregarlo a tu pantalla de inicio o decir "Oye Siri, agregar gasto".

### Atajo para registrar un ingreso

Duplica el atajo anterior, cámbiale el nombre a **"Agregar ingreso"** y en el paso del cuerpo JSON cambia `type` de `expense` a `income` (y ajusta las categorías de la lista si la usas).

### Campos que acepta la API (`POST /api/transactions`)

```json
{
  "type": "expense",       // "expense" o "income" (obligatorio)
  "amount": 25.5,           // número mayor a 0 (obligatorio)
  "detail": "Almuerzo",     // texto (obligatorio)
  "category": "comida",     // opcional, texto libre o uno de los ids predefinidos
  "date": "2026-08-30"      // opcional, formato AAAA-MM-DD (por defecto hoy)
}
```

Siempre requiere el encabezado `Authorization: Bearer TU_API_TOKEN`.

También puedes consultar tu balance del mes con `GET /api/transactions?month=2026-08` (mismo encabezado), útil para un atajo tipo "¿Cómo voy este mes?".

## Categorías incluidas

Ingresos: Salario, Freelance, Inversiones, Regalo, Otro ingreso.
Gastos: Comida, Transporte, Vivienda, Servicios, Entretenimiento, Salud, Compras, Educación, Otro gasto.

Si envías desde el Atajo una categoría que no existe en esta lista, igual se guarda como texto libre (solo que se muestra con un ícono genérico).

## Próximos apartados

Este proyecto está pensado para ir creciendo: cuéntame qué otras secciones quieres (presupuestos por categoría, gráficos de tendencia, exportar a Excel, múltiples usuarios/cuentas, etc.) y las vamos agregando.
