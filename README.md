# Finanzas MX

App de finanzas personales (100% local, funciona sin internet) hecha con React + Vite.
Cada persona que la instale en su propio teléfono guarda su información únicamente
en ese dispositivo — no hay cuentas ni servidor, así que nadie ve los datos de nadie más.

## 1. Requisitos

- Tener [Node.js](https://nodejs.org) instalado (versión 18 o superior).
- Tener una cuenta de GitHub.

## 2. Probarla en tu computadora primero (opcional pero recomendado)

```bash
npm install
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`).

## 3. Subirla a GitHub

1. Crea un repositorio nuevo en GitHub, por ejemplo `finanzas-mx-app` (puede ser privado).
2. En este proyecto, abre `vite.config.js` y en la línea `base:` pon el nombre exacto
   de tu repositorio entre diagonales, por ejemplo:
   ```js
   base: "/finanzas-mx-app/",
   ```
   También cambia `start_url` y `scope` dentro de `manifest` para que coincidan.
   (Si tu repo se llama `tuusuario.github.io`, usa `base: "/"` en su lugar.)
3. Sube el código:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de Finanzas MX"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

## 4. Activar la publicación automática (GitHub Pages)

1. En tu repositorio de GitHub, ve a **Settings → Pages**.
2. En "Build and deployment" → "Source", selecciona **GitHub Actions**.
3. Ya está. Cada vez que hagas `git push` a la rama `main`, el workflow en
   `.github/workflows/deploy.yml` va a compilar la app y publicarla solo.
4. Después de unos minutos, tu app estará disponible en:
   ```
   https://TU-USUARIO.github.io/TU-REPO/
   ```

## 5. Instalarla en el celular (sin App Store ni Play Store)

Comparte esa URL con tus amigos. Cada quien, desde su propio celular:

- **iPhone (Safari):** abre el link → botón de compartir (el cuadrito con flecha) →
  "Agregar a la pantalla de inicio".
- **Android (Chrome):** abre el link → menú (⋮) → "Instalar app" o "Agregar a
  pantalla de inicio".

Con eso les queda un ícono como cualquier app, abre en pantalla completa (sin
la barra del navegador), y **funciona sin internet** después de la primera vez
que la abren (el service worker ya dejó todo guardado en el teléfono).

## 6. Sobre los datos

- Todo se guarda con `localStorage` en el propio navegador/teléfono de cada
  persona (ver `src/storage.js`). No se sincroniza entre dispositivos ni se
  sube a ningún lado.
- Si alguien borra los datos del navegador o desinstala la app, pierde su
  historial — no hay respaldo en la nube. Si más adelante quieres respaldo
  entre dispositivos, eso ya implica agregar una cuenta y un servidor (Firebase,
  Supabase, etc.), que es un paso más grande.

## 7. Actualizar la app más adelante

Cada vez que quieras cambiar algo, edita `src/App.jsx`, haz `git push`, y
GitHub Actions vuelve a publicar la nueva versión sola. Los teléfonos que ya
la instalaron reciben la actualización automáticamente la siguiente vez que
abran la app con internet (el service worker se actualiza solo).
