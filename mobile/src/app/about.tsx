import { router } from 'expo-router'
import { openBrowserAsync } from 'expo-web-browser'
import { ScrollView, Text } from 'react-native'
import { Body, Button } from '../components/ui'
import { space, useColors } from '../lib/theme'

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
      <Body muted>
        Your debts stay on this device. The app does not send them anywhere.
      </Body>
      <Body muted>
        Debt Destroyer is free. If it helps you, you can support it on <Link href="https://ko-fi.com/lukeboyle">Ko-fi</Link>.
      </Body>
      <Button title="OK" onPress={() => router.back()} />
    </ScrollView>
  )
}
