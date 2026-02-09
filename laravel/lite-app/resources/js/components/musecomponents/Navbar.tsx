import React from 'react'
import type { User } from '@/types'
import { Button } from '../ui/button'
import { Link } from '@inertiajs/react'
import { Avatar } from '@radix-ui/react-avatar'

type NavbarProps = {
  user?: User | null
}

const Navbar = ({ user }: NavbarProps) => {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 p-4">
      {/* Left */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/">
          <img src="/logo.svg" alt="logo" />
        </Link>
        {user && (
          <>
            <div className="hidden sm:block">
              <p>search</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/" title="Accueil" className="hover:underline">Accueil</a>
              <a href="/favoris" title="Favoris" className="hover:underline">Favoris</a>
              <a href="/decouverte" title="Découverte" className="hover:underline">Découvrir</a>
            </div>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {user ? (
          <>
            <a href="/profile" className="hover:underline">Mon profil</a>
            <Avatar>
              <img src={user.avatar} alt="Photo de profil" width={32} height={32} className="rounded-full" />
            </Avatar>
          </>
        ) : (
          <>
            <a href="/register" className="hover:underline">Inscription</a>
            <Button>
              <Link href="/login" className='text-white'>
                Connexion
              </Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
