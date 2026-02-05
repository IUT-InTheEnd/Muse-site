import Navbar from '@/components/Navbar';

export default function Artist({ artist }: any) {
    return (
        <div className="relative min-h-screen">
            <Navbar /> 
            <div className="backgroundimg-container">
                <div className="gradient"></div>
                <img className="background-image" src="/img/images.jpg" alt="Cover"/>
            </div>

            <div className="flex flex-col ml-20 gap-24 pt-48 relative">
                <div className="flex flex-col">
                    <h1 className="text-6xl font-bold text-white mb-4">{artist.artist_name}</h1>
                    <div className="flex flex-row gap-2">
                        <button className="bouton-primary">
                            Écouter
                        </button>
                        <button className="bouton-secondary">
                            Suivre
                        </button>
                    </div>
                </div>

                <div className="flex flex-row flex-wrap justify-center gap-32">
                    <div className="flex flex-col">
                        <h2>Dernier album</h2>
                        <div className="size-50 bg-black"></div>
                    </div>
                    <div className="flex flex-col">
                        <h2>Dernier Musique</h2>
                        <div className="size-50 bg-black"></div>
                    </div>
                </div>

                <h2>Populaire</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>TITRE</th>
                            <th>LECTURES</th>
                            <th>
                                <svg className="clock-icon size-4" viewBox="0 0 16 16">
                                    <path d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/>
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                                </svg>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="music-row">
                            <td>1</td>  
                            <td>
                                <div className="image_track_info">
                                    <div className="size-12 bg-black"></div>
                                    <div className="track-info">
                                        <span className="track-name">In The End</span>
                                        <span className="album-name">HYBRID THEORY</span>
                                    </div>
                                </div>
                            </td>
                            <td>1010200310</td>
                            <td>3:36</td>
                        </tr>
                    </tbody>
                </table>

                <h2>Discographie</h2>
                <div className="flex flex-row">
                </div>
            </div>

        </div>
    );
}