import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

export type TipoCodigo = 'CODE128' | 'EAN13' | 'QR'

export const TIPOS: { id: TipoCodigo; nombre: string; ayuda: string }[] = [
  { id: 'CODE128', nombre: 'Barras · Code 128', ayuda: 'Letras y números. El más usado para códigos internos.' },
  { id: 'EAN13', nombre: 'Barras · EAN-13', ayuda: 'Solo 12 o 13 dígitos. Estándar de supermercado.' },
  { id: 'QR', nombre: 'Código QR', ayuda: 'Se lee con el celular. Puede llevar todos los datos.' },
]

/** Dígito verificador EAN-13 para 12 dígitos. */
export function digitoEan(d12: string) {
  const suma = d12.split('').reduce((s, d, i) => s + Number(d) * (i % 2 === 0 ? 1 : 3), 0)
  return String((10 - (suma % 10)) % 10)
}

/** SKU numérico de uso interno (prefijo 2) con verificador: válido para EAN-13 y Code 128. */
export function generarSku() {
  let base = '2'
  for (let i = 0; i < 11; i++) base += Math.floor(Math.random() * 10)
  return base + digitoEan(base)
}

/** svg: se estira al contenedor. modulos: ancho del código en barras mínimas (para ajustarlo a los puntos de la impresora). */
export interface Codigo { svg: string; modulos: number }

/** Código de barras, o null si el valor no es válido para el formato. */
export function barrasSvg(valor: string, formato: 'CODE128' | 'EAN13'): Codigo | null {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  let valido = true
  try {
    JsBarcode(svg, valor, {
      format: formato,
      displayValue: false,
      margin: 0,
      height: 60,
      width: 2,
      flat: true,
      valid: (v: boolean) => { valido = v },
    })
  } catch {
    return null
  }
  if (!valido) return null
  const w = parseFloat(svg.getAttribute('width') || '0')
  const h = parseFloat(svg.getAttribute('height') || '0')
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.setAttribute('shape-rendering', 'crispEdges')
  return { svg: svg.outerHTML, modulos: w / 2 } // width: 2 unidades por módulo
}

/** SVG de QR generado de forma síncrona. */
export function qrSvg(texto: string): Codigo | null {
  if (!texto) return null
  try {
    const { modules } = QRCode.create(texto, { errorCorrectionLevel: 'M' })
    const n = modules.size
    let d = ''
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        if (modules.get(y, x)) d += `M${x} ${y}h1v1h-1z`
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${d}" fill="#000"/></svg>`, modulos: n }
  } catch {
    return null
  }
}
