import { normalizarNumero, type Producto } from './types'

type Fila = Omit<Producto, 'id'> & { copias?: number }

// Nombres de columna aceptados (sin acentos ni mayúsculas)
const COLUMNAS: Record<keyof Fila, string[]> = {
  sku: ['sku', 'codigo', 'cod', 'codigo de barras', 'barcode', 'ean', 'upc', 'clave', 'referencia', 'ref'],
  descripcion: ['descripcion', 'producto', 'nombre', 'articulo', 'detalle', 'desc'],
  precio: ['precio', 'precio venta', 'precio de venta', 'pvp', 'valor', 'price'],
  ubicacion: ['ubicacion', 'ubic', 'lugar', 'estante', 'pasillo', 'bodega', 'location'],
  stock: ['stock', 'existencia', 'existencias', 'inventario', 'disponible'],
  copias: ['etiquetas', 'copias', 'cantidad', 'cant', 'imprimir', 'qty'],
}

const normal = (s: unknown) => String(s ?? '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[_.:#]/g, ' ').replace(/\s+/g, ' ').trim()

export async function leerExcel(archivo: File): Promise<{ filas: Fila[]; aviso: string }> {
  const XLSX = await import('xlsx') // se carga solo cuando se usa
  const libro = XLSX.read(await archivo.arrayBuffer(), { type: 'array' })
  const hoja = libro.Sheets[libro.SheetNames[0]]
  // raw: true para recibir los números completos (con raw: false Excel entrega "7.50103E+12" en códigos largos)
  const datos = XLSX.utils.sheet_to_json<unknown[]>(hoja, { header: 1, raw: true, defval: '' })
    .filter((f) => f.some((c) => String(c).trim() !== ''))
  if (!datos.length) return { filas: [], aviso: 'El archivo está vacío.' }

  // Buscar la fila de encabezados en las primeras 10 filas
  let fila0 = -1
  let mapa: Partial<Record<keyof Fila, number>> = {}
  for (let i = 0; i < Math.min(10, datos.length); i++) {
    const m: Partial<Record<keyof Fila, number>> = {}
    datos[i].forEach((c, j) => {
      const n = normal(c)
      for (const [campo, nombres] of Object.entries(COLUMNAS) as [keyof Fila, string[]][])
        if (m[campo] === undefined && nombres.includes(n)) m[campo] = j
    })
    if (m.sku !== undefined) { fila0 = i; mapa = m; break }
  }

  let aviso = ''
  if (fila0 < 0) {
    // Sin encabezados reconocibles: columnas en orden A=código, B=descripción, C=precio, D=ubicación, E=stock, F=etiquetas
    mapa = { sku: 0, descripcion: 1, precio: 2, ubicacion: 3, stock: 4, copias: 5 }
    aviso = 'No encontré una columna "Código"; usé el orden A=código, B=descripción, C=precio, D=ubicación, E=stock, F=etiquetas.'
  }

  const celda = (f: unknown[], campo: keyof Fila) => {
    if (mapa[campo] === undefined) return ''
    const v = f[mapa[campo]!]
    if (typeof v === 'number') return Number.isInteger(v) ? v.toFixed(0) : String(v)
    return String(v ?? '').trim()
  }
  const numero = normalizarNumero

  const filas = datos.slice(fila0 + 1).map((f) => {
    const copias = parseInt(celda(f, 'copias'))
    return {
      sku: celda(f, 'sku'),
      descripcion: celda(f, 'descripcion'),
      precio: numero(celda(f, 'precio')),
      ubicacion: celda(f, 'ubicacion'),
      stock: numero(celda(f, 'stock')),
      copias: isNaN(copias) ? undefined : Math.max(0, Math.min(2000, copias)),
    }
  }).filter((f) => f.sku)

  return { filas, aviso }
}

export async function descargarPlantilla() {
  const XLSX = await import('xlsx')
  const hoja = XLSX.utils.aoa_to_sheet([
    ['Código', 'Descripción', 'Precio', 'Ubicación', 'Stock', 'Etiquetas'],
    ['7501031311309', 'Coca-Cola 600 ml', 8, 'Pasillo 1 · Refri', 24, 24],
    ['CAB-USBC-01', 'Cable USB-C 1 m', 45, 'Vitrina A', 10, 5],
  ])
  hoja['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 8 }, { wch: 10 }]
  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, 'Productos')
  XLSX.writeFile(libro, 'plantilla-etiquetas.xlsx')
}
