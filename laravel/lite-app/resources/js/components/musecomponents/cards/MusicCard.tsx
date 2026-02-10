import { Card } from "@/components/musecomponents/cards/Card"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { CardVariants } from "@/components/musecomponents/cards/Card"

type CardProps = ComponentProps<"div"> & VariantProps<typeof CardVariants>

export function MusicCard({
  type,
  variant,
  ...props
}: CardProps) {
  return (
    <Card
      type="media"
      variant="musique"
      {...props}
    />
  )
}


// utilisation : 

{/* 
<MusicCard>
  <Link href="/musics/1">
    <CardCover src="/images/samurai.jpg" alt="Samurai" />
    <CardContent>
      <CardTitle>Samurai</CardTitle>
      <CardSubtitle>CHPN x MRVNN</CardSubtitle>
    </CardContent>
  </Link>
</MusicCard>
*/}

