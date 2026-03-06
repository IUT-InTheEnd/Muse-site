import { Slider } from "./Slider"

type MixedSliderProps = {
  title?: string
  children: React.ReactNode
}

export function MixedSlider({
  title,
  children,
}: MixedSliderProps) {
  return (
    <Slider title={title}>
      {children}
    </Slider>
  )
}


// utilisation :

{/* <MixedSlider title="Récemment écouté">
  <AlbumCard ... />
  <PlaylistCard ... />
  <ArtistCard ... />
  <MusicCard ... />
</MixedSlider> */}
