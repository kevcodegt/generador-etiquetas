import { useEffect, useMemo } from 'react'
import { barrasSvg, qrSvg, type TipoCodigo } from '../lib/codes'
import { formatoPrecio, type Mostrar, type Producto } from '../lib/types'

export interface Diseno {
  tipo: TipoCodigo
  qrDatos: boolean
  mostrar: Record<Mostrar, boolean>
  moneda: string
  negocio: string
  logo: string // data URL de la imagen, reducida
  logoTam: number // % del alto de la etiqueta
  logoBN: boolean // blanco y negro puro (mejor en térmicas)
  codigoTam: number // % del ancho máximo disponible para el código
  codigoAlto: number // % del alto disponible para las barras
  borde: boolean
}

export function textoQr(p: Producto, d: Diseno) {
  if (!d.qrDatos) return p.sku
  const l = [p.sku]
  if (d.mostrar.descripcion && p.descripcion) l.push(p.descripcion)
  if (d.mostrar.precio && p.precio) l.push(`Precio: ${formatoPrecio(p.precio, d.moneda)}`)
  if (d.mostrar.ubicacion && p.ubicacion) l.push(`Ubicación: ${p.ubicacion}`)
  if (d.mostrar.stock && p.stock) l.push(`Stock: ${p.stock}`)
  if (d.mostrar.negocio && d.negocio) l.push(d.negocio)
  return l.join('\n')
}

export function useCodigo(p: Producto, d: Diseno) {
  const qrTexto = d.tipo === 'QR' ? textoQr(p, d) : ''
  return useMemo(() => {
    if (!p.sku.trim()) return undefined
    return d.tipo === 'QR' ? qrSvg(qrTexto) : barrasSvg(p.sku.trim(), d.tipo)
  }, [p.sku, d.tipo, qrTexto])
}

/** Ajusta el tamaño del módulo a puntos enteros de la impresora (203/300/600 dpi) para que el lector lo lea bien. */
function aPuntos(disponible: number, modulos: number, dpi: number) {
  const punto = 25.4 / dpi
  const puntos = Math.max(1, Math.floor(disponible / modulos / punto + 1e-6))
  return { tam: puntos * punto * modulos, puntos, cabe: puntos * punto * modulos <= disponible + 0.01 }
}

export default function Etiqueta({ p, d, w, h, dpi, previa, alMedir }: {
  p: Producto; d: Diseno; w: number; h: number; dpi: number; previa?: boolean
  alMedir?: (m: { ancho: number; puntos: number } | null) => void
}) {
  const cod = useCodigo(p, d)
  const m = d.mostrar
  const precio = m.precio && p.precio ? formatoPrecio(p.precio, d.moneda) : ''
  const extras = [m.ubicacion && p.ubicacion ? `Ubic. ${p.ubicacion}` : '', m.stock && p.stock ? `Stock ${p.stock}` : '']
    .filter(Boolean).join(' · ')
  const negocio = m.negocio && d.negocio
  const desc = m.descripcion && p.descripcion
  const sku = m.sku && p.sku

  const fs = Math.max(1.4, Math.min(h * 0.105, w * 0.065)) // tamaño de letra en mm
  const logo = m.logo && d.logo
  const hayTexto = logo || negocio || desc || precio || extras || sku
  const apilado = d.tipo === 'QR' && h > w * 0.9

  // Espacio disponible para el código (descontando los rellenos definidos en CSS en em)
  let ajuste: ReturnType<typeof aPuntos> | null = null
  let tamCodigo: { width: string; height: string } | undefined
  if (cod) {
    if (d.tipo === 'QR') {
      const alto = h - fs * 0.7
      const disp = !hayTexto ? Math.min(alto, w - fs) : apilado ? Math.min(alto * 0.62, w - fs) : Math.min(alto, w * 0.55)
      ajuste = aPuntos(disp * (d.codigoTam ?? 100) / 100, cod.modulos, dpi)
      tamCodigo = { width: `${ajuste.tam}mm`, height: `${ajuste.tam}mm` }
    } else {
      ajuste = aPuntos((w - fs * 1.8) * (d.codigoTam ?? 100) / 100, cod.modulos, dpi)
      tamCodigo = { width: `${ajuste.tam}mm`, height: `${d.codigoAlto ?? 100}%` }
    }
  }

  const codigo = cod === undefined
    ? <div className="sin-codigo">Escribe un código</div>
    : cod === null
      ? <div className="invalido">{d.tipo === 'EAN13' ? 'EAN-13 necesita 12 o 13 dígitos válidos' : 'Código no válido'}</div>
      : <div className="svg" style={tamCodigo} dangerouslySetInnerHTML={{ __html: cod.svg }} />

  const estilo = { width: `${w}mm`, height: `${h}mm`, fontSize: `${fs}mm` }
  const clase = `etiqueta ${d.borde ? 'borde' : ''}`
  const imgLogo = logo && (
    <img className={`e-logo ${d.logoBN ? 'bn' : ''}`} src={d.logo} alt="" style={{ height: `${(h * d.logoTam) / 100}mm` }} />
  )
  // Módulo mínimo recomendado: ~0.19 mm en barras (2 puntos a 203 dpi) y ~0.3 mm en QR para lectores/celulares
  const modulo = ajuste && cod ? ajuste.tam / cod.modulos : 0
  const muyChico = ajuste && ajuste.cabe && modulo < (d.tipo === 'QR' ? 0.3 : 0.19)
  const medida = ajuste ? `${ajuste.tam.toFixed(1)}|${ajuste.puntos}` : ''
  useEffect(() => {
    if (!alMedir) return
    const [a, pt] = medida.split('|')
    alMedir(medida ? { ancho: Number(a), puntos: Number(pt) } : null)
  }, [medida, alMedir])
  const aviso = previa && ajuste && (!ajuste.cabe || muyChico) && (
    <div className="aviso-codigo no-print">
      {!ajuste.cabe
        ? `${d.tipo === 'QR' ? 'QR muy denso' : 'Código muy largo'} para esta etiqueta: usa una más grande o un código más corto`
        : `${d.tipo === 'QR' ? 'QR' : 'Barras'} muy pequeño (${modulo.toFixed(2)} mm por módulo): puede no escanear, súbele el tamaño`}
    </div>
  )

  // QR en etiquetas anchas: código a la izquierda y texto a la derecha. En etiquetas altas: apilado.
  if (d.tipo === 'QR') {
    return (
      <div className={`${clase} qr ${apilado ? 'apilado' : ''}`} style={estilo}>
        <div className="qr-code">{codigo}</div>
        {hayTexto && (
          <div className="qr-texto">
            {imgLogo}
            {negocio && <div className="e-negocio">{d.negocio}</div>}
            {desc && <div className="e-desc">{p.descripcion}</div>}
            {precio && <div className="e-precio">{precio}</div>}
            {extras && <div className="e-extra">{extras}</div>}
            {sku && <div className="e-sku">{p.sku}</div>}
          </div>
        )}
        {aviso}
      </div>
    )
  }

  return (
    <div className={`${clase} barras`} style={estilo}>
      {(logo || negocio || desc) && (
        <div className={`e-top ${logo && !negocio && !desc ? 'solo-logo' : ''}`}>
          {imgLogo}
          {(negocio || desc) && (
            <div className="e-top-texto">
              {negocio && <div className="e-negocio">{d.negocio}</div>}
              {desc && <div className="e-desc">{p.descripcion}</div>}
            </div>
          )}
        </div>
      )}
      <div className="e-code">{codigo}</div>
      {sku && <div className="e-sku">{p.sku}</div>}
      {(precio || extras) && (
        <div className="e-pie">
          {precio && <span className="e-precio">{precio}</span>}
          {extras && <span className="e-extra">{extras}</span>}
        </div>
      )}
      {aviso}
    </div>
  )
}
