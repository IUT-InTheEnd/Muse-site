import { Card } from "@/components/musecomponents/cards/Card"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { CardVariants } from "@/components/musecomponents/cards/Card"


type CardProps = ComponentProps<"div"> & VariantProps<typeof CardVariants>

export function PlaylistCard(props: CardProps) {
  return (
    <Card
      type="playlist"
      variant="playlist"
      {...props}
    />
  )
}


// utilisation :

{/* 
<PlaylistCard>
  <Link href="/playlists/1">
    <CardCover src="/playlist.jpg" />
    <CardContent>
      <CardTitle>Road trip</CardTitle>
    </CardContent>
  </Link>
</PlaylistCard> 
*/}