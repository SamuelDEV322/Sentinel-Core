import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const API_BASE = 'http://localhost:8000/api'
const STATUS_CRITICAL = 'CR\u00cdTICO'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 3000,
})

const scenarios = [
  {
    label: 'Simular lectura normal',
    payload: {
      current_a: 1.6,
      peak_current_a: 2.26,
      rms_current_a: 1.6,
      power_w: 352,
      temperature_c: 31.2,
      humidity_pct: 58,
    },
    tone: 'emerald',
  },
  {
    label: 'Simular sobrecorriente',
    payload: {
      current_a: 3.2,
      peak_current_a: 4.53,
      rms_current_a: 3.2,
      power_w: 704,
      temperature_c: 32,
      humidity_pct: 60,
    },
    tone: 'red',
  },
  {
    label: 'Simular temperatura alta',
    payload: {
      current_a: 1.7,
      peak_current_a: 2.4,
      rms_current_a: 1.7,
      power_w: 374,
      temperature_c: 43.4,
      humidity_pct: 63,
    },
    tone: 'red',
  },
  {
    label: 'Simular humedad extrema',
    payload: {
      current_a: 1.4,
      peak_current_a: 1.98,
      rms_current_a: 1.4,
      power_w: 308,
      temperature_c: 30.5,
      humidity_pct: 96,
    },
    tone: 'red',
  },
]

function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--'
  return Number(value).toFixed(decimals)
}

function formatTime(value) {
  if (!value) return '--'
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

function MetricCard({ label, value, unit, accent = 'cyan', detail }) {
  const accentClass =
    accent === 'red'
      ? 'text-red-300 border-red-500/30'
      : accent === 'emerald'
        ? 'text-emerald-300 border-emerald-500/30'
        : 'text-cyan-300 border-cyan-500/30'

  return (
    <section className={`rounded-lg border bg-slate-900/80 p-5 shadow-lg shadow-black/20 ${accentClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-semibold text-slate-50">{value}</span>
        {unit ? <span className="pb-1 text-sm text-slate-400">{unit}</span> : null}
      </div>
      {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
    </section>
  )
}

function StatusBadge({ critical, offline = false }) {
  if (offline) {
    return (
      <span className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1 text-xs font-bold text-red-200">
        SIN CONEXION
      </span>
    )
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${
        critical
          ? 'border-red-400/40 bg-red-500/15 text-red-200'
          : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
      }`}
    >
      {critical ? STATUS_CRITICAL : 'NORMAL'}
    </span>
  )
}

function ChartCard({ title, unit, dataKey, data, color, domain }) {
  return (
    <section className="h-80 rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-slate-300">
          {unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="82%">
        <LineChart data={data} margin={{ top: 8, right: 18, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={domain} />
          <Tooltip
            contentStyle={{
              background: '#020617',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
            labelStyle={{ color: '#67e8f9' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
            name={title}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}

function MachineStateCard({ latest, loading }) {
  const hasReading = Boolean(latest)
  const critical = Boolean(latest?.critical)
  const waiting = loading || !hasReading
  const stateTitle = waiting ? 'Esperando lectura' : critical ? 'Transformador interrumpido' : 'Transformador operativo'
  const motorState = waiting ? '--' : critical ? 'MOTOR APAGADO' : 'MOTOR ENCENDIDO'
  const ledLabel = waiting ? '--' : critical ? 'LED blanco titilando' : 'LED oscuro activo'
  const borderClass = waiting
    ? 'border-slate-700 bg-slate-900/70'
    : critical
      ? 'border-red-500/50 bg-red-950/40'
      : 'border-emerald-500/50 bg-emerald-950/30'
  const glowClass = waiting ? 'bg-slate-800/60' : critical ? 'bg-red-500/20 shadow-red-500/20' : 'bg-emerald-500/20 shadow-emerald-500/20'
  const motorClass = waiting ? 'bg-slate-800 text-slate-300' : critical ? 'bg-red-500/20 text-red-100' : 'bg-emerald-500/20 text-emerald-100'
  const ledClass = critical
    ? 'border-white bg-white shadow-[0_0_24px_rgba(255,255,255,0.9)] animate-pulse'
    : waiting
      ? 'border-slate-600 bg-slate-950'
      : 'border-slate-500 bg-slate-800 shadow-[0_0_18px_rgba(15,23,42,0.95)]'

  return (
    <section className={`rounded-lg border p-6 shadow-xl shadow-black/25 ${borderClass}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estado de maquina industrial</p>
          <h2 className="mt-3 text-3xl font-bold text-white">{stateTitle}</h2>
          <p className={`mt-3 inline-flex rounded-md px-3 py-2 font-mono text-sm font-bold ${motorClass}`}>
            {motorState}
          </p>
        </div>
        <div className={`flex min-w-56 items-center gap-4 rounded-lg border border-slate-700/70 p-4 ${glowClass}`}>
          <span className={`h-12 w-12 rounded-full border-2 ${ledClass}`} />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Indicador fisico</p>
            <p className="mt-1 font-semibold text-slate-100">{ledLabel}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoPanel({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  )
}

function InfoRow({ label, value, tone = 'slate' }) {
  const valueClass =
    tone === 'red'
      ? 'text-red-200'
      : tone === 'emerald'
        ? 'text-emerald-200'
        : tone === 'cyan'
          ? 'text-cyan-200'
          : 'text-slate-200'

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-right font-mono text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  )
}

function isEsp32Active(latest) {
  if (!latest?.created_at) return false
  return Date.now() - new Date(latest.created_at).getTime() <= 5000
}

export default function App() {
  const [latest, setLatest] = useState(null)
  const [readings, setReadings] = useState([])
  const [stats, setStats] = useState({
    total_readings: 0,
    critical_count: 0,
    normal_count: 0,
    latest_reading: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [apiOnline, setApiOnline] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [latestResponse, readingsResponse, statsResponse] = await Promise.all([
        api.get('/readings/latest/'),
        api.get('/readings/'),
        api.get('/readings/stats/'),
      ])

      const readingsData = Array.isArray(readingsResponse.data) ? readingsResponse.data : []
      setLatest(latestResponse.data)
      setReadings(readingsData)
      setStats(statsResponse.data)
      setApiOnline(true)
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      setApiOnline(false)
      setError(err.response?.data?.detail || err.message || 'No se pudo consultar el backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const timer = window.setInterval(fetchData, 2000)
    return () => window.clearInterval(timer)
  }, [fetchData])

  const postReading = async (payload) => {
    try {
      await api.post('/readings/', payload)
      await fetchData()
    } catch (err) {
      setApiOnline(false)
      setError(err.response?.data?.detail || err.message || 'No se pudo registrar la lectura.')
    }
  }

  const clearReadings = async () => {
    try {
      await api.delete('/readings/clear/')
      setLatest(null)
      setReadings([])
      setStats({
        total_readings: 0,
        critical_count: 0,
        normal_count: 0,
        latest_reading: null,
      })
      await fetchData()
    } catch (err) {
      setApiOnline(false)
      setError(err.response?.data?.detail || err.message || 'No se pudieron limpiar los registros.')
    }
  }

  const tableReadings = useMemo(() => readings.slice(0, 10), [readings])
  const chartData = useMemo(
    () =>
      readings
        .slice(0, 30)
        .reverse()
        .map((reading) => ({
          time: formatTime(reading.created_at),
          current_a: Number(reading.current_a),
          power_w: reading.power_w === null || reading.power_w === undefined ? null : Number(reading.power_w),
          temperature_c: Number(reading.temperature_c),
          humidity_pct: Number(reading.humidity_pct),
        })),
    [readings],
  )

  const status = latest?.critical ? STATUS_CRITICAL : 'NORMAL'
  const totalReadings = stats?.total_readings ?? readings.length
  const storageOk = totalReadings >= 100
  const esp32Active = isEsp32Active(latest)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Monitoreo preventivo industrial</p>
            <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">Sentinel-Core</h1>
          </div>
          <StatusBadge critical={latest?.critical} offline={!apiOnline && !loading} />
        </header>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <MachineStateCard latest={latest} loading={loading} />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Corriente"
            value={formatNumber(latest?.current_a, 2)}
            unit="A"
            accent={latest?.current_a >= 2.5 ? 'red' : 'cyan'}
            detail="Principal: Irms para compatibilidad"
          />
          <MetricCard
            label="Corriente pico Ip"
            value={formatNumber(latest?.peak_current_a, 3)}
            unit="A"
            accent={latest?.critical ? 'red' : 'cyan'}
            detail="Pico calculado por ESP32"
          />
          <MetricCard
            label="Corriente RMS Irms"
            value={formatNumber(latest?.rms_current_a, 3)}
            unit="A"
            accent={latest?.current_a >= 2.5 ? 'red' : 'cyan'}
            detail="Corriente eficaz"
          />
          <MetricCard
            label="Potencia estimada"
            value={formatNumber(latest?.power_w, 1)}
            unit="W"
            accent={latest?.critical ? 'red' : 'cyan'}
            detail="Estimacion ESP32"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Corriente base"
            value={formatNumber(latest?.current_a, 2)}
            unit="A"
            accent={latest?.current_a >= 2.5 ? 'red' : 'cyan'}
            detail="Usada para umbral critico"
          />
          <MetricCard
            label="Temperatura"
            value={formatNumber(latest?.temperature_c, 1)}
            unit={'\u00b0C'}
            accent={latest?.temperature_c > 40 || latest?.temperature_c < 20 ? 'red' : 'cyan'}
            detail="Rango seguro 20-40 C"
          />
          <MetricCard
            label="Humedad"
            value={formatNumber(latest?.humidity_pct, 0)}
            unit="%"
            accent={latest?.humidity_pct > 90 ? 'red' : 'cyan'}
            detail="DHT22"
          />
          <MetricCard label="Estado" value={loading ? '--' : status} unit="" accent={latest?.critical ? 'red' : 'emerald'} detail="Evaluacion backend" />
        </section>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <ChartCard
            title="Corriente vs tiempo"
            unit="A"
            dataKey="current_a"
            data={chartData}
            color="#22d3ee"
            domain={[0, 'auto']}
          />
          <ChartCard
            title="Temperatura vs tiempo"
            unit={'\u00b0C'}
            dataKey="temperature_c"
            data={chartData}
            color="#fb7185"
            domain={['auto', 'auto']}
          />
          <ChartCard
            title="Humedad vs tiempo"
            unit="%"
            dataKey="humidity_pct"
            data={chartData}
            color="#34d399"
            domain={[0, 100]}
          />
          <ChartCard
            title="Potencia vs tiempo"
            unit="W"
            dataKey="power_w"
            data={chartData}
            color="#f59e0b"
            domain={[0, 'auto']}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <h2 className="text-lg font-semibold text-white">Ultimas lecturas recibidas</h2>
              <div className="flex flex-wrap gap-2">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.label}
                    onClick={() => postReading(scenario.payload)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      scenario.tone === 'red'
                        ? 'border-red-500/40 bg-red-500/10 text-red-100 hover:bg-red-500/20'
                        : scenario.tone === 'emerald'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20'
                          : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20'
                    }`}
                  >
                    {scenario.label}
                  </button>
                ))}
                <button
                  onClick={fetchData}
                  className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  Refrescar
                </button>
                <button
                  onClick={clearReadings}
                  className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                >
                  Limpiar registros
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 pr-4">Hora</th>
                    <th className="py-3 pr-4">Corriente</th>
                    <th className="py-3 pr-4">Ip</th>
                    <th className="py-3 pr-4">Irms</th>
                    <th className="py-3 pr-4">Potencia</th>
                    <th className="py-3 pr-4">Temperatura</th>
                    <th className="py-3 pr-4">Humedad</th>
                    <th className="py-3 pr-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {tableReadings.map((reading) => (
                    <tr key={reading.id} className="text-slate-200">
                      <td className="py-3 pr-4 text-slate-400">{formatTime(reading.created_at)}</td>
                      <td className="py-3 pr-4">{formatNumber(reading.current_a, 2)} A</td>
                      <td className="py-3 pr-4">{formatNumber(reading.peak_current_a, 3)} A</td>
                      <td className="py-3 pr-4">{formatNumber(reading.rms_current_a, 3)} A</td>
                      <td className="py-3 pr-4">{formatNumber(reading.power_w, 1)} W</td>
                      <td className="py-3 pr-4">
                        {formatNumber(reading.temperature_c, 1)} {'\u00b0C'}
                      </td>
                      <td className="py-3 pr-4">{formatNumber(reading.humidity_pct, 0)} %</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            reading.critical ? 'bg-red-500/15 text-red-200' : 'bg-emerald-500/15 text-emerald-200'
                          }`}
                        >
                          {reading.critical ? STATUS_CRITICAL : 'NORMAL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!tableReadings.length ? (
                    <tr>
                      <td className="py-8 text-center text-slate-500" colSpan="8">
                        Sin lecturas registradas
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="grid gap-6">
            <InfoPanel title="Conexion">
              <InfoRow label="Estado Backend" value={apiOnline ? 'conectado' : 'sin conexion'} tone={apiOnline ? 'emerald' : 'red'} />
              <InfoRow label="Estado ESP32" value={esp32Active ? 'activo' : 'sin señal'} tone={esp32Active ? 'emerald' : 'red'} />
              <InfoRow label="Ultima actualizacion" value={formatTime(lastUpdated)} tone="cyan" />
              <InfoRow label="Endpoint ESP32" value="POST http://IP_DEL_PC:8000/api/readings/" tone="cyan" />
            </InfoPanel>

            <InfoPanel title="Registros">
              <InfoRow label="Total almacenado" value={totalReadings} tone={storageOk ? 'emerald' : 'cyan'} />
              <InfoRow label="Ultimos recibidos" value={tableReadings.length} tone="cyan" />
              <InfoRow label="Meta >= 100" value={storageOk ? 'cumplida' : 'pendiente'} tone={storageOk ? 'emerald' : 'red'} />
              <InfoRow label="Criticos" value={stats?.critical_count ?? 0} tone={(stats?.critical_count ?? 0) > 0 ? 'red' : 'emerald'} />
              <InfoRow label="Normales" value={stats?.normal_count ?? 0} tone="emerald" />
            </InfoPanel>

            <InfoPanel title="Umbrales">
              <InfoRow label="Corriente critica" value=">= 2.5 A" tone="red" />
              <InfoRow label="Temperatura segura" value={'20 \u00b0C a 40 \u00b0C'} tone="emerald" />
              <InfoRow label="Humedad valida" value="0 % a 100 %" tone="cyan" />
              <InfoRow label="Humedad alta" value="> 90 %" tone="red" />
            </InfoPanel>
          </aside>
        </section>
      </div>
    </main>
  )
}
