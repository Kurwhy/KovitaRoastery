import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { MenuItem } from '../../types'
import { formatRupiah, kategoriLabel } from '../../lib/format'
import { cn } from '../../lib/cn'
import { StatusBadge } from '../ui/StatusBadge'

type MenuCardProps = {
  item: MenuItem
  onSelect: (item: MenuItem) => void
}

export function MenuCard({ item, onSelect }: MenuCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = item.fotoUrl && !imageFailed
  const disabled = item.isHabis

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(item)}
      aria-label={
        disabled
          ? `Menu ${item.nama} sedang habis`
          : item.hasVarian
            ? `Pilih varian ${item.nama}, ${formatRupiah(item.harga)}`
            : `Tambah ${item.nama} ke keranjang, ${formatRupiah(item.harga)}`
      }
      className={cn(
        'group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-slate text-left transition-colors duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        disabled
          ? 'cursor-not-allowed border-line'
          : 'border-line hover:border-brand-500/60 hover:bg-[#242424] active:bg-white/[0.06]',
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted">
          <span className="text-label font-semibold">
            {kategoriLabel(item.kategori)}
          </span>
          <span className="text-label text-muted/70">Foto menu</span>
        </div>

        {showImage && (
          <img
            src={item.fotoUrl ?? undefined}
            alt={`${item.nama} di Kovita Roastery`}
            width={600}
            height={450}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-200',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              disabled
                ? 'grayscale'
                : 'group-hover:scale-[1.02]',
            )}
          />
        )}

        <span className="absolute inset-0 bg-charcoal/20" aria-hidden="true" />

        <span className="absolute left-3 top-3 rounded-md border border-white/10 bg-charcoal/80 px-2 py-1 text-label font-semibold text-brand-200">
          {kategoriLabel(item.kategori)}
        </span>

        {item.isHabis && (
          <span className="absolute right-3 top-3">
            <StatusBadge status="habis" />
          </span>
        )}

        <span className="absolute bottom-3 left-3 rounded-md bg-charcoal/90 px-2.5 py-1.5 text-label font-bold tabular text-ink">
          {formatRupiah(item.harga)}
        </span>

        {!disabled && (
          <span
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-charcoal/90 text-brand-300 transition-colors duration-150 group-hover:border-brand-500/60 group-hover:bg-brand-500 group-hover:text-charcoal"
            aria-hidden="true"
          >
            <Plus className="h-4 w-4" />
          </span>
        )}
      </div>

      <div className="flex min-h-[84px] flex-1 flex-col p-4">
        <h3
          className={cn(
            'text-card leading-snug',
            disabled ? 'text-muted' : 'text-ink',
          )}
        >
          {item.nama}
        </h3>
        <p className="mt-1 text-label text-muted">
          {disabled
            ? 'Tidak tersedia hari ini'
            : item.hasVarian
              ? 'Pilih suhu dan gula'
              : 'Langsung tambah'}
        </p>
      </div>
    </button>
  )
}
