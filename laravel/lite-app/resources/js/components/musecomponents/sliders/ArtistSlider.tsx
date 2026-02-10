import { Slider } from "./Slider"
import type { ReactElement } from "react"
import type { ArtistCard } from "@/components/musecomponents/cards/ArtistCard"

type ArtistSliderProps = {
  title?: string
  children: ReactElement<typeof ArtistCard>[]
}

export function ArtistSlider({
  title,
  children,
}: ArtistSliderProps) {
  return (
    <Slider title={title}>
      {children}
    </Slider>
  )
}
