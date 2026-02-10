import { Card } from "@/components/musecomponents/cards/Card"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { CardVariants } from "@/components/musecomponents/cards/Card"


type CardProps = ComponentProps<"div"> & VariantProps<typeof CardVariants>

export function AlbumCard(props: CardProps) {
  return (
    <Card
      type="media"
      variant="album"
      {...props}
    />
  )
}


// utilisation

{/* 


<AlbumCard>
  <Link href="/albums/12">
    <CardCover src="/images/album.jpg" alt="Les étoiles vagabondes" />
    <CardContent>
      <CardTitle>Les étoiles vagabondes</CardTitle>
      <CardSubtitle>Nekfeu</CardSubtitle>
    </CardContent>
  </Link>
</AlbumCard> 
*/}