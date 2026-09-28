/** Todas las medidas en milímetros. */
export interface Plantilla {
  medio: 'hoja' | 'rollo'
  papel: [number, number] // solo hoja
  w: number
  h: number
  cols: number
  filas: number // solo hoja
  top: number
  left: number
  gapX: number
  gapY: number
}

export interface Preset { id: string; grupo: string; nombre: string; p: Plantilla }

const CARTA: [number, number] = [215.9, 279.4]
const OFICIO: [number, number] = [215.9, 330.2]
const A4: [number, number] = [210, 297]

const hoja = (papel: [number, number], w: number, h: number, cols: number, filas: number, top: number, left: number, gapX: number, gapY = 0): Plantilla =>
  ({ medio: 'hoja', papel, w, h, cols, filas, top, left, gapX, gapY })
const rollo = (w: number, h: number, cols = 1, gapX = 0, left = 0): Plantilla =>
  ({ medio: 'rollo', papel: CARTA, w, h, cols, filas: 1, top: 0, left, gapX, gapY: 0 })

export const PRESETS: Preset[] = [
  // Hojas carta (impresora láser o de tinta)
  { id: 'c5160', grupo: 'Hoja carta · láser / tinta', nombre: '30 por hoja · 66.7×25.4 mm (Avery 5160)', p: hoja(CARTA, 66.7, 25.4, 3, 10, 12.7, 4.8, 3.2) },
  { id: 'c5161', grupo: 'Hoja carta · láser / tinta', nombre: '20 por hoja · 101.6×25.4 mm (Avery 5161)', p: hoja(CARTA, 101.6, 25.4, 2, 10, 12.7, 4, 4.7) },
  { id: 'c5162', grupo: 'Hoja carta · láser / tinta', nombre: '14 por hoja · 101.6×33.9 mm (Avery 5162)', p: hoja(CARTA, 101.6, 33.9, 2, 7, 21.2, 4, 4.7) },
  { id: 'c5163', grupo: 'Hoja carta · láser / tinta', nombre: '10 por hoja · 101.6×50.8 mm (Avery 5163)', p: hoja(CARTA, 101.6, 50.8, 2, 5, 12.7, 4, 4.7) },
  { id: 'c5164', grupo: 'Hoja carta · láser / tinta', nombre: '6 por hoja · 101.6×84.7 mm (Avery 5164)', p: hoja(CARTA, 101.6, 84.7, 2, 3, 12.7, 4, 4.7) },
  { id: 'c5167', grupo: 'Hoja carta · láser / tinta', nombre: '80 por hoja · 44.5×12.7 mm (Avery 5167)', p: hoja(CARTA, 44.5, 12.7, 4, 20, 12.7, 7.6, 7.6) },
  { id: 'c5195', grupo: 'Hoja carta · láser / tinta', nombre: '60 por hoja · 44.5×16.9 mm (Avery 5195)', p: hoja(CARTA, 44.5, 16.9, 4, 15, 15.5, 7.6, 7.6) },
  { id: 'c4x10', grupo: 'Hoja carta · láser / tinta', nombre: '40 por hoja · 50.8×25.4 mm (4×10)', p: hoja(CARTA, 50.8, 25.4, 4, 10, 12.7, 6.4, 0) },
  { id: 'c-entera', grupo: 'Hoja carta · láser / tinta', nombre: 'Hoja completa · 1 etiqueta', p: hoja(CARTA, 215.9, 279.4, 1, 1, 0, 0, 0) },
  // Oficio
  { id: 'o3x11', grupo: 'Hoja oficio · láser / tinta', nombre: '33 por hoja · 66.7×25.4 mm (3×11)', p: hoja(OFICIO, 66.7, 25.4, 3, 11, 25.4, 4.8, 3.2, 1.5) },
  { id: 'o2x6', grupo: 'Hoja oficio · láser / tinta', nombre: '12 por hoja · 101.6×50.8 mm (2×6)', p: hoja(OFICIO, 101.6, 50.8, 2, 6, 12.7, 4, 4.7) },
  // A4
  { id: 'a7160', grupo: 'Hoja A4 · láser / tinta', nombre: '21 por hoja · 63.5×38.1 mm (L7160)', p: hoja(A4, 63.5, 38.1, 3, 7, 15.1, 7.2, 2.5) },
  { id: 'a7159', grupo: 'Hoja A4 · láser / tinta', nombre: '24 por hoja · 63.5×33.9 mm (L7159)', p: hoja(A4, 63.5, 33.9, 3, 8, 12.9, 7.2, 2.5) },
  { id: 'a3x8', grupo: 'Hoja A4 · láser / tinta', nombre: '24 por hoja · 70×37 mm (sin márgenes)', p: hoja(A4, 70, 37, 3, 8, 0.5, 0, 0) },
  { id: 'a7651', grupo: 'Hoja A4 · láser / tinta', nombre: '65 por hoja · 38.1×21.2 mm (L7651)', p: hoja(A4, 38.1, 21.2, 5, 13, 10.7, 4.7, 2.5) },
  { id: 'a7163', grupo: 'Hoja A4 · láser / tinta', nombre: '14 por hoja · 99.1×38.1 mm (L7163)', p: hoja(A4, 99.1, 38.1, 2, 7, 15.1, 4.7, 2.5) },
  // Térmicas (Zebra, TSC, Xprinter, 3nStar, Godex, Honeywell…)
  { id: 'r5025', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '50×25 mm', p: rollo(50, 25) },
  { id: 'r4030', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '40×30 mm', p: rollo(40, 30) },
  { id: 'r4025', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '40×25 mm', p: rollo(40, 25) },
  { id: 'r3020', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '30×20 mm', p: rollo(30, 20) },
  { id: 'r5030', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '50×30 mm', p: rollo(50, 30) },
  { id: 'r6040', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '60×40 mm', p: rollo(60, 40) },
  { id: 'r7050', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '70×50 mm', p: rollo(70, 50) },
  { id: 'r10050', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '100×50 mm', p: rollo(100, 50) },
  { id: 'r100150', grupo: 'Rollo térmico · Zebra, TSC, Xprinter, 3nStar…', nombre: '100×150 mm (guía de envío)', p: rollo(100, 150) },
  { id: 'r2x3325', grupo: 'Rollo térmico · 2 o 3 por fila', nombre: '2 por fila · 33×25 mm (rollo 70 mm)', p: rollo(33, 25, 2, 2, 1) },
  { id: 'r2x4025', grupo: 'Rollo térmico · 2 o 3 por fila', nombre: '2 por fila · 40×25 mm (rollo 84 mm)', p: rollo(40, 25, 2, 2, 1) },
  { id: 'r3x3020', grupo: 'Rollo térmico · 2 o 3 por fila', nombre: '3 por fila · 30×20 mm (rollo 100 mm)', p: rollo(30, 20, 3, 3, 2) },
  { id: 'r3x2515', grupo: 'Rollo térmico · 2 o 3 por fila', nombre: '3 por fila · 25×15 mm (joyería/pequeñas)', p: rollo(25, 15, 3, 2, 1) },
  // Brother QL / Dymo
  { id: 'b6229', grupo: 'Brother QL · Dymo LabelWriter', nombre: 'Brother DK-11209 · 62×29 mm', p: rollo(62, 29) },
  { id: 'b62100', grupo: 'Brother QL · Dymo LabelWriter', nombre: 'Brother DK-11202 · 62×100 mm', p: rollo(62, 100) },
  { id: 'b2990', grupo: 'Brother QL · Dymo LabelWriter', nombre: 'Brother DK-11201 · 29×90 mm', p: rollo(90, 29) },
  { id: 'd8928', grupo: 'Brother QL · Dymo LabelWriter', nombre: 'Dymo 99010 · 89×28 mm', p: rollo(89, 28) },
  { id: 'd5425', grupo: 'Brother QL · Dymo LabelWriter', nombre: 'Dymo 11352 · 54×25 mm', p: rollo(54, 25) },
  { id: 'd5732', grupo: 'Brother QL · Dymo LabelWriter', nombre: 'Dymo 11354 · 57×32 mm', p: rollo(57, 32) },
]

export const PAPELES: { nombre: string; tam: [number, number] }[] = [
  { nombre: 'Carta (216×279 mm)', tam: CARTA },
  { nombre: 'Oficio (216×330 mm)', tam: OFICIO },
  { nombre: 'A4 (210×297 mm)', tam: A4 },
]

/** Tamaño de la página que se envía a la impresora. */
export function tamPagina(p: Plantilla): [number, number] {
  if (p.medio === 'hoja') return p.papel
  return [+(p.left * 2 + p.cols * p.w + (p.cols - 1) * p.gapX).toFixed(2), p.h]
}

export const porPagina = (p: Plantilla) => p.cols * (p.medio === 'hoja' ? p.filas : 1)

/** Cuántas columnas/filas caben con las medidas actuales (para avisar si algo se sale del papel). */
export function seSale(p: Plantilla) {
  if (p.medio !== 'hoja') return false
  const ancho = p.left + p.cols * p.w + (p.cols - 1) * p.gapX
  const alto = p.top + p.filas * p.h + (p.filas - 1) * p.gapY
  return ancho > p.papel[0] + 0.5 || alto > p.papel[1] + 0.5
}
