export interface Impresora {
  id: string
  nombre: string
  marca: string
  medio: 'hoja' | 'rollo'
  dpi: number
  anchoMax?: number // mm de ancho de etiqueta que acepta
  preset: string // tamaño sugerido (id de PRESETS)
  consejos: string[]
}

const DRIVER_TERMICA = (driver: string) => [
  `Instala el driver de Windows/Mac del fabricante (${driver}). Sin driver el navegador no puede imprimir en ella.`,
  'En Preferencias de impresión del driver crea un papel (Stock / Tamaño de página) con el ancho y alto EXACTO de tu etiqueta, y elige tipo de medio "Etiquetas con espacio (gap)".',
  'Si la impresora salta etiquetas o se corta a la mitad, calibra el sensor de espacio (desde la utilidad del fabricante o con el botón FEED según el manual).',
  'En la ventana de impresión: Tamaño de papel = el que creaste, Márgenes = Ninguno, Escala = 100% y desmarca "Encabezados y pies de página".',
  'Si el código sale muy claro o se lee mal, sube la Oscuridad (Darkness) en el driver.',
]

export const IMPRESORAS: Impresora[] = [
  { id: 'tsc-te200', marca: 'TSC', nombre: 'TSC TE200 / TE210', medio: 'rollo', dpi: 203, anchoMax: 108, preset: 'r5025', consejos: DRIVER_TERMICA('TSC TE200 · Seagull/BarTender driver, y TSC Console o Diagtool para calibrar') },
  { id: 'tsc-te300', marca: 'TSC', nombre: 'TSC TE300 / TE310', medio: 'rollo', dpi: 300, anchoMax: 108, preset: 'r5025', consejos: DRIVER_TERMICA('TSC TE310 · Seagull/BarTender driver') },
  { id: 'tsc-ttp244', marca: 'TSC', nombre: 'TSC TTP-244 Pro / TTP-244CE', medio: 'rollo', dpi: 203, anchoMax: 108, preset: 'r5025', consejos: DRIVER_TERMICA('TSC TTP-244 · Seagull driver') },
  { id: 'tsc-da210', marca: 'TSC', nombre: 'TSC DA210 / DA220', medio: 'rollo', dpi: 203, anchoMax: 108, preset: 'r5025', consejos: DRIVER_TERMICA('TSC DA210 · Seagull driver') },
  { id: 'zebra-4', marca: 'Zebra', nombre: 'Zebra ZD220 / ZD230 / GK420 / GC420', medio: 'rollo', dpi: 203, anchoMax: 104, preset: 'r5025', consejos: DRIVER_TERMICA('ZDesigner, desde zebra.com') },
  { id: 'zebra-2', marca: 'Zebra', nombre: 'Zebra ZD410 / ZD411 (2 pulgadas)', medio: 'rollo', dpi: 203, anchoMax: 56, preset: 'r5025', consejos: DRIVER_TERMICA('ZDesigner, desde zebra.com') },
  { id: 'xprinter-4', marca: 'Xprinter', nombre: 'Xprinter XP-420B / XP-470B / XP-DT425B', medio: 'rollo', dpi: 203, anchoMax: 108, preset: 'r5025', consejos: DRIVER_TERMICA('Xprinter label driver') },
  { id: 'xprinter-3', marca: 'Xprinter', nombre: 'Xprinter XP-365B / XP-360B', medio: 'rollo', dpi: 203, anchoMax: 80, preset: 'r5025', consejos: DRIVER_TERMICA('Xprinter label driver') },
  { id: '3nstar', marca: '3nStar', nombre: '3nStar LTT204 / LTT324', medio: 'rollo', dpi: 203, anchoMax: 108, preset: 'r5025', consejos: DRIVER_TERMICA('3nStar / Seagull driver') },
  { id: 'godex', marca: 'Godex', nombre: 'Godex G500 / RT200', medio: 'rollo', dpi: 203, anchoMax: 108, preset: 'r5025', consejos: DRIVER_TERMICA('GoDEX Seagull driver') },
  { id: 'honeywell', marca: 'Honeywell', nombre: 'Honeywell PC42t / PC42d', medio: 'rollo', dpi: 203, anchoMax: 104, preset: 'r5025', consejos: DRIVER_TERMICA('Honeywell / Intermec driver') },
  {
    id: 'brother-ql', marca: 'Brother', nombre: 'Brother QL-800 / QL-810W / QL-820NWB', medio: 'rollo', dpi: 300, anchoMax: 62, preset: 'b6229',
    consejos: [
      'Instala el driver de Brother QL e inserta un rollo DK.',
      'Elige en la app el mismo rollo DK que tienes puesto; en la ventana de impresión selecciona ese tamaño de papel.',
      'Márgenes = Ninguno, Escala = 100%, sin encabezados ni pies de página.',
      'Si imprimes con rollo continuo (DK-22205), ajusta el alto de la etiqueta en "Medidas exactas".',
    ],
  },
  {
    id: 'dymo', marca: 'Dymo', nombre: 'Dymo LabelWriter 450 / 550', medio: 'rollo', dpi: 300, anchoMax: 56, preset: 'd5425',
    consejos: [
      'Instala Dymo Connect / el driver de Dymo.',
      'Elige en la app el rollo que tienes (por ejemplo 11352 o 99010) y en la ventana de impresión el mismo tamaño de papel.',
      'Márgenes = Ninguno, Escala = 100%, sin encabezados ni pies de página.',
      'La LabelWriter 550 solo acepta rollos originales Dymo.',
    ],
  },
  {
    id: 'hoja', marca: 'Hojas', nombre: 'Impresora de tinta o láser (Epson, HP, Canon, Brother…)', medio: 'hoja', dpi: 600, preset: 'c5160',
    consejos: [
      'Compra hojas adhesivas y busca en la caja el modelo (Avery 5160, L7160…). Elige ese mismo en "Tamaño de etiqueta".',
      'Primero imprime en una hoja normal, ponla detrás de la hoja de etiquetas contra la luz y revisa que caiga en su lugar. Si sale corrida, usa la Calibración.',
      'En la ventana de impresión: Papel = Carta/A4 según tus hojas, Márgenes = Ninguno, Escala = 100% ("Tamaño real") y sin encabezados ni pies de página.',
      'En el driver elige tipo de papel "Etiquetas" o "Cartulina" para que no se atasque.',
    ],
  },
  {
    id: 'otra', marca: 'Otra', nombre: 'Otra impresora térmica de etiquetas', medio: 'rollo', dpi: 203, preset: 'r5025',
    consejos: DRIVER_TERMICA('el que trae tu impresora en su CD o página web'),
  },
]
