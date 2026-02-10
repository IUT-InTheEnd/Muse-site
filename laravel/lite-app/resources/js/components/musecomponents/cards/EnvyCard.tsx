import { Card } from "@/components/musecomponents/cards/Card"
import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { CardVariants } from "@/components/musecomponents/cards/Card"

type CardProps = ComponentProps<"div"> & VariantProps<typeof CardVariants>

export function EnvyCard(props: CardProps) {
  return (
    <Card
      type="envies"
      variant="envies"
      {...props}
    />
  )
}


//utilisation : 

{/* 
<EnvyCard >
  <Link href="/playlist-favoris">
    <CardCover src="/envie.jpg" />

    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <CardIcon>svg</CardIcon>
      <CardTitle>Favoris</CardTitle>
    </div>

    <CardContent>
      <CardSubtitle>Titres favoris</CardSubtitle>
    </CardContent>
  </Link>
</EnvyCard> 
*/}