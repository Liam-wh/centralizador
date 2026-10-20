# Centra · ESAM El Alto

Centralizador académico en Flask, Bootstrap 5.3.8 y Bootstrap Icons 1.13.1. Incluye los 11 enlaces proporcionados y el logo original, con colores azul marino y amarillo.

## Funciones

- Diseño adaptable a computadora, tablet y celular.
- Buscador instantáneo por nombre, área, descripción, servicio y palabras relacionadas; admite búsquedas sin tildes y varias palabras.
- Cinco áreas: Académico, Participantes, Documentación, Administración y Plataformas.
- Botón **Abrir recurso** en cada tarjeta: abre el enlace original en otra pestaña (el navegador puede elegir una ventana según su configuración).
- Botón de tres puntos: ventana de detalles con enlace para copiar y botón para abrir.
- Favoritos y accesos recientes guardados en el navegador. No se sincronizan entre dispositivos; siguen disponibles tras recargar si el almacenamiento local está habilitado.
- Atajo `/` para buscar. `Esc` limpia la búsqueda cuando tiene el foco, o cierra la ventana de detalles.
- Navegación por teclado y soporte de movimiento reducido.
- Bootstrap, iconos y logo incluidos localmente: sin dependencia de un CDN para mostrar la interfaz.

Las ventanas son detalles del acceso. El documento real se abre directamente en Google/ESAM, en otra pestaña. El buscador filtra los accesos del directorio, no el contenido interno de los documentos. Google conserva sus permisos: cada persona debe ingresar con una cuenta autorizada. Esta app no inicia sesión en Google ni cambia permisos. El directorio no incluye autenticación propia ni base de datos.

## Archivos

| Archivo o carpeta | Uso |
| --- | --- |
| `app.py` | Servidor Flask y rutas locales |
| `links.json` | Los 11 enlaces y sus metadatos editables |
| `templates/index.html` | Página principal y ventana de detalles |
| `public/assets/styles.css` | Diseño, colores y adaptación móvil |
| `public/assets/app.js` | Buscador, filtros, favoritos, recientes y detalles |
| `public/assets/logo-esam.png` | Logo original proporcionado |
| `public/assets/favicon.svg` | Icono de Centra |
| `public/vendor/` | Bootstrap, iconos, fuentes y licencias MIT |
| `requirements.txt` | Dependencia Python |
| `.python-version` | Versión Python 3.12 |
| `vercel.json` | Detección Flask y cabeceras |
| `.gitignore` | Exclusiones para Git |

## 1. Ejecutar en Windows con VS Code y Git Bash

Instala Python 3.12 y Git si todavía no los tienes. Descomprime el ZIP; encontrarás la carpeta `centra`. Abre esa carpeta en VS Code y una terminal **Git Bash**.

```bash
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
python app.py
```

Si Windows no reconoce `python`, utiliza `py -3.12 -m venv .venv` para crear el entorno y luego actívalo. Una vez activado, utiliza `python` para los demás comandos.

Abre http://127.0.0.1:5000 en el navegador. Mantén la terminal abierta. Detén el servidor con `Ctrl+C`.

En PowerShell, puedes evitar cambiar la política de ejecución:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

En macOS/Linux, la activación es `source .venv/bin/activate`.

## 2. Subir a GitHub

Crea un repositorio llamado `centra` en tu cuenta, sin generar README ni .gitignore adicionales. Desde la terminal dentro de la carpeta `centra`:

```bash
git init
git add .
git commit -m "Crear centralizador de enlaces ESAM"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/centra.git
git push -u origin main
```

Reemplaza `TU_USUARIO` por tu usuario real. Los archivos `app.py`, `requirements.txt` y `vercel.json` deben quedar en la raíz del repositorio. No subas el ZIP ni la carpeta `.venv`.

También puedes subir los archivos desde GitHub con **Add file → Upload files**. Asegúrate de incluir las carpetas `templates` y `public` completas.

## 3. Desplegar en Vercel

1. Inicia sesión en https://vercel.com e importa el repositorio desde **Add New → Project**.
2. Selecciona `centra`.
3. Usa la carpeta raíz que contiene `app.py`. Si subiste una carpeta `centra` dentro de otro repositorio, selecciona esa carpeta como **Root Directory**.
4. Deja que Vercel detecte **Flask**. Conserva Build Command, Install Command y Output Directory con sus valores predeterminados; no establezcas un directorio `dist`.
5. Pulsa **Deploy**. Este proyecto no necesita variables de entorno.
6. Abre el dominio `*.vercel.app` que Vercel asigne y comprueba el directorio.

Vercel reconoce la instancia `app` en `app.py`. Los recursos están en `public/` para servirlos desde el CDN de Vercel; Flask dispone de rutas equivalentes para ejecutarlos localmente.

## 4. Conectar esam.once.lat

1. Dentro del proyecto de Vercel, abre **Settings → Domains**.
2. Añade `esam.once.lat`.
3. En el proveedor DNS donde administras `once.lat`, configura el registro que indique Vercel:

| Campo | Valor |
| --- | --- |
| Tipo | CNAME, si es lo solicitado por Vercel |
| Nombre / Host | `esam` (algunos proveedores piden `esam.once.lat`) |
| Destino / Valor | Copia exactamente el destino que muestra Vercel para este proyecto |
| TTL | Automático o predeterminado |

4. Si Vercel solicita un TXT de verificación, añade también el registro exacto indicado.
5. Evita registros A, AAAA o CNAME que entren en conflicto en el mismo subdominio `esam`. Conserva los registros de los demás servicios del dominio.
6. Espera la propagación hasta que Vercel muestre **Valid Configuration** y el certificado HTTPS esté listo.
7. Abre https://esam.once.lat.

El dominio no queda conectado por descargar este proyecto: requiere los pasos de Vercel y DNS anteriores.

## 5. Cambiar o agregar enlaces

Edita `links.json`. Ejemplo de un registro (sustituye URL e identificador por los tuyos):

```json
{
  "id": "recurso-nuevo",
  "title": "Nombre del recurso",
  "category": "Académico",
  "icon": "calendar3",
  "service": "Google Sheets",
  "description": "Descripción breve del recurso.",
  "keywords": "calendario horarios agenda",
  "url": "https://docs.google.com/…"
}
```

Usa un `id` único y una de las cinco categorías existentes. El nombre del icono corresponde a Bootstrap Icons, sin el prefijo `bi-`. No dejes comas después del último elemento. Para crear un área nueva, añádela también a `CATEGORIES` en `app.py`. Reinicia Flask después de editar el JSON en local.

Los dos accesos rápidos del panel azul están en `templates/index.html`; si cambias la URL del Portal o ESAM central, actualízalos allí también.

Para publicar una modificación:

```bash
git add .
git commit -m "Actualizar accesos"
git push
```

Si el repositorio está conectado, Vercel desplegará el cambio automáticamente.

## Comprobaciones y problemas comunes

- `/health` debe devolver `{"status":"ok","resources":11}` mientras el catálogo tenga 11 entradas.
- Un enlace solicita acceso: inicia sesión con la cuenta correcta o pide acceso al propietario del archivo. No es un error de Centra.
- Si `authuser=0` de ESAM central elige otra cuenta de Google, selecciona la cuenta institucional en Google.
- No hay coincidencias: elimina la búsqueda o pulsa **Ver todos los accesos** para quitar los filtros.
- Los favoritos desaparecen: revisa si usas navegación privada o limpiaste el almacenamiento del navegador.
- Copiar no funciona: en producción usa HTTPS. Como alternativa, la ventana selecciona la URL para copiarla manualmente.
- Vercel muestra 404: comprueba la carpeta raíz y que `app.py` esté en ella.
- Faltan estilos o iconos: confirma que subiste `public/` con sus subcarpetas y fuentes.

## Documentación oficial

Consultada para preparar la configuración:

- Flask en Vercel: https://vercel.com/docs/frameworks/backend/flask
- Dominio personalizado: https://vercel.com/docs/domains/working-with-domains/add-a-domain
- Bootstrap: https://getbootstrap.com/docs/5.3/getting-started/introduction/
- Bootstrap Icons: https://icons.getbootstrap.com/

La entrega es un proyecto de código fuente para que lo despliegues en tus cuentas. Los documentos privados de los enlaces no se han leído ni validado con una cuenta de Google.
