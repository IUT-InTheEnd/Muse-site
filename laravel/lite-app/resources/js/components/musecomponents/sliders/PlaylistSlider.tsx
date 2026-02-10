import { Slider } from "./Slider"
import type { ReactElement } from "react"
import type { PlaylistCard } from "@/components/musecomponents/cards/PlaylistCard"

type PlaylistSliderProps = {
  title?: string
  children: ReactElement<typeof PlaylistCard>[]
}

export function PlaylistSlider({
  title,
  children,
}: PlaylistSliderProps) {
  return (
    <Slider title={title}>
      {children}
    </Slider>
  )
}
