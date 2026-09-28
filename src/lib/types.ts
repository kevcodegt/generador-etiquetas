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

export function formatoPrecio(valor: string, moneda: string) {
  if (valor.trim() === '' || isNaN(Number(valor))) return valor.trim()
  return `${moneda} ${Number(valor).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
