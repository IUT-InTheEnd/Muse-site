<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>test</title>
    @vite('resources/css/app.css')
</head>
<body>
    <div class="-z-10 backgroundimg-container">
        <div class="gradient"></div>
        <img class="background-image"src="{{$artist->artist_image_file}}">
    </div>
    <div class="flex flex-col ml-20 gap-24">
        <div class="flex flex-col z-30">
            <h1>{{$artist->artist_name}}</h1>
            <div class="flex flex-row gap-2">
                <x-primary-button>
                    Écouter
                </x-primary-button>
                <x-primary-button>
                    Suivre
                </x-primary-button>
            </div>
        </div>
        <div class="flex flex-row flex-wrap justify-center gap-32">
            <div class="flex flex-col">
                <h2>Dernier album</h2>
                <div class="size-50 bg-black"></div>
            </div>
            <div class="flex flex-col">
                <h2>Dernier Musique</h2>
                <div class="size-50 bg-black"></div>
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
                        <svg class="clock-icon size-4" viewBox="0 0 16 16">
                            <path d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/>
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                        </svg>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr class="music-row">
                    <td>1</td>  
                    <td>
                        <div class="image_track_info">
                            <div class="size-12 bg-black"></div>
                            <div class="track-info">
                                <span class="track-name">In The End</span>
                                <span class="album-name">HYBRID THEORY</span>
                            </div>
                        </div>
                    </td>
                    <td>1010200310</td>
                    <td>3:36</td>
                </tr>
                <tr class="music-row">
                    <td>1</td>  
                    <td>
                        <div class="image_track_info">
                            <div class="size-12 bg-black"></div>
                            <div class="track-info">
                                <span class="track-name">In The End</span>
                                <span class="album-name">HYBRID THEORY</span>
                            </div>
                        </div>
                    </td>
                    <td>1010200310</td>
                    <td>3:36</td>
                </tr>
                <tr class="music-row">
                    <td>1</td>  
                    <td>
                        <div class="image_track_info">
                            <div class="size-12 bg-black"></div>
                            <div class="track-info">
                                <span class="track-name">In The End</span>
                                <span class="album-name">HYBRID THEORY</span>
                            </div>
                        </div>
                    </td>
                    <td>1010200310</td>
                    <td>3:36</td>
                </tr>


            </tbody>
        </table>
        <h2>Discographie</h2>
        <div class="flex flex-row">

        </div>
    </div>
</body>
</html>