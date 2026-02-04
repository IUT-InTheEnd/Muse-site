import React from 'react'
import type { User } from '@/types'

type NavbarProps = {
  user?: User | null
}

const Navbar = ({ user }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between py-4">
      {/* Left */}
      <div className="flex items-center gap-6">
        <div className="font-bold"><p>logo</p></div>

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
            <a href="/login" className='bouton-primary'>Connexion</a>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
