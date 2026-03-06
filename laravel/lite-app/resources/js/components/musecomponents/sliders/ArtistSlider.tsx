import type { ReactElement } from "react"
import type { ArtistCard } from "@/components/musecomponents/cards/ArtistCard"
import { Slider } from "./Slider"

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
