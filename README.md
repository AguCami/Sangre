# Sangre · App de Hemoterapia

Web app (PWA) pensada para usarse en **tablet**, con acceso a **cámara**. Esta
primera entrega incluye la **pantalla de login** con un fondo animado (la gota
de sangre que cae) y el formulario que emerge cuando la gota pasa por la mitad
del recorrido.

## Stack

- **React + Vite + TypeScript**
- **PWA** (instalable en la pantalla de inicio, pantalla completa) vía
  `vite-plugin-pwa`
- **Supabase** para autenticación (con **modo maqueta** si no hay credenciales)

## Cómo correrlo

```bash
npm install
npm run dev
```

Vite imprime una URL `http://localhost:5173` y también una de red
(`http://192.168.x.x:5173`) para abrir desde la tablet.

> ⚠️ **La cámara necesita HTTPS.** Funciona en `localhost`, pero para probar
> desde la tablet por IP vas a necesitar servir por `https://`. Para producción,
> cualquier hosting con HTTPS (Vercel, Netlify, Cloudflare Pages) sirve.

Build de producción:

```bash
npm run build
npm run preview
```

## Autenticación

La capa de auth es **enchufable** (`src/auth/`):

- **Sin credenciales de Supabase** → *modo maqueta*: acepta cualquier email
  válido y contraseña de 6+ caracteres. Ideal para ver el diseño en la tablet.
- **Con credenciales** → usa Supabase real, sin tocar la UI.

Para conectar Supabase, copiá `.env.example` a `.env` y completá:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

(Settings → API en tu proyecto de Supabase. Usá **siempre** la clave `anon`,
nunca la `service_role`.)

## Estructura

```
public/
  login-bg.mp4        Video de fondo (gota cayendo)
  login-poster.jpg    Primer frame (evita el flash negro)
  icon*.svg           Iconos de la PWA
src/
  auth/               Contexto de auth + modo maqueta (Supabase enchufable)
  lib/supabase.ts     Cliente de Supabase
  pages/Login.tsx     Login con video + revelado sincronizado a la gota
  pages/Home.tsx      Pantalla post-login + prueba de cámara
```

El revelado del formulario se sincroniza con el video en
`src/pages/Login.tsx` (constante `TIEMPO_REVELADO`, ~1.5s = mitad de la caída).

## Próximos pasos

- [ ] Conectar Supabase real y crear los usuarios del equipo.
- [ ] **Login con huella** (WebAuthn / passkeys usando el sensor de la tablet).
- [ ] Cierre de sesión por inactividad (tablet compartida).
- [ ] Módulos de hemoterapia + uso de la cámara (escaneo de bolsas, QR, DNI).
```

### Nota sobre datos sensibles

Son datos de salud. Al avanzar: HTTPS siempre, permisos por rol en la base
(Row Level Security de Supabase), y elegir región del servidor acorde a la
normativa local de datos personales.
