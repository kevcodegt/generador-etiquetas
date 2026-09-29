import { useRef, type PointerEvent as PE } from 'react'
import { aPuntos, useCodigo, type Diseno } from './Etiqueta'
import { clamp, type Capa, type Elemento } from '../lib/capas'
import { formatoPrecio, type Producto } from '../lib/types'

export interface Editor {
  sel: Elemento | null
  seleccionar: (e: Elemento | null) => void
  cambiar: (e: Elemento, c: Partial<Capa>) => void
}

/** Etiqueta con cada elemento en la posición que eligió el usuario. Con `editor`, los elementos se arrastran y redimensionan. */
export default function EtiquetaLibre({ p, d, w, h, dpi, previa, editor }: {
  p: Producto; d: Diseno; w: number; h: number; dpi: number; previa?: boolean; editor?: Editor
}) {
  const cod = useCodigo(p, d)
  const raiz = useRef<HTMLDivElement>(null)
  const arrastre = useRef<{ el: Elemento; modo: 'mover' | 'tam'; x0: number; y0: number; c0: Capa; rw: number; rh: number } | null>(null)
  const capas = d.tipo === 'QR' ? d.capasQr : d.capasBarras
  const m = d.mostrar

  const textos: Partial<Record<Elemento, string>> = {
    negocio: m.negocio ? d.negocio : '',
    descripcion: m.descripcion ? p.descripcion : '',
    sku: m.sku ? p.sku : '',
    precio: m.precio && p.precio ? formatoPrecio(p.precio, d.moneda) : '',
    ubicacion: m.ubicacion && p.ubicacion ? `Ubic. ${p.ubicacion}` : '',
    stock: m.stock && p.stock ? `Stock ${p.stock}` : '',
  }

  function inicio(e: PE, el: Elemento, modo: 'mover' | 'tam') {
    if (!editor || !raiz.current) return
    e.preventDefault()
    e.stopPropagation()
    editor.seleccionar(el)
    const r = raiz.current.getBoundingClientRect()
    arrastre.current = { el, modo, x0: e.clientX, y0: e.clientY, c0: capas[el], rw: r.width, rh: r.height }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function mover(e: PE) {
    const a = arrastre.current
    if (!a || !editor) return
    const dx = ((e.clientX - a.x0) / a.rw) * 100
    const dy = ((e.clientY - a.y0) / a.rh) * 100
    if (a.modo === 'mover') {
      let x = clamp(a.c0.x + dx, 0, 100 - a.c0.w)
      let y = clamp(a.c0.y + dy, 0, 100 - a.c0.h)
      // Imán al centro de la etiqueta
      if (Math.abs(x + a.c0.w / 2 - 50) < 1.5) x = 50 - a.c0.w / 2
      if (Math.abs(y + a.c0.h / 2 - 50) < 1.5) y = 50 - a.c0.h / 2
      editor.cambiar(a.el, { x: +x.toFixed(2), y: +y.toFixed(2) })
    } else {
      editor.cambiar(a.el, {
        w: +clamp(a.c0.w + dx, 4, 100 - a.c0.x).toFixed(2),
        h: +clamp(a.c0.h + dy, 4, 100 - a.c0.y).toFixed(2),
      })
    }
  }
  const fin = () => { arrastre.current = null }

  function contenido(el: Elemento, c: Capa) {
    const bw = (w * c.w) / 100
    const bh = (h * c.h) / 100
    if (el === 'codigo') {
      if (cod === undefined) return <div className="sin-codigo">Escribe un código</div>
      if (cod === null) return <div className="invalido">{d.tipo === 'EAN13' ? 'EAN-13 necesita 12 o 13 dígitos' : 'Código no válido'}</div>
      const disp = (d.tipo === 'QR' ? Math.min(bw, bh) : bw) * (d.codigoTam ?? 100) / 100
      const aj = aPuntos(disp, cod.modulos, dpi)
      const modulo = aj.tam / cod.modulos
      const malo = !aj.cabe || modulo < (d.tipo === 'QR' ? 0.3 : 0.19)
      return (
        <>
          <div className="svg" style={{ width: `${aj.tam}mm`, height: d.tipo === 'QR' ? `${aj.tam}mm` : '100%' }}
            dangerouslySetInnerHTML={{ __html: cod.svg }} />
          {previa && malo && <div className="aviso-codigo no-print">{aj.cabe ? 'Muy pequeño: puede no escanear' : 'No cabe: agranda esta caja'}</div>}
        </>
      )
    }
    if (el === 'logo') return <img className={`e-logo ${d.logoBN ? 'bn' : ''}`} src={d.logo} alt="" />
    return <span>{textos[el]}</span>
  }

  const visibles = (Object.keys(capas) as Elemento[]).filter((el) =>
    el === 'codigo' ? true : el === 'logo' ? m.logo && !!d.logo : !!textos[el])

  return (
    <div ref={raiz} className={`etiqueta libre ${d.borde ? 'borde' : ''} ${editor ? 'editando' : ''}`}
      style={{ width: `${w}mm`, height: `${h}mm` }}
      onPointerDown={() => editor?.seleccionar(null)}>
      {visibles.map((el) => {
        const c = capas[el]
        const activo = editor?.sel === el
        return (
          <div key={el} className={`capa capa-${el} ${activo ? 'sel' : ''}`}
            style={{
              left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%`, height: `${c.h}%`,
              fontSize: `${(h * c.fs) / 100}mm`, textAlign: c.align, fontWeight: c.bold ? 800 : 500,
              justifyContent: c.align === 'left' ? 'flex-start' : c.align === 'right' ? 'flex-end' : 'center',
            }}
            onPointerDown={(e) => inicio(e, el, 'mover')} onPointerMove={mover} onPointerUp={fin} onPointerCancel={fin}>
            {contenido(el, c)}
            {activo && <div className="tirador no-print" onPointerDown={(e) => inicio(e, el, 'tam')} onPointerMove={mover} onPointerUp={fin} />}
          </div>
        )
      })}
    </div>
  )
}
