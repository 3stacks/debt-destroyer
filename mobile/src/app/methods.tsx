import { openBrowserAsync } from 'expo-web-browser'
import { ScrollView, Text } from 'react-native'
import { Body, Card, Em } from '../components/ui'
import { space, useColors } from '../lib/theme'

function Link({ href, children }: { href: string; children: string }) {
  const c = useColors()
  return (
    <Text style={{ color: c.accent, fontWeight: '600' }} onPress={() => openBrowserAsync(href)} accessibilityRole="link">
      {children}
    </Text>
  )
}

export default function Methods() {
  const c = useColors()
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: space.lg, gap: space.md }}>
      <Card>
        <Body>
          <Em color={c.text}>Snowball</Em> sorts debts from the lowest to the highest balance.
        </Body>
        <Body>
          <Em color={c.text}>Avalanche</Em> (or stack) sorts debts from the highest to the lowest interest rate.
        </Body>
      </Card>
      <Body muted>
        Avalanche costs the least, because you pay less interest in total. The difference is small when all your debts
        have low rates, or when you pay them off quickly.
      </Body>
      <Body muted>
        Snowball costs more, but each closed account is a win that keeps you motivated. For most people, that makes it the
        best method.
      </Body>
      <Body muted>
        Dave Ramsey made the snowball method popular. Harvard Business Review research found that it is the best strategy to
        pay off credit card debt: <Link href="https://hbr.org/2016/12/research-the-best-strategy-for-paying-off-credit-card-debt">HBR article</Link>.
      </Body>
      <Body muted>
        For more information, read the{' '}
        <Link href="https://www.investopedia.com/articles/personal-finance/080716/debt-avalanche-vs-debt-snowball-which-best-you.asp">
          Investopedia article
        </Link>
        .
      </Body>
    </ScrollView>
  )
}
