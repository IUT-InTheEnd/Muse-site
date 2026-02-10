import { Slider } from "./Slider"
import type { ReactElement } from "react"
import type { AlbumCard } from "@/components/musecomponents/cards/AlbumCard"

type AlbumSliderProps = {
  title?: string
  children: ReactElement<typeof AlbumCard>[]
}

export function AlbumSlider({
  title,
  children,
}: AlbumSliderProps) {
  return (
    <Slider title={title}>
      {children}
    </Slider>
  )
}
