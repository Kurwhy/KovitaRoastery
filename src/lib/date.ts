const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function getWibDayKey(date = new Date()) {
  return dayKeyFormatter.format(date)
}

export function getTodayWibDayKey() {
  return getWibDayKey()
}

export function makeWibDate(time: string, dayKey = getTodayWibDayKey()) {
  return new Date(`${dayKey}T${time}:00+07:00`)
}

export function formatWibTime(date: Date | string) {
  return `${timeFormatter.format(new Date(date))} WIB`
}

export function formatWibDate(date: Date | string) {
  return dateFormatter.format(new Date(date))
}

export function formatWibDateTime(date: Date | string) {
  const value = new Date(date)
  return `${dateFormatter.format(value)}, ${timeFormatter.format(value)} WIB`
}

export function isTodayWib(date: Date | string) {
  return getWibDayKey(new Date(date)) === getTodayWibDayKey()
}

export function transactionDateKey(date = new Date()) {
  return getWibDayKey(date).replace(/-/g, '')
}


const monthFormatter = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jakarta',
  month: 'long',
  year: 'numeric',
})

export function getWibMonthKey(date = new Date()) {
  return getWibDayKey(date).slice(0, 7)
}

export function getWibMonthKeyMonthsAgo(months: number) {
  return getWibDayKeyMonthsAgo(months).slice(0, 7)
}

export function getWibDayKeyMonthsAgo(months: number) {
  const [year, month, day] = getTodayWibDayKey().split('-').map(Number)
  const lastDay = new Date(Date.UTC(year, month - months, 0)).getUTCDate()
  const target = new Date(
    Date.UTC(year, month - 1 - months, Math.min(day, lastDay)),
  )
  const targetYear = target.getUTCFullYear()
  const targetMonth = String(target.getUTCMonth() + 1).padStart(2, '0')
  const targetDay = String(target.getUTCDate()).padStart(2, '0')
  return `${targetYear}-${targetMonth}-${targetDay}`
}

export function formatWibMonth(monthKey: string) {
  const date = new Date(`${monthKey}-01T00:00:00+07:00`)
  return monthFormatter.format(date)
}

export function wibDateFromKey(dayKey: string) {
  return new Date(`${dayKey}T00:00:00+07:00`)
}
