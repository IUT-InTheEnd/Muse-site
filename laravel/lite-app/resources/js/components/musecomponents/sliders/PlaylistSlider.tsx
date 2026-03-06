import type { ReactElement } from "react"
import type { PlaylistCard } from "@/components/musecomponents/cards/PlaylistCard"
import { Slider } from "./Slider"

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
