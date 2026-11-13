// A backup file: the whole saved state as JSON, with a header that names the
// format. The format is open on purpose. A person can read the file, keep it
// anywhere, and import it on another device.
import { monthName } from './tracking'
import { parseState, Stored } from './stored'

export const BACKUP_FORMAT = 'debt-destroyer-backup'
export const BACKUP_VERSION = 1

export interface Backup {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  data: Stored
}

export function makeBackup(state: Stored, exportedAt: Date): Backup {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: exportedAt.toISOString(), data: state }
}

export const backupJson = (backup: Backup) => JSON.stringify(backup, null, 2)

/** For example debt-destroyer-2026-11-13.json, in local time. */
export function backupFileName(at: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `debt-destroyer-${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}.json`
}

export type ParsedBackup = { ok: true; data: Stored; exportedAt: string | null } | { ok: false; error: string }

export function parseBackup(text: string): ParsedBackup {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'This file is not a Debt Destroyer backup. It is not JSON.' }
  }
  const b = json as Partial<Backup> | null
  if (!b || typeof b !== 'object' || b.format !== BACKUP_FORMAT) {
    return { ok: false, error: 'This file is not a Debt Destroyer backup.' }
  }
  if (typeof b.version !== 'number' || b.version > BACKUP_VERSION) {
    return { ok: false, error: 'A newer version of Debt Destroyer made this backup. Update the app, and then try again.' }
  }
  const data = parseState(b.data)
  if (data.draft.debts.length === 0 && !data.tracking) {
    return { ok: false, error: 'This backup has no debts.' }
  }
  return { ok: true, data, exportedAt: typeof b.exportedAt === 'string' ? b.exportedAt : null }
}

/** What a backup holds, in words, for the question before an import replaces the plan. */
export function describeBackup(data: Stored): string {
  const t = data.tracking
  if (!t) {
    const n = data.draft.debts.length
    return `${n} ${n === 1 ? 'debt' : 'debts'}, and no started plan`
  }
  const debts = t.versions[t.versions.length - 1].debts.length
  const months = Object.keys(t.recs).length
  const start = monthName(t.versions[0].startMonth)
  return `A plan that started in ${start}, with ${debts} ${debts === 1 ? 'debt' : 'debts'} and ${months} ${months === 1 ? 'month' : 'months'} of payments`
}
