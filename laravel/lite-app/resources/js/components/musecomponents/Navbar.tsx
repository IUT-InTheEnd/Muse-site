import React, { useState } from 'react'
import type { User } from '@/types'
import { Button } from '../ui/button'
import { Link } from '@inertiajs/react'
import { Avatar } from '@radix-ui/react-avatar'
import { Search, Menu, X } from 'lucide-react'

type NavbarProps = {
  user?: User | null
}

const Navbar = ({ user }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="gap-4 sm:p-4 p-6">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <img src="/logo.svg" alt="logo" className="h-8" />
          </Link>

          {user && (
            <>
              <div className="hidden sm:flex items-center relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-3 pr-10 py-1 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none w-64"
                />
                <Search className="absolute right-1 top-1/2 -translate-y-1/2 p-1" />
              </div>

              <div className="hidden sm:flex gap-4 text-sm">
                <a href="/" className="hover:underline">Accueil</a>
                <a href="/favoris" className="hover:underline">Favoris</a>
                <a href="/decouverte" className="hover:underline">Découvrir</a>
              </div>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden sm:flex items-center gap-4">
              <a href="/profile" className="hover:underline">Mon profil</a>
              <Avatar>
                <img src={user.avatar} alt="Photo de profil" width={32} height={32} className="rounded-full" />
              </Avatar>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <a href="/register" className="hover:underline">Inscription</a>
              <Button>
                <Link href="/login" className="text-white">Connexion</Link>
              </Button>
            </div>
          )}

          {/* bouton menu burger */}
          <button
            className="sm:hidden p-2 rounded-md hover:bg-gray-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* mobile */}
      {isOpen && (
        <div className="sm:hidden mt-4 flex flex-col gap-4">
          {user && (
            <>
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-3 pr-10 py-1 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none w-full"
              />
              <a href="/" className="hover:underline">Accueil</a>
              <a href="/favoris" className="hover:underline">Favoris</a>
              <a href="/decouverte" className="hover:underline">Découvrir</a>
              <a href="/profile" className="hover:underline">Mon profil</a>
            </>
          )}
          {!user && (
            <>
              <a href="/register" className="hover:underline">Inscription</a>
              <Button>
                <Link href="/login" className="text-white">Connexion</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
