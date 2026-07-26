import { useId } from 'react'
import svgPaths from '@/imports/Home/svg-2emaajx1tv'

interface BusIconProps {
  size?: number
  color?: string
}

export default function BusIcon({ size = 26, color = '#333333' }: BusIconProps) {
  const id = useId()
  const maskId = `bus-mask-${id.replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 57 57" fill="none">
      <mask fill="white" id={maskId}>
        <path d={svgPaths.p2692d900} />
      </mask>
      <path
        d={svgPaths.p2692d900}
        fill={color}
        mask={`url(#${maskId})`}
        stroke={color}
        strokeWidth="2.4"
      />
    </svg>
  )
}
