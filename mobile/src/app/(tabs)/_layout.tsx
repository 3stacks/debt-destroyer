import { NativeTabs } from 'expo-router/native-tabs'
import { useColors } from '../../lib/theme'

export default function TabsLayout() {
  const c = useColors()
  return (
    <NativeTabs tintColor={c.accent}>
      <NativeTabs.Trigger name="(plan)">
        <NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet.rectangle" md="list_alt" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chart">
        <NativeTabs.Trigger.Label>Chart</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="lightbulb.fill" md="lightbulb" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="invest">
        <NativeTabs.Trigger.Label>Invest</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" md="trending_up" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="vices">
        <NativeTabs.Trigger.Label>Vices</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="cup.and.saucer.fill" md="local_cafe" />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
