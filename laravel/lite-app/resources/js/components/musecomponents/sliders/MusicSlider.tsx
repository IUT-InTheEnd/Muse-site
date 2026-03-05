import type { ReactElement } from "react"
import type { MusicCard } from "@/components/musecomponents/cards/MusicCard"
import { Slider } from "./Slider"

type MusicSliderProps = {
  title?: string
  children: ReactElement<typeof MusicCard>[]
}

export function MusicSlider({
  title,
  children,
}: MusicSliderProps) {
  return (
    <Slider title={title}>
      {children}
    </Slider>
  )
}


// utilisation : 

{/* <MusicSlider title="Titres populaires">
  {tracks.map(track => (
    <MusicCard key={track.id}>
      <Link href={`/musics/${track.id}`}>
        <CardCover src={track.cover} />
        <CardContent>
          <CardTitle>{track.title}</CardTitle>
          <CardSubtitle>{track.artist}</CardSubtitle>
        </CardContent>
      </Link>
    </MusicCard>
  ))}
</MusicSlider> */}