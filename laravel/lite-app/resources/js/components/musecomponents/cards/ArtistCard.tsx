import { Card } from "@/components/musecomponents/cards/Card"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { CardVariants } from "@/components/musecomponents/cards/Card"


type CardProps = ComponentProps<"div"> & VariantProps<typeof CardVariants>

export function ArtistCard(props: CardProps) {
  return (
    <Card
      type="artist"
      variant="artist"
      {...props}
    />
  )
}


// utilisation : 

{/* 
<ArtistCard>
  <Link href="/artist/1">
    <CardCover src="/artist.jpg" rounded />
    <CardTitle>Samurai</CardTitle>
  </Link>
</ArtistCard>
*/}
