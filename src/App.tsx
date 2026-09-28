import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import Etiqueta, { type Diseno } from './components/Etiqueta'
import { TIPOS, generarSku } from './lib/codes'
import { PAPELES, PRESETS, porPagina, seSale, tamPagina, type Plantilla } from './lib/formatos'
import { CAMPOS, PRODUCTO_VACIO, type Producto } from './lib/types'
import { IMPRESORAS } from './lib/impresoras'
import { descargarPlantilla, leerExcel } from './lib/excel'

interface Ajustes {
  diseno: Diseno
  preset: string // id de PRESETS o 'custom'
  plantilla: Plantilla
  dx: number // calibración de la impresora
  dy: number
  impresora: string // id de IMPRESORAS
  dpi: number
}

const AJUSTES_INICIALES: Ajustes = {
  diseno: {
    tipo: 'CODE128', qrDatos: false, moneda: 'Q', negocio: '', borde: false, logo: '', logoTam: 30, logoBN: true,
    mostrar: { descripcion: true, precio: true, ubicacion: false, stock: false, sku: true, negocio: false, logo: false },
  },
  preset: 'r5025',
  plantilla: PRESETS.find((p) => p.id === 'r5025')!.p,
  dx: 0,
  dy: 0,
  impresora: 'tsc-te200',
  dpi: 203,
}

// Solo se recuerda la configuración de impresora/etiqueta en este navegador. Los productos no se guardan.
const CLAVE = 'etiquetador.ajustes.v2'
function leerAjustes(): Ajustes {
  try {
    const a = JSON.parse(localStorage.getItem(CLAVE) || 'null')
    if (!a) return AJUSTES_INICIALES
    return {
      ...AJUSTES_INICIALES, ...a,
      diseno: { ...AJUSTES_INICIALES.diseno, ...a.diseno, mostrar: { ...AJUSTES_INICIALES.diseno.mostrar, ...a.diseno?.mostrar } },
      plantilla: { ...AJUSTES_INICIALES.plantilla, ...a.plantilla },
    }
  } catch { return AJUSTES_INICIALES }
}

const EJEMPLO: Producto = { id: 'ejemplo', sku: '7501234567897', descripcion: 'Producto de ejemplo', precio: '25.50', ubicacion: 'Pasillo 3 · B2', stock: '12' }
const nuevoId = () => Math.random().toString(36).slice(2)

interface Trabajo { items: { p: Producto; n: number }[]; saltar: number }

export default function App() {
  const [aj, setAj] = useState<Ajustes>(leerAjustes)
  const [actual, setActual] = useState<Producto>({ ...PRODUCTO_VACIO, id: nuevoId() })
  const [lista, setLista] = useState<Producto[]>([])
  const [preguntar, setPreguntar] = useState(false)
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null)
  const [verMedidas, setVerMedidas] = useState(false)
  const skuRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const excelRef = useRef<HTMLInputElement>(null)
  const [msgExcel, setMsgExcel] = useState<{ ok: boolean; texto: string } | null>(null)

  async function cargarExcel(f: File) {
    setMsgExcel({ ok: true, texto: 'Leyendo archivo…' })
    try {
      const { filas, aviso } = await leerExcel(f)
      if (!filas.length) { setMsgExcel({ ok: false, texto: aviso || 'No encontré productos con código en el archivo.' }); return }
      setLista((l) => [...l, ...filas.map((x) => ({ ...x, id: nuevoId() }))])
      // Mostrar automáticamente los campos que vienen llenos
      const usados = {
        descripcion: filas.some((x) => x.descripcion), precio: filas.some((x) => x.precio),
        ubicacion: filas.some((x) => x.ubicacion), stock: filas.some((x) => x.stock),
      }
      setAj((a) => ({ ...a, diseno: { ...a.diseno, mostrar: { ...a.diseno.mostrar, ...Object.fromEntries(Object.entries(usados).filter(([, v]) => v)) } } }))
      setMsgExcel({ ok: true, texto: `${filas.length} producto${filas.length === 1 ? '' : 's'} cargado${filas.length === 1 ? '' : 's'} desde ${f.name}.${aviso ? ' ' + aviso : ''}` })
    } catch {
      setMsgExcel({ ok: false, texto: 'No se pudo leer el archivo. Usa .xlsx, .xls o .csv.' })
    }
  }
  const [errorLogo, setErrorLogo] = useState('')

  // Reduce el logo a máx. 600 px para que la vista previa e impresión sean rápidas y quepa en el navegador
  async function cargarLogo(f: File) {
    setErrorLogo('')
    if (!f.type.startsWith('image/')) { setErrorLogo('El archivo no es una imagen.'); return }
    try {
      const url = URL.createObjectURL(f)
      const img = new Image()
      img.src = url
      await img.decode()
      const max = 600
      const k = Math.min(1, max / Math.max(img.naturalWidth || max, img.naturalHeight || max))
      const c = document.createElement('canvas')
      c.width = Math.round((img.naturalWidth || max) * k)
      c.height = Math.round((img.naturalHeight || max) * k)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      setAj((a) => ({ ...a, diseno: { ...a.diseno, logo: c.toDataURL('image/png'), mostrar: { ...a.diseno.mostrar, logo: true } } }))
    } catch {
      setErrorLogo('No se pudo leer la imagen. Prueba con un PNG o JPG.')
    }
  }

  const { diseno: d, plantilla: pl } = aj
  const hoja = pl.medio === 'hoja'

  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify(aj)) } catch { /* sin almacenamiento: no pasa nada */ }
  }, [aj])

  const setD = (c: Partial<Diseno>) => setAj({ ...aj, diseno: { ...d, ...c } })
  const setP = (c: Partial<Plantilla>) => setAj({ ...aj, preset: 'custom', plantilla: { ...pl, ...c } })
  function elegirImpresora(id: string) {
    const imp = IMPRESORAS.find((x) => x.id === id)!
    const pr = PRESETS.find((x) => x.id === imp.preset)!
    const mismoMedio = pl.medio === imp.medio
    setAj({ ...aj, impresora: id, dpi: imp.dpi, ...(mismoMedio ? {} : { preset: pr.id, plantilla: { ...pr.p } }) })
  }
  function elegirPreset(id: string) {
    const pr = PRESETS.find((x) => x.id === id)
    if (pr) setAj({ ...aj, preset: id, plantilla: { ...pr.p } })
    else setAj({ ...aj, preset: 'custom' })
  }

  const actualTieneDatos = actual.sku.trim() !== ''
  function agregar(e?: FormEvent) {
    e?.preventDefault()
    if (!actualTieneDatos) { skuRef.current?.focus(); return }
    setLista((l) => l.some((x) => x.id === actual.id) ? l.map((x) => x.id === actual.id ? actual : x) : [...l, actual])
    setActual({ ...PRODUCTO_VACIO, id: nuevoId() })
    skuRef.current?.focus()
  }

  // Los productos a imprimir: la lista + lo que está escrito en el formulario (si no se agregó aún)
  const aImprimir = useMemo(() => {
    const r = [...lista]
    if (actualTieneDatos && !lista.some((x) => x.id === actual.id)) r.push(actual)
    return r
  }, [lista, actual, actualTieneDatos])

  // Lanzar el diálogo de impresión cuando el trabajo ya está en pantalla
  useEffect(() => {
    if (!trabajo) return
    const fin = () => setTrabajo(null)
    window.addEventListener('afterprint', fin, { once: true })
    const t = setTimeout(() => window.print(), 150)
    return () => { clearTimeout(t); window.removeEventListener('afterprint', fin) }
  }, [trabajo])

  const [pw, ph] = tamPagina(pl)
  const imp = IMPRESORAS.find((x) => x.id === aj.impresora) ?? IMPRESORAS[0]
  const muyAncho = !hoja && imp.anchoMax && pw > imp.anchoMax
  const muestra = actualTieneDatos ? actual : lista[lista.length - 1] ?? EJEMPLO
  const escala = Math.min(3.2, 340 / (pl.w * 3.78), 260 / (pl.h * 3.78))

  return (
    <>
      <style>{`@page { size: ${pw}mm ${ph}mm; margin: 0; }`}</style>

      <div className="app no-print">
        <header className="barra">
          <div className="marca"><Logo /><span>Etiquetador</span></div>
          <span className="lema">Códigos de barra y QR para imprimir · no se guarda nada</span>
        </header>

        <main className="layout">
          <div className="columna">
            {/* 1. Datos */}
            <form className="tarjeta" onSubmit={agregar}>
              <h2><span className="num">1</span> Datos del producto</h2>
              <div className="casillas">
                {CAMPOS.map((c) => (
                  <label key={c.id} className="casilla">
                    <input type="checkbox" checked={d.mostrar[c.id]} onChange={(e) => setD({ mostrar: { ...d.mostrar, [c.id]: e.target.checked } })} />
                    {c.nombre}
                  </label>
                ))}
              </div>

              <label>Código / SKU
                <div className="con-boton">
                  <input ref={skuRef} className="mono" value={actual.sku} autoFocus
                    onChange={(e) => setActual({ ...actual, sku: e.target.value })} placeholder="Escribe o escanea el código" />
                  <button type="button" className="btn" onClick={() => setActual({ ...actual, sku: generarSku() })}>Generar</button>
                </div>
              </label>
              {d.mostrar.descripcion && (
                <label>Descripción<input value={actual.descripcion} onChange={(e) => setActual({ ...actual, descripcion: e.target.value })} placeholder="Ej. Cable USB-C 1 m" /></label>
              )}
              <div className="fila-campos">
                {d.mostrar.precio && (
                  <label>Precio
                    <div className="con-prefijo">
                      <input className="prefijo" value={d.moneda} maxLength={4} onChange={(e) => setD({ moneda: e.target.value })} aria-label="Moneda" />
                      <input inputMode="decimal" value={actual.precio} onChange={(e) => setActual({ ...actual, precio: e.target.value })} placeholder="0.00" />
                    </div>
                  </label>
                )}
                {d.mostrar.stock && (
                  <label>Stock<input inputMode="numeric" value={actual.stock} onChange={(e) => setActual({ ...actual, stock: e.target.value })} /></label>
                )}
              </div>
              {d.mostrar.ubicacion && (
                <label>Ubicación<input value={actual.ubicacion} onChange={(e) => setActual({ ...actual, ubicacion: e.target.value })} placeholder="Ej. Pasillo 3 · Estante B" /></label>
              )}
              {d.mostrar.logo && (
                <div className="logo-box">
                  {d.logo ? (
                    <>
                      <div className="logo-muestra"><img src={d.logo} alt="Logo" className={d.logoBN ? 'bn' : ''} /></div>
                      <div className="logo-opciones">
                        <label>Tamaño en la etiqueta
                          <input type="range" min={10} max={60} value={d.logoTam} onChange={(e) => setD({ logoTam: Number(e.target.value) })} />
                        </label>
                        <label className="casilla">
                          <input type="checkbox" checked={d.logoBN} onChange={(e) => setD({ logoBN: e.target.checked })} />
                          Blanco y negro (recomendado en térmicas)
                        </label>
                        <div className="acciones">
                          <button type="button" className="btn" onClick={() => logoRef.current?.click()}>Cambiar</button>
                          <button type="button" className="link peligro" onClick={() => setD({ logo: '' })}>Quitar logo</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button type="button" className="subir" onClick={() => logoRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) cargarLogo(f) }}>
                      <b>Cargar logo</b>
                      <span>Haz clic o arrastra una imagen (PNG, JPG, SVG). Mejor con fondo blanco o transparente.</span>
                    </button>
                  )}
                  {errorLogo && <p className="error">{errorLogo}</p>}
                  <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) cargarLogo(f); e.target.value = '' }} />
                </div>
              )}
              {d.mostrar.negocio && (
                <label>Nombre del negocio<input value={d.negocio} onChange={(e) => setD({ negocio: e.target.value })} placeholder="Mi Tienda" /></label>
              )}

              <div className="acciones">
                <button className="btn" disabled={!actualTieneDatos}>{lista.some((x) => x.id === actual.id) ? 'Actualizar en la lista' : '+ Agregar otro producto'}</button>
                {actualTieneDatos && <button type="button" className="link" onClick={() => setActual({ ...PRODUCTO_VACIO, id: nuevoId() })}>Limpiar</button>}
              </div>

              <div className="excel">
                <div>
                  <b>¿Muchos productos?</b> Cárgalos desde Excel
                  <span className="suave"> · columnas: Código, Descripción, Precio, Ubicación, Stock, Etiquetas</span>
                </div>
                <div className="acciones">
                  <button type="button" className="btn negro" onClick={() => excelRef.current?.click()}>📄 Cargar Excel</button>
                  <button type="button" className="link" onClick={() => descargarPlantilla()}>Descargar plantilla</button>
                </div>
                {msgExcel && <p className={msgExcel.ok ? 'ok' : 'error'}>{msgExcel.texto}</p>}
                <input ref={excelRef} type="file" hidden
                  accept=".xlsx,.xls,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) cargarExcel(f); e.target.value = '' }} />
              </div>

              {lista.length > 0 && (
                <div className="lista">
                  <div className="lista-titulo"><b>Lista para imprimir ({lista.length})</b><button type="button" className="link" onClick={() => setLista([])}>Vaciar</button></div>
                  <div className="lista-items">{lista.map((p) => (
                    <div key={p.id} className={`lista-item ${p.id === actual.id ? 'editando' : ''}`}>
                      <span className="mono">{p.sku}</span>
                      <span className="nombre">{p.descripcion}</span>
                      {p.copias != null && <span className="pill">{p.copias} etiq.</span>}
                      <button type="button" className="link" onClick={() => setActual(p)}>Editar</button>
                      <button type="button" className="link peligro" onClick={() => setLista(lista.filter((x) => x.id !== p.id))} aria-label="Quitar">✕</button>
                    </div>
                  ))}</div>
                </div>
              )}
            </form>

            {/* 2. Código */}
            <section className="tarjeta">
              <h2><span className="num">2</span> Tipo de código</h2>
              <div className="opciones">
                {TIPOS.map((t) => (
                  <label key={t.id} className={`opcion ${d.tipo === t.id ? 'on' : ''}`}>
                    <input type="radio" name="tipo" checked={d.tipo === t.id} onChange={() => setD({ tipo: t.id })} />
                    <span><b>{t.nombre}</b><small>{t.ayuda}</small></span>
                  </label>
                ))}
              </div>
              {d.tipo === 'QR' && (
                <label className="casilla ancha">
                  <input type="checkbox" checked={d.qrDatos} onChange={(e) => setD({ qrDatos: e.target.checked })} />
                  Que el QR también contenga la descripción, precio y demás datos marcados
                </label>
              )}
            </section>

            {/* 3. Impresora / etiqueta */}
            <section className="tarjeta">
              <h2><span className="num">3</span> Impresora y etiqueta</h2>
              <label>Tu impresora
                <select value={imp.id} onChange={(e) => elegirImpresora(e.target.value)}>
                  {[...new Set(IMPRESORAS.map((x) => x.marca))].map((m) => (
                    <optgroup key={m} label={m}>
                      {IMPRESORAS.filter((x) => x.marca === m).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                    </optgroup>
                  ))}
                </select>
              </label>
              <details className="guia">
                <summary>Cómo configurar la {imp.nombre.split(' / ')[0]} <span className="suave">· {imp.dpi} dpi{imp.anchoMax ? ` · etiquetas hasta ${imp.anchoMax} mm` : ''}</span></summary>
                <ol>{imp.consejos.map((c, i) => <li key={i}>{c}</li>)}</ol>
              </details>
              <label>Tamaño de etiqueta
                <select value={aj.preset} onChange={(e) => elegirPreset(e.target.value)}>
                  {[...new Set(PRESETS.filter((x) => x.p.medio === imp.medio).map((x) => x.grupo))].map((g) => (
                    <optgroup key={g} label={g}>
                      {PRESETS.filter((x) => x.grupo === g).map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                    </optgroup>
                  ))}
                  <option value="custom">✎ Personalizado (mis medidas)</option>
                </select>
              </label>

              <button className="link izq" onClick={() => setVerMedidas(!verMedidas)}>
                {verMedidas || aj.preset === 'custom' ? '▾' : '▸'} Medidas exactas y calibración
              </button>
              {(verMedidas || aj.preset === 'custom') && (
                <div className="medidas">
                  {hoja && (
                    <label className="span2">Papel
                      <select value={PAPELES.findIndex((x) => x.tam[0] === pl.papel[0] && x.tam[1] === pl.papel[1])}
                        onChange={(e) => setP({ papel: PAPELES[Number(e.target.value)].tam })}>
                        {PAPELES.map((x, i) => <option key={i} value={i}>{x.nombre}</option>)}
                      </select>
                    </label>
                  )}
                  <Num label="Ancho etiqueta" v={pl.w} on={(w) => setP({ w })} min={5} />
                  <Num label="Alto etiqueta" v={pl.h} on={(h) => setP({ h })} min={5} />
                  <Num label={hoja ? 'Columnas' : 'Etiquetas por fila'} v={pl.cols} on={(cols) => setP({ cols: Math.max(1, Math.round(cols)) })} min={1} step={1} unidad="" />
                  {hoja && <Num label="Filas" v={pl.filas} on={(filas) => setP({ filas: Math.max(1, Math.round(filas)) })} min={1} step={1} unidad="" />}
                  {hoja && <Num label="Margen superior" v={pl.top} on={(top) => setP({ top })} />}
                  <Num label={hoja ? 'Margen izquierdo' : 'Borde lateral del rollo'} v={pl.left} on={(left) => setP({ left })} />
                  {pl.cols > 1 && <Num label="Espacio entre columnas" v={pl.gapX} on={(gapX) => setP({ gapX })} />}
                  {hoja && pl.filas > 1 && <Num label="Espacio entre filas" v={pl.gapY} on={(gapY) => setP({ gapY })} />}
                  <label>Resolución
                    <select value={aj.dpi} onChange={(e) => setAj({ ...aj, dpi: Number(e.target.value) })}>
                      <option value={203}>203 dpi (8 puntos/mm)</option>
                      <option value={300}>300 dpi (12 puntos/mm)</option>
                      <option value={600}>600 dpi (tinta / láser)</option>
                    </select>
                  </label>
                  <div className="span2 calibra">
                    <b>Calibración</b> <span className="suave">si la impresión sale corrida, muévela:</span>
                  </div>
                  <Num label="→ Derecha (–izquierda)" v={aj.dx} on={(dx) => setAj({ ...aj, dx })} min={-50} />
                  <Num label="↓ Abajo (–arriba)" v={aj.dy} on={(dy) => setAj({ ...aj, dy })} min={-50} />
                  {seSale(pl) && <p className="error span2">Con estas medidas las etiquetas se salen del papel. Revisa columnas, filas o márgenes.</p>}
                </div>
              )}

              {muyAncho && <p className="error">Esta etiqueta mide {pw} mm de ancho y la {imp.nombre.split(' / ')[0]} acepta hasta {imp.anchoMax} mm.</p>}
              <label className="casilla ancha">
                <input type="checkbox" checked={d.borde} onChange={(e) => setD({ borde: e.target.checked })} />
                Imprimir línea de corte (para papel sin precortar)
              </label>
            </section>
          </div>

          {/* Vista previa */}
          <aside className="columna previa">
            <div className="tarjeta sticky">
              <h2>Vista previa</h2>
              <div className="lienzo">
                <div style={{ zoom: escala, '--z': escala } as CSSProperties}>
                  <Etiqueta p={muestra} d={d} w={pl.w} h={pl.h} dpi={aj.dpi} previa />
                </div>
              </div>
              <p className="suave centrado">
                {pl.w} × {pl.h} mm{porPagina(pl) > 1 && ` · ${porPagina(pl)} por ${hoja ? 'hoja' : 'fila'}`}
                {muestra === EJEMPLO && ' · datos de ejemplo'}
              </p>

              {hoja && (
                <div className="mini-hoja-wrap">
                  <Pagina pl={pl} d={d} dpi={aj.dpi} dx={aj.dx} dy={aj.dy} celdas={Array(porPagina(pl)).fill(muestra)} zoom={Math.min(0.42, 260 / (pw * 3.78))} />
                </div>
              )}

              <button className="btn primario grande" disabled={!aImprimir.length} onClick={() => setPreguntar(true)}>
                🖨 Imprimir etiquetas
              </button>
              {!aImprimir.length && <p className="suave centrado pequeno">Escribe al menos un código para imprimir.</p>}
            </div>
          </aside>
        </main>
        <footer className="pie">
          Herramienta gratuita para la comunidad · Todo se genera en tu navegador: tus productos no se envían ni se guardan en ningún servidor.
        </footer>
      </div>

      {preguntar && (
        <Cantidades productos={aImprimir} hoja={hoja} porHoja={porPagina(pl)}
          onCancelar={() => setPreguntar(false)}
          onImprimir={(t) => { setPreguntar(false); setTrabajo(t) }} />
      )}

      {trabajo && <AreaImpresion trabajo={trabajo} pl={pl} d={d} dpi={aj.dpi} dx={aj.dx} dy={aj.dy} />}
    </>
  )
}

function Num({ label, v, on, min = 0, step = 0.1, unidad = 'mm' }: {
  label: string; v: number; on: (n: number) => void; min?: number; step?: number; unidad?: string
}) {
  return (
    <label>{label}
      <div className="con-sufijo">
        <input type="number" value={v} min={min} step={step} onChange={(e) => on(Number(e.target.value) || 0)} />
        {unidad && <span>{unidad}</span>}
      </div>
    </label>
  )
}

function Cantidades({ productos, hoja, porHoja, onCancelar, onImprimir }: {
  productos: Producto[]; hoja: boolean; porHoja: number
  onCancelar: () => void; onImprimir: (t: Trabajo) => void
}) {
  const [n, setN] = useState<Record<string, string>>(() => Object.fromEntries(productos.map((p) => [p.id, String(p.copias ?? 1)])))
  const [saltar, setSaltar] = useState('0')
  const [todos, setTodos] = useState('1')
  const total = productos.reduce((s, p) => s + (parseInt(n[p.id]) || 0), 0)
  const hojas = hoja ? Math.ceil((total + (parseInt(saltar) || 0)) / porHoja) : 0

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!total) return
    onImprimir({
      items: productos.map((p) => ({ p, n: Math.min(2000, parseInt(n[p.id]) || 0) })),
      saltar: hoja ? Math.min(porHoja - 1, parseInt(saltar) || 0) : 0,
    })
  }

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCancelar()}>
      <form className="modal tarjeta" onSubmit={enviar}>
        <h2>¿Cuántas etiquetas vas a imprimir?</h2>
        {productos.length > 1 && (
          <div className="todos">
            <span>Misma cantidad para todos:</span>
            <input type="number" min={0} max={2000} value={todos} onChange={(e) => setTodos(e.target.value)} />
            <button type="button" className="btn" onClick={() => setN(Object.fromEntries(productos.map((p) => [p.id, todos])))}>Aplicar</button>
          </div>
        )}
        <div className="cantidades">
          {productos.map((p, i) => (
            <label key={p.id} className="cantidad">
              <span className="nombre"><b className="mono">{p.sku}</b>{p.descripcion && ` · ${p.descripcion}`}</span>
              <input type="number" min={0} max={2000} value={n[p.id]} autoFocus={i === 0}
                onFocus={(e) => e.target.select()} onChange={(e) => setN({ ...n, [p.id]: e.target.value })} />
            </label>
          ))}
        </div>
        {hoja && (
          <label className="en-linea">Ya usé
            <input type="number" min={0} max={porHoja - 1} value={saltar} onChange={(e) => setSaltar(e.target.value)} />
            etiquetas de la hoja (se saltan)
          </label>
        )}
        <p className="resumen">
          Total: <b>{total}</b> etiqueta{total === 1 ? '' : 's'}{hoja && total > 0 && <> · {hojas} hoja{hojas === 1 ? '' : 's'}</>}
        </p>
        <p className="suave pequeno">En la ventana de impresión elige tu impresora, escala <b>100%</b> y márgenes <b>Ninguno</b>.</p>
        <div className="acciones fin">
          <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>
          <button className="btn primario" disabled={!total}>Imprimir {total || ''}</button>
        </div>
      </form>
    </div>
  )
}

function Pagina({ pl, d, dpi, dx, dy, celdas, zoom }: {
  pl: Plantilla; d: Diseno; dpi: number; dx: number; dy: number; celdas: (Producto | null)[]; zoom?: number
}) {
  const [pw, ph] = tamPagina(pl)
  return (
    <div className="pagina" style={{ width: `${pw}mm`, height: `${ph}mm`, zoom }}>
      <div className="rejilla" style={{
        paddingTop: `${pl.medio === 'hoja' ? pl.top : 0}mm`, paddingLeft: `${pl.left}mm`,
        transform: dx || dy ? `translate(${dx}mm, ${dy}mm)` : undefined,
        gridTemplateColumns: `repeat(${pl.cols}, ${pl.w}mm)`, gridAutoRows: `${pl.h}mm`,
        columnGap: `${pl.gapX}mm`, rowGap: `${pl.gapY}mm`,
      }}>
        {celdas.map((p, i) => p ? <Etiqueta key={i} p={p} d={d} w={pl.w} h={pl.h} dpi={dpi} /> : <div key={i} />)}
      </div>
    </div>
  )
}

function AreaImpresion({ trabajo, pl, d, dpi, dx, dy }: { trabajo: Trabajo; pl: Plantilla; d: Diseno; dpi: number; dx: number; dy: number }) {
  const paginas = useMemo(() => {
    const celdas: (Producto | null)[] = Array(trabajo.saltar).fill(null)
    for (const { p, n } of trabajo.items) for (let i = 0; i < n; i++) celdas.push(p)
    const pp = porPagina(pl)
    const r: (Producto | null)[][] = []
    for (let i = 0; i < celdas.length; i += pp) r.push(celdas.slice(i, i + pp))
    return r
  }, [trabajo, pl])

  return (
    <div className="area-impresion">
      {paginas.map((c, i) => <Pagina key={i} pl={pl} d={d} dpi={dpi} dx={dx} dy={dy} celdas={c} />)}
    </div>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
      <rect width="32" height="32" rx="6" fill="#111" />
      <g fill="#FFD200">
        <rect x="6" y="8" width="2" height="16" /><rect x="10" y="8" width="1" height="16" /><rect x="13" y="8" width="3" height="16" />
        <rect x="18" y="8" width="1" height="16" /><rect x="21" y="8" width="2" height="16" /><rect x="25" y="8" width="1" height="16" />
      </g>
    </svg>
  )
}
