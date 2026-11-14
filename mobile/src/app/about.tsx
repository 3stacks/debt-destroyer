import { router } from 'expo-router'
import { openBrowserAsync } from 'expo-web-browser'
import { useEffect, useState } from 'react'
import { Platform, ScrollView, Switch, Text, View } from 'react-native'
import { Body, Button, SectionHeader } from '../components/ui'
import { useBackup } from '../components/useBackup'
import { space, useColors } from '../lib/theme'
import { readUsage, setUsageEnabled } from '../lib/usage'

function UsageSwitch() {
  const c = useColors()
  const [on, setOn] = useState<boolean | null>(null)
  useEffect(() => {
    readUsage().then(u => setOn(u.enabled))
  }, [])
  if (on === null) return null
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Text style={{ color: c.text, fontSize: 16, flex: 1 }}>Send anonymous usage counts</Text>
      <Switch
        testID="usage-switch"
        accessibilityLabel="Send anonymous usage counts"
        value={on}
        onValueChange={v => {
          setOn(v)
          setUsageEnabled(v)
        }}
      />
    </View>
  )
}

function Link({ href, children }: { href: string; children: string }) {
  const c = useColors()
  return (
    <Text style={{ color: c.accent, fontWeight: '600' }} onPress={() => openBrowserAsync(href)} accessibilityRole="link">
      {children}
    </Text>
  )
}

export default function About() {
  const c = useColors()
  const { exportBackup, importBackup, hasData } = useBackup()
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: space.lg, gap: space.md }}>
      <Body>
        <Link href="https://lukeboyle.com">Luke Boyle</Link> made Debt Destroyer. Many people cannot see a light at the end
        of their debt tunnel. This app shows you, accurately, that you can be debt free with your current budget.
      </Body>
      <Body muted>
        To report a problem, go to <Link href="https://github.com/3stacks/debt-destroyer">github.com/3stacks/debt-destroyer</Link>.
      </Body>
      <Body muted>
        If you do not know where to start, <Link href="https://www.amazon.com/Dave-Ramsey/e/B000APQ02W">Dave Ramsey</Link> has
        many books for beginners. The Total Money Makeover is a good first book.
      </Body>
      <Body muted>
        To find more money for your debts, look for expenses that you can cut. A daily latte is probably not the problem.
        Larger hidden costs are more likely: a gym membership that you do not use, smoking, or many streaming subscriptions.
      </Body>
      <SectionHeader title="Your data" />
      <Body muted>
        Your debts stay on this device. The app does not send them anywhere. If you lose the device or delete the app,
        you lose your plan. Save a backup file, and keep it in a safe place. To move your plan to a new device, import
        the file there.
      </Body>
      {hasData ? <Button testID="backup-export" title="Save a backup" variant="secondary" onPress={exportBackup} /> : null}
      <Button testID="backup-import" title="Import a backup" variant="secondary" onPress={importBackup} />
      <Body muted>
        The backup is a JSON file. You can open it in any text editor.
      </Body>
      {Platform.OS !== 'web' ? (
        <>
          <SectionHeader title="Usage counts" />
          <UsageSwitch />
          <Body muted>
            Each day that you open the app, it sends one count: your platform, the app version, your language, and
            whether you have a plan. The count has no ID and none of your numbers. It tells us how many people use the
            app, and in which countries.
          </Body>
        </>
      ) : null}
      <Body muted>
        Debt Destroyer is free. If it helps you, you can support it on <Link href="https://ko-fi.com/lukeboyle">Ko-fi</Link>.
      </Body>
      <Button title="OK" onPress={() => router.back()} />
    </ScrollView>
  )
}
