export type Campo = 'descripcion' | 'precio' | 'ubicacion' | 'stock'
export type Mostrar = Campo | 'sku' | 'negocio' | 'logo'

export const CAMPOS: { id: Mostrar; nombre: string }[] = [
  { id: 'descripcion', nombre: 'Descripción' },
  { id: 'precio', nombre: 'Precio' },
  { id: 'ubicacion', nombre: 'Ubicación' },
  { id: 'stock', nombre: 'Stock' },
  { id: 'sku', nombre: 'Código en texto' },
  { id: 'negocio', nombre: 'Nombre del negocio' },
  { id: 'logo', nombre: 'Logo' },
]

export interface Producto {
  id: string
  sku: string
  descripcion: string
  precio: string
  ubicacion: string
  stock: string
  copias?: number // etiquetas sugeridas (desde Excel)
}

export const PRODUCTO_VACIO: Producto = { id: '', sku: '', descripcion: '', precio: '', ubicacion: '', stock: '' }

/** Convierte "1,250.50", "1.250,50", "45,50", "Q 8.00" → "1250.50", "1250.50", "45.50", "8.00". Devuelve '' si no hay número. */
export function normalizarNumero(texto: string) {
  let v = texto.replace(/[^\d.,-]/g, '')
  if (!/\d/.test(v)) return ''
  const coma = v.lastIndexOf(','), punto = v.lastIndexOf('.')
  if (coma > punto) {
    // "1,250" (miles) vs "45,50" / "1.250,50" (decimal con coma)
    v = punto === -1 && /^-?\d{1,3}(,\d{3})+$/.test(v) ? v.replace(/,/g, '') : v.replace(/\./g, '').replace(',', '.')
  } else {
    v = v.replace(/,/g, '')
  }
  return isNaN(Number(v)) ? '' : v
}

export function formatoPrecio(valor: string, moneda: string) {
  const n = normalizarNumero(valor)
  if (valor.trim() === '') return ''
  if (n === '') return `${moneda} ${valor.trim()}`
  valor = n
  return `${moneda} ${Number(valor).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
