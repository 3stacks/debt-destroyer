import { Alert, AlertButton, Platform } from 'react-native'

// Alert.alert does nothing on the web. There, use the browser dialogs: a
// message with a single button becomes alert(), and a choice becomes confirm().
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons)
    return
  }
  const text = [title, message].filter(Boolean).join('\n\n')
  const action = buttons?.find(b => b.style !== 'cancel' && b.onPress)
  if (!action) {
    window.alert(text)
    return
  }
  if (window.confirm(text)) action.onPress?.()
}
