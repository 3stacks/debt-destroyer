// Save a backup file, and pick one to import.
// - iOS and Android: write the file to the cache, and open the share sheet.
//   The person can save it to Files, Google Drive or email, or AirDrop it.
//   Import uses the system file picker.
// - Web: download the file, and pick a file with a file input.
import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { Platform } from 'react-native'

const TYPE = 'application/json'

/** Returns false when the device cannot share a file. */
export async function saveBackupFile(name: string, json: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: TYPE }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  }
  if (!(await Sharing.isAvailableAsync())) return false
  const file = new File(Paths.cache, name)
  if (file.exists) file.delete()
  file.create()
  file.write(json)
  await Sharing.shareAsync(file.uri, { mimeType: TYPE, UTI: 'public.json', dialogTitle: 'Save your backup' })
  return true
}

/** The text of the file that the person picks, or null when they cancel. */
export async function pickBackupFile(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return new Promise(resolve => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,application/json'
      input.onchange = () => {
        const f = input.files?.[0]
        if (!f) return resolve(null)
        f.text().then(resolve, () => resolve(null))
      }
      input.oncancel = () => resolve(null)
      input.click()
    })
  }
  // Some file providers on Android label a JSON file as plain text or as
  // binary data, so allow those too. parseBackup checks the content.
  const picked = await File.pickFileAsync({ mimeTypes: [TYPE, 'text/plain', 'application/octet-stream'] })
  if (picked.canceled) return null
  return picked.result.text()
}
