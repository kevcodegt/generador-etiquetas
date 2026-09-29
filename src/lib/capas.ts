/** Elementos que se pueden mover en el diseño libre. Posición y tamaño en % de la etiqueta. */
export type Elemento = 'logo' | 'negocio' | 'descripcion' | 'codigo' | 'sku' | 'precio' | 'ubicacion' | 'stock'

export interface Capa {
  x: number
  y: number
  w: number
  h: number
  fs: number // tamaño de letra en % del alto de la etiqueta
  align: 'left' | 'center' | 'right'
  bold: boolean
}

export type Capas = Record<Elemento, Capa>

export const NOMBRES: Record<Elemento, string> = {
  logo: 'Logo',
  negocio: 'Negocio',
  descripcion: 'Descripción',
  codigo: 'Código',
  sku: 'Código en texto',
  precio: 'Precio',
  ubicacion: 'Ubicación',
  stock: 'Stock',
}

const c = (x: number, y: number, w: number, h: number, fs = 9, align: Capa['align'] = 'left', bold = false): Capa =>
  ({ x, y, w, h, fs, align, bold })

export const CAPAS_BARRAS: Capas = {
  negocio: c(3, 3, 72, 12, 8, 'left', true),
  logo: c(77, 3, 20, 14),
  descripcion: c(3, 15, 94, 17, 10.5, 'left', true),
  codigo: c(5, 33, 90, 35),
  sku: c(3, 68, 94, 11, 7.5, 'center'),
  precio: c(3, 80, 50, 18, 14, 'left', true),
  ubicacion: c(53, 80, 44, 9, 7, 'right'),
  stock: c(53, 89, 44, 9, 7, 'right'),
}

export const CAPAS_QR: Capas = {
  codigo: c(3, 6, 40, 88),
  negocio: c(47, 5, 32, 12, 7.5, 'left', true),
  logo: c(80, 4, 17, 16),
  descripcion: c(47, 19, 50, 26, 9.5, 'left', true),
  precio: c(47, 46, 50, 20, 14, 'left', true),
  ubicacion: c(47, 67, 50, 10, 7),
  stock: c(47, 77, 50, 9, 7),
  sku: c(47, 87, 50, 10, 7),
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
