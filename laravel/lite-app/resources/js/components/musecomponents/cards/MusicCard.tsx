import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import type {
    CardVariants} from '@/components/musecomponents/cards/Card';
import {
    Card,
    CardPlayButton
} from '@/components/musecomponents/cards/Card';

type CardProps = ComponentProps<'div'> &
    VariantProps<typeof CardVariants> & {
        trackId?: number;
    };

export function MusicCard({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    variant,
    trackId,
    children,
    ...props
}: CardProps) {
    return (
        <Card type="media" variant="musique" className="relative" {...props}>
            {children}
            {trackId && <CardPlayButton trackId={trackId} />}
        </Card>
    );
}

// utilisation :

{
    /*
<MusicCard trackId={1}>
  <Link href="/musics/1">
    <CardCover src="/images/samurai.jpg" alt="Samurai" />
    <CardContent>
      <CardTitle>Samurai</CardTitle>
      <CardSubtitle>CHPN x MRVNN</CardSubtitle>
    </CardContent>
  </Link>
</MusicCard>
*/
}
