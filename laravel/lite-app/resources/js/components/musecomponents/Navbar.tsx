import React from 'react'
import type { User } from '@/types'
import { Button } from '../ui/button'
import { Link } from '@inertiajs/react'

type NavbarProps = {
  user?: User | null
}

const Navbar = ({ user }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-6">
        <img src="/logo.svg" alt="logo"/>
        {user && (
          <>
            <div>
              <p>search</p>
            </div>
            <div className="flex gap-4">
              <a href="/" title="Accueil">Accueil</a>
              <a href="/favoris" title="Favoris">Favoris</a>
              <a href="/decouverte" title="Découverte">Découvrir</a>
            </div>
          </>
        )}
      </div>

      {/* Right */}
      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <a href="/profile">Mon profil</a>
            <img src={user.avatar} alt="Photo de profil" width={32} height={32} className="rounded-full" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <a href="/register">Inscription</a>
            <Button>
              <Link href="/login" className='text-white'>
                Connexion
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
