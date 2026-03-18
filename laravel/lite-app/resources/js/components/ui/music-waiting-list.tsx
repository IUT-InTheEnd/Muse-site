import { ChevronDownIcon, GripHorizontal } from 'lucide-react';
import * as React from 'react';
import { useMusicPlayer } from '@/hooks/use-music-player';

export default function MusicWaitingList() {
    const { playlist, currentIndex, waitingList, setPlaylist } = useMusicPlayer();

    return (
        <aside className="flex h-120 w-90 flex-col overflow-hidden rounded-tl-2xl border border-neutral-200 bg-neutral-100 px-6 py-4 text-neutral-900 shadow-2xl dark:border-white/10 dark:bg-[#0b1220] dark:text-white">
            <div className="relative">
                <h4 className="mb-4 text-xl font-semibold">File d'attente</h4>
                <button
                    onClick={waitingList}
                    className="absolute cursor-pointer top-2 right-2 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 transition-all duration-200"
                    aria-label="Minimiser la file d'attente"
                >
                    <ChevronDownIcon size={20} className="text-neutral-500 dark:text-white/60" />
                </button>
            </div>

            <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
                {playlist.length === 0 ? (
                    <p className="text-sm text-neutral-500 dark:text-white/60">
                        Aucune piste dans la file d'attente.
                    </p>
                ) : (
                    playlist.map((item, index) => (
                        <div
                            key={`${item.id ?? 'track'}-${index}`}
                            className={`rounded-md p-3 border ${
                                index === currentIndex
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-neutral-200 dark:border-white/10'
                            }
                            ${
                                index < currentIndex
                                    ? 'hidden'
                                    : 'block'
                            }`}
                            onClick={() => setPlaylist(playlist, index)}
                        >
                        {index === currentIndex ? (
                            <p className='text-purple-500 dark:text-purple-400'>En cours</p>
                        ) : null}
                        <div className='flex flex-direction-row items-center'>
                            <div className='flex-1'>
                                <p className="font-medium truncate">
                                    {item.title || 'Titre inconnu'}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-white/60 truncate">
                                    {item.artist || 'Artiste inconnu'}
                                </p>
                            </div>
                            <div className='flex items-center'> 
                                <GripHorizontal /> 
                            </div>
                        </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}
