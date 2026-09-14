export default function StatCard({ label, value, sub, tone = 'default' }) {
  const toneCls = tone === 'warn' ? 'text-clay' : 'text-ivy-950'
  return (
    <div className="border hairline bg-white/40 p-5">
      <p className="text-xs font-body text-ivy-600 mb-2">{label}</p>
      <p className={`font-display text-3xl num ${toneCls}`}>{value}</p>
      {sub && <p className="text-xs font-body text-ivy-500 mt-1">{sub}</p>}
    </div>
  )
}
