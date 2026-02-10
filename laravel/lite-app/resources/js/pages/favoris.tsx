import React from 'react'
import { MixedSlider } from '@/components/musecomponents/sliders/MixedSlider'
import { AlbumCard } from '@/components/musecomponents/cards/AlbumCard'
import { PlaylistCard } from '@/components/musecomponents/cards/PlaylistCard'
import { ArtistCard } from '@/components/musecomponents/cards/ArtistCard'
import { MusicCard } from '@/components/musecomponents/cards/MusicCard'
import { Link } from '@inertiajs/react'
import { CardCover, CardTitle, CardContent, CardSubtitle} from '@/components/musecomponents/cards/Card'

const favoris = () => {
  return (
    <MixedSlider title="Récemment écouté">
        <AlbumCard>
            <Link href="/albums/12">
                <CardCover src="/images/album.jpg" alt="Les étoiles vagabondes" />
                <CardContent>
                    <CardTitle>Les étoiles vagabondes</CardTitle>
                    <CardSubtitle>Nekfeu</CardSubtitle>
                </CardContent>
            </Link>
        </AlbumCard> 
        
    
        <PlaylistCard>
            <Link href="/playlist/1">
                <CardCover src="/playlist.jpg" />
                <CardContent>
                    <CardTitle>Road trip</CardTitle>
                </CardContent>
            </Link>
        </PlaylistCard>

        <ArtistCard>
            <Link href="/artiste/1">
                <CardCover src="/artist.jpg" rounded />
                <CardTitle>Samurai</CardTitle>
            </Link>
        </ArtistCard> 

        <MusicCard>
            <Link href="/musique/1">
                <CardCover src="/images/samurai.jpg" alt="Samurai" />
                <CardContent>
                    <CardTitle>Samurai</CardTitle>
                    <CardSubtitle>CHPN x MRVNN</CardSubtitle>
                </CardContent>
            </Link>
        </MusicCard>
        
    </MixedSlider> 
  )
}

export default favoris