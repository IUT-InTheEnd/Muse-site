import type { ReactElement } from "react"
import type { EnvyCard } from "@/components/musecomponents/cards/EnvyCard"
import { Slider } from "./Slider"

type EnvySliderProps = {
  title?: string
  children: ReactElement<typeof EnvyCard>[]
}

export function EnvySlider({
  title,
  children,
}: EnvySliderProps) {
  return (
    <Slider title={title}>
      {children}
    </Slider>
  )
}
