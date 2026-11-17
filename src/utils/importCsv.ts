
import type { Category, Transaction } from '../types'
import { parseCSV } from './csvParser'

export const MAX_IMPORT_ROWS = 5000
export const MAX_FILE_SIZE = 1024 * 1024 // 1 MB

export interface ImportError {
  row: number 
  message: string
}

export interface ImportResult {
  valid: Omit<Transaction, 'id'>[]
  duplicates: number
  errors: ImportError[]
  fatalError?: string 
}

const REQUIRED_COLUMNS = ['date', 'title', 'type', 'category', 'amount']

function unescapeFormula(value: string): string {
  return /^'[=+\-@\t\r]/.test(value) ? value.slice(1) : value
}

function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  )
}

function fingerprint(t: Omit<Transaction, 'id'>): string {
  return [t.date, t.title.toLowerCase(), t.type, t.categoryId, t.amount.toFixed(2)].join('|')
}

function fatal(message: string): ImportResult {
  return { valid: [], duplicates: 0, errors: [], fatalError: message }
}

export function importTransactionsFromCSV(
  text: string,
  categories: Category[],
  existing: Transaction[],
): ImportResult {
  const rows = parseCSV(text)
  if (rows.length === 0) return fatal('The file is empty.')

  // هدر
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c))
  if (missing.length > 0) return fatal(`Missing columns: ${missing.join(', ')}.`)

  const dataRows = rows.slice(1)
  if (dataRows.length === 0) return fatal('The file has no data rows.')
  if (dataRows.length > MAX_IMPORT_ROWS) {
    return fatal(`Too many rows (max ${MAX_IMPORT_ROWS}).`)
  }

  const col = Object.fromEntries(header.map((name, index) => [name, index]))

  const categoryIndex = new Map(
    categories.map((c) => [`${c.type}|${c.name.trim().toLowerCase()}`, c.id]),
  )

  const remaining = new Map<string, number>()
  for (const t of existing) {
    const key = fingerprint(t)
    remaining.set(key, (remaining.get(key) ?? 0) + 1)
  }

  const valid: Omit<Transaction, 'id'>[] = []
  const errors: ImportError[] = []
  let duplicates = 0

  dataRows.forEach((row, i) => {
    const rowNumber = i + 1
    const get = (name: string) =>
      name in col ? unescapeFormula((row[col[name]] ?? '').trim()) : ''
    const fail = (message: string) => errors.push({ row: rowNumber, message })

    const date = get('date')
    if (!isValidISODate(date)) return fail('Invalid date (expected YYYY-MM-DD)')

    const title = get('title')
    if (title.length < 2 || title.length > 50) {
      return fail('Title must be 2 to 50 characters')
    }

    const type = get('type').toLowerCase()
    if (type !== 'income' && type !== 'expense') {
      return fail('Type must be "income" or "expense"')
    }

    const categoryName = get('category')
    const categoryId = categoryIndex.get(`${type}|${categoryName.toLowerCase()}`)
    if (!categoryId) return fail(`Unknown ${type} category "${categoryName}"`)

    const amountRaw = Number(get('amount'))
    if (!Number.isFinite(amountRaw) || amountRaw <= 0 || amountRaw > 1_000_000_000) {
      return fail('Amount must be a number greater than 0')
    }
    const amount = Math.round(amountRaw * 100) / 100

    const note = get('note')
    if (note.length > 200) return fail('Note must be at most 200 characters')

    const transaction: Omit<Transaction, 'id'> = {
      title,
      amount,
      type,
      categoryId,
      date,
      note: note || undefined,
    }

    const key = fingerprint(transaction)
    const left = remaining.get(key) ?? 0
    if (left > 0) {
      remaining.set(key, left - 1)
      duplicates++
      return
    }

    valid.push(transaction)
  })

  return { valid, duplicates, errors }
}