import { NetworkCanvas } from '@/components/visualizer/canvas/NetworkCanvas'
import type { NetSnapshot } from '@/types/net'

export function IntroCanvas({ snapshot }: { snapshot: NetSnapshot; variant?: string }) {
  return <NetworkCanvas snapshot={snapshot} />
}
