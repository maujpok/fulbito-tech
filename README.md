# Fulbito — landing page

Landing de pre-lanzamiento de **Fulbito**, la app para organizar grupos de fútbol
amateur. Su objetivo no es conseguir descargas: es identificar y captar
**organizadores de grupos** para la campaña *100 Capitanes Fundadores*.

- **Producción:** https://www.fulbito.tech
- **Stack:** HTML + CSS + JavaScript, sin build ni dependencias.
- **Hosting:** GitHub Pages (deploy automático en cada push a `main`).

La identidad visual sale del design system de la app
([`maujpok/sport-team-manager`](https://github.com/maujpok/sport-team-manager)):
verde `#16A34A`, ámbar `#FBBF24`, navy `#0F172A` y tipografía Manrope.

---

## Estructura

```
.
├── index.html              # la landing completa
├── 404.html                # página de error
├── styles.css              # estilos (incluye @font-face de Manrope)
├── script.js               # formulario, scoring, analítica  ← configurar acá
├── data/comunidad.json     # números reales de la campaña (ver más abajo)
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

### Narrativa de la página

1. **Hero** — el problema y el CTA de Capitanes.
2. **El problema** — la conversación de WhatsApp que todos reconocen.
3. **WhatsApp vs. Fulbito** — la transformación, sin poner a WhatsApp de enemigo.
4. **Cómo funciona** — cuatro pasos, del grupo al historial.
5. **El organizador** — "¿Sos el que siempre termina organizando?".
6. **100 Capitanes Fundadores** — beneficios y formulario.
7. **Comunidad** — banda de números, oculta hasta tener datos reales.
8. **Cierre** — CTA final.
9. **Preguntas**.

Todos los CTA apuntan a `#capitanes` y llevan `data-cta` para poder medir cuál
convierte mejor.

---

## 1. Dónde caen los leads

Hoy el formulario envía a **Formspree** (plan gratuito: 50 envíos por mes). Es
suficiente para probar, pero **se queda corto apenas empiece la campaña**: los
envíos que exceden el límite se pierden.

La configuración vive en las primeras líneas de `script.js`:

```js
var LEADS_ENDPOINT = '';                                  // ← Apps Script (vacío por ahora)
var FORMSPREE_ENDPOINT = 'https://formspree.io/f/mnpappnn';
```

Cuando `LEADS_ENDPOINT` tenga valor, los leads van a la planilla y Formspree
queda **solo como respaldo**: se usa si Apps Script falla, para no perder el lead.

### Conectar Google Sheets (recomendado)

**a)** Creá una planilla nueva en Google Sheets.

**b)** Andá a **Extensiones → Apps Script** y reemplazá todo el contenido por:

```js
const SHEET_NAME = 'Leads';
const AVISAR_A = 'hola@fulbito.tech'; // dejalo en '' si no querés el mail

const COLUMNAS = [
  'fecha', 'nombre', 'contacto', 'ciudad', 'organiza', 'integrantes',
  'frecuencia', 'modalidad', 'tipo', 'score', 'segmento',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'referrer', 'pagina'
];

function doPost(e) {
  const lead = JSON.parse(e.postData.contents);
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = libro.getSheetByName(SHEET_NAME) || libro.insertSheet(SHEET_NAME);

  if (hoja.getLastRow() === 0) hoja.appendRow(COLUMNAS);
  hoja.appendRow(COLUMNAS.map(function (c) { return lead[c] || ''; }));

  if (AVISAR_A) {
    MailApp.sendEmail(
      AVISAR_A,
      'Fulbito · lead ' + lead.segmento + ' (' + lead.score + ') — ' + lead.nombre,
      COLUMNAS.map(function (c) { return c + ': ' + (lead[c] || ''); }).join('\n')
    );
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**c)** **Implementar → Nueva implementación → Aplicación web**, con:

| Campo | Valor |
| --- | --- |
| Ejecutar como | Yo (tu cuenta) |
| Quién tiene acceso | **Cualquier persona** |

La primera vez te va a pedir autorizar los permisos. Es normal: el script
escribe en *tu* planilla y manda mail desde *tu* cuenta.

**d)** Copiá la URL que termina en `/exec` y pegala en `LEADS_ENDPOINT`. Un
commit y queda desplegado.

> **Sobre "Cualquier persona":** es obligatorio para que la landing pueda
> escribir sin login. Significa que la URL es pública y alguien que la encuentre
> podría mandar filas basura. El formulario ya tiene un campo trampa que filtra
> bots comunes, pero no es una defensa fuerte. Si algún día aparece basura, el
> paso siguiente es validar un token compartido dentro de `doPost`.

---

## 2. Analítica

No hay dependencias ni scripts de terceros. `script.js` incluye una capa mínima
que empuja cada evento a `window.dataLayer` y, si en algún momento se carga GA4
(`gtag`) o un tag manager, los eventos viajan solos sin tocar la página.

| Evento | Cuándo se dispara |
| --- | --- |
| `landing_view` | al cargar la página |
| `founder_cta_click` | clic en cualquier CTA (con `ubicacion`: hero, header, organizador, cierre, sticky) |
| `waitlist_started` | primera interacción con el formulario |
| `organizer_yes` / `organizer_no` | al responder "¿Organizás vos el grupo?" |
| `waitlist_completed` | envío exitoso (con `segmento` y `score`) |
| `founder_qualified` | envío de un lead segmento A |

Para conectar GA4 alcanza con agregar su snippet en el `<head>`: los eventos ya
están instrumentados.

### UTM

Los parámetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y
`utm_term` se capturan al entrar, se guardan en `sessionStorage` y **viajan con
cada lead**. En la planilla vas a ver, capitán por capitán, de qué campaña vino.

Ejemplo de link para un reel:

```
https://www.fulbito.tech/?utm_source=instagram&utm_medium=reel&utm_campaign=capitanes&utm_content=video-lista
```

---

## 3. Lead scoring

Se calcula en el navegador y viaja con el lead. **No se le muestra nunca al
visitante**: sirve para saber a quién llamar primero.

| Condición | Puntos |
| --- | --- |
| Organiza el grupo | +30 (o +15 si lo comparte) |
| Grupo de más de 20 integrantes | +20 |
| Juegan una vez por semana o más | +20 |
| Juegan torneos (o torneos y picados) | +10 |
| Grupo de 10 integrantes o más | +10 |

Máximo 90 puntos. El segmento se deriva del score:

- **A — Capitán estratégico:** 60 o más.
- **B — Capitán potencial:** entre 30 y 59.
- **C — Jugador:** menos de 30, o respondió que no organiza.

Quien responde que no organiza ve un solo paso y un mensaje distinto al final:
lo invitamos a pasarle el link a quien sí organiza su grupo.

---

## 4. Contador de Capitanes

La banda de números de la sección Comunidad lee `data/comunidad.json`:

```json
{ "capitanes": null, "grupos": null, "jugadores": null }
```

Mientras los valores estén en `null`, **la banda no se muestra**: preferimos no
mostrar nada antes que inventar cifras. Cuando tengas números reales, cambialos
por enteros y la sección aparece sola:

```json
{ "capitanes": 37, "grupos": 37, "jugadores": 840 }
```

Para que el conteo sea automático hace falta que la planilla lo exponga: es un
`doGet` en el mismo Apps Script que devuelva la cantidad de filas. Queda
pendiente y no bloquea nada.

---

## 5. Publicar en GitHub Pages

En **Settings → Pages**, *Source: **GitHub Actions***. El workflow
`.github/workflows/deploy.yml` publica la raíz del repo en cada push a `main`.

El **Custom domain** hay que cargarlo a mano en esa misma pantalla
(`www.fulbito.tech`): con deploys por Actions, el archivo `CNAME` solo no
alcanza.

### DNS

| Tipo | Nombre | Valor |
| --- | --- | --- |
| `CNAME` | `www` | `maujpok.github.io` |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |

El correo del dominio va por ImprovMX (`MX` y `SPF` en el apex) hacia una casilla
de Gmail. Los registros de `send.fulbito.tech` son de Resend y no se tocan.

---

## Desarrollo local

No hay build ni dependencias. Las rutas son absolutas, así que hay que servir la
carpeta (abrir `index.html` con `file://` no funciona):

```bash
npx http-server -p 8080 .
# o
python3 -m http.server 8080
```

---

## Qué falta / limitaciones conocidas

- **Contador automático de capitanes:** necesita un `doGet` en Apps Script.
- **Formspree se queda corto** si sigue siendo el destino principal: 50 envíos
  por mes.
- **El endpoint de Apps Script es público** (ver la nota de la sección 1).
- **No hay analítica de terceros conectada**: los eventos existen y esperan en
  `dataLayer`.

## Cuando la app salga

1. Reemplazar las insignias "Próximamente en…" del pie por los enlaces reales.
2. Cambiar el CTA de Capitanes por uno de descarga.
3. Actualizar `availability` en el JSON-LD del `<head>`, de
   `https://schema.org/PreOrder` a `https://schema.org/InStock`.

---

## Licencias

- Código del sitio: propiedad de Fulbito.
- Tipografía Manrope: SIL Open Font License 1.1 — ver `assets/fonts/OFL.txt`.
- Fotos: las mismas del onboarding de la app.
