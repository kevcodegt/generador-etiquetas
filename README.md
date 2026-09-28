# Etiquetador

Generador gratuito de etiquetas con **código de barras (Code 128, EAN-13) o QR**, descripción, precio, ubicación, stock y logo — listo para imprimir en impresoras térmicas o en hojas adhesivas.

**Úsalo en línea:** https://generador-etiquetas-hazel.vercel.app

## Características

- Sin registro y sin servidor: todo se genera en tu navegador, tus productos no se guardan ni se envían.
- Campos activables: descripción, precio, ubicación, stock, código en texto, nombre del negocio y logo.
- Carga masiva desde **Excel** (.xlsx, .xls, .csv) con plantilla descargable. La columna "Etiquetas" define cuántas imprimir por producto.
- Pregunta cuántas etiquetas imprimir antes de mandar a la impresora; permite saltar etiquetas ya usadas de una hoja.
- Perfiles de impresora con guía de configuración: **TSC TE200/TE210/TE300/TE310, TTP-244, DA210, Zebra, Xprinter, 3nStar, Godex, Honeywell, Brother QL, Dymo** e impresoras de tinta/láser.
- Tamaños listos para rollos térmicos (1, 2 y 3 por fila), Brother DK, Dymo y hojas Avery / serie L (carta, oficio y A4), o medidas personalizadas con calibración.
- Barras y QR ajustados a puntos enteros del cabezal (203 / 300 / 600 dpi) para que se escaneen bien.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # genera dist/
```

Hecho con React + Vite + TypeScript, [JsBarcode](https://github.com/lindell/JsBarcode), [node-qrcode](https://github.com/soldair/node-qrcode) y [SheetJS](https://sheetjs.com).

## Contribuir

¿Tu impresora o tamaño de etiqueta no está en la lista? Abre un *issue* o un *pull request* agregándolo en `src/lib/impresoras.ts` o `src/lib/formatos.ts`.

## Licencia

[MIT](LICENSE) © 2026 KevCodeGT
