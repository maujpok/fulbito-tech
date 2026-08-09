# Fulbito — landing page

Sitio de lanzamiento de **Fulbito**, la app para organizar picados de fútbol.
Anuncia que la app está por salir en App Store y Google Play, y capta correos
para la lista de espera.

- **Producción:** https://www.fulbito.tech
- **Stack:** HTML + CSS + JavaScript, sin build ni dependencias.
- **Hosting:** GitHub Pages (deploy automático en cada push a `main`).

La identidad visual sale del design system de la app
([`maujpok/sport-team-manager`](https://github.com/maujpok/sport-team-manager)):
verde `#16A34A`, ámbar `#FBBF24`, navy `#0F172A`, tipografía Manrope, y los
mismos textos y fotos del onboarding (`l10n/app_es.arb`, `assets/images/welcome/`).

---

## Estructura

```
.
├── index.html              # la landing completa
├── 404.html                # página de error
├── styles.css              # estilos (incluye @font-face de Manrope)
├── script.js               # lista de espera, menú, animaciones  ← configurar acá
├── CNAME                   # dominio propio: www.fulbito.tech
├── .nojekyll               # evita que Pages procese el sitio con Jekyll
├── site.webmanifest        # metadata para instalar como PWA
├── robots.txt / sitemap.xml
├── .github/workflows/deploy.yml
└── assets/
    ├── logo.svg, favicon.svg
    ├── fonts/              # Manrope variable (woff2) + licencia OFL
    └── img/                # fotos optimizadas, íconos y la imagen para redes (og.jpg)
```

---

## 1. Configurar la lista de espera (Formspree)

El formulario funciona sin backend. Por defecto, mientras no haya endpoint
configurado, abre el cliente de correo del visitante hacia `fulbitoappok@gmail.com`.
Para guardar los correos automáticamente:

1. Creá una cuenta en [formspree.io](https://formspree.io) y un formulario nuevo.
2. Copiá el endpoint que te da, con esta forma: `https://formspree.io/f/xxxxxxxx`.
3. Pegalo en `script.js`, en la primera constante del archivo:

   ```js
   var WAITLIST_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
   ```

4. Commiteá y pusheá: el deploy se dispara solo.

> El plan gratuito de Formspree permite 50 envíos por mes. Cada envío llega con
> el campo `email` y un campo `origen` para saber que vino de la landing.

Si preferís otro servicio (Buttondown, Mailchimp, Google Forms, un endpoint
propio), sirve cualquier URL que acepte un `POST` con `FormData` y responda
`2xx`. El correo de contacto se cambia en la misma sección de `script.js`
(`CONTACT_EMAIL`) y en `index.html`.

---

## 2. Publicar en GitHub Pages

En **Settings → Pages** del repositorio:

1. En *Build and deployment*, elegí **Source: GitHub Actions**.
2. Listo. El workflow `.github/workflows/deploy.yml` publica la raíz del repo en
   cada push a `main`.

El archivo `CNAME` ya contiene `www.fulbito.tech`, así que Pages toma el dominio
propio automáticamente.

---

## 3. Apuntar el dominio www.fulbito.tech

En el panel DNS de tu proveedor de dominio, creá estos registros:

| Tipo    | Nombre / Host | Valor                  |
| ------- | ------------- | ---------------------- |
| `CNAME` | `www`         | `maujpok.github.io`    |

Y para que `fulbito.tech` (sin `www`) redirija al sitio, agregá los cuatro
registros `A` del dominio raíz de GitHub Pages:

| Tipo | Nombre / Host | Valor             |
| ---- | ------------- | ----------------- |
| `A`  | `@`           | `185.199.108.153` |
| `A`  | `@`           | `185.199.109.153` |
| `A`  | `@`           | `185.199.110.153` |
| `A`  | `@`           | `185.199.111.153` |

> Si tu DNS es Cloudflare, poné los registros en **DNS only** (nube gris) hasta
> que GitHub emita el certificado; después podés activar el proxy.

Cuando el DNS propague (de unos minutos a unas horas), volvé a
**Settings → Pages**, verificá que el *Custom domain* diga `www.fulbito.tech` y
tildá **Enforce HTTPS**.

---

## Desarrollo local

No hay build ni dependencias. Alcanza con servir la carpeta con cualquier
servidor estático (las rutas son absolutas, así que abrir `index.html` con
`file://` no funciona):

```bash
npx http-server -p 8080 .
# o
python3 -m http.server 8080
```

Y abrir http://localhost:8080.

### Cambiar los textos

Todo el contenido está en `index.html`, en español rioplatense y alineado con
los textos de la app. Los tres bloques de funciones salen de las diapositivas
de bienvenida (`welcomeSlide*` en `l10n/app_es.arb`).

### Cambiar la imagen para redes sociales

`assets/img/og.jpg` (1200×630) es lo que se ve al compartir el link en WhatsApp,
X o LinkedIn. Si la reemplazás, mantené esas medidas y el nombre del archivo.

---

## Cuando la app salga

1. Reemplazar las insignias “Próximamente en …” de `index.html` por los enlaces
   reales a App Store y Google Play.
2. Cambiar el titular del bloque de lista de espera por un “Descargá Fulbito”.
3. Actualizar `availability` en el JSON-LD del `<head>`, de
   `https://schema.org/PreOrder` a `https://schema.org/InStock`.

---

## Licencias

- Código del sitio: propiedad de Fulbito.
- Tipografía Manrope: SIL Open Font License 1.1 — ver `assets/fonts/OFL.txt`.
- Fotos: las mismas del onboarding de la app.
