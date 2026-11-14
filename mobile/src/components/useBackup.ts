import { useCallback } from 'react'
import { backupFileName, backupJson, describeBackup, makeBackup, parseBackup } from '../lib/backup'
import { pickBackupFile, saveBackupFile } from '../lib/backupFile'
import { showAlert } from '../lib/alert'
import { usePlan } from '../lib/plan'

/** Export the plan to a backup file, and import a backup file. */
export function useBackup() {
  const { debts, method, extra, vices, tracking, replaceState } = usePlan()
  const hasData = debts.length > 0 || tracking !== null

  const exportBackup = useCallback(async () => {
    const at = new Date()
    const json = backupJson(makeBackup({ draft: { debts, method, extra, vices }, tracking }, at))
    try {
      const ok = await saveBackupFile(backupFileName(at), json)
      if (!ok) showAlert('Cannot save the backup', 'This device cannot share files.')
    } catch {
      showAlert('Cannot save the backup', 'Try again.')
    }
  }, [debts, method, extra, vices, tracking])

  const importBackup = useCallback(async () => {
    let text: string | null
    try {
      text = await pickBackupFile()
    } catch {
      showAlert('Cannot open the file', 'Try again, or pick another file.')
      return
    }
    if (text === null) return
    const parsed = parseBackup(text)
    if (!parsed.ok) {
      showAlert('Cannot import this file', parsed.error)
      return
    }
    const what = describeBackup(parsed.data)
    const apply = () => {
      replaceState(parsed.data)
      showAlert('Backup imported', what + '.')
    }
    if (!hasData) {
      apply()
      return
    }
    showAlert('Replace your plan?', `The backup has: ${what}. It replaces all the data in the app on this device. You cannot undo this.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Replace', style: 'destructive', onPress: apply },
    ])
  }, [hasData, replaceState])

  return { exportBackup, importBackup, hasData }
}
