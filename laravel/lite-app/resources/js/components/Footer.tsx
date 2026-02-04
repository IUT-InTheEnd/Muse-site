import React from 'react'

const Footer = () => {
  return (
    <nav className='grid grid-cols-5 p-2'>
        <p>Logo</p>

        {/* legal */}
        <div className='flex flex-col gap-2'>
            <a href="">Légal</a>
            <div className='flex flex-col'>
                <a href="">Mentions légales</a>
                <a href="">Consentement</a>
            </div>
        </div>

        {/* docs */}
        <div className='flex flex-col gap-2'>
            <a href="">Documentation</a>
            <div className='flex flex-col'>
                <a href="">Installation</a>
                <a href="">API</a>
                <a href="">Utilisation</a>
                <a href="https://laravel.com/docs">Laravel</a>
            </div>
        </div>

        {/* liens */}
        <div className='flex flex-col gap-2'>
            <p>Liens externes</p>
            <div className='flex flex-col'>
                <a href="">IUT de Lannion</a>
            </div>
        </div>

        {/* contact */}
        <div className='flex flex-col gap-2'>
            <p>Contact</p>
            <div className='flex flex-col'>
                <p>7 Rue Édouard Branly 22300 Lannion</p>
                <a href="">Contacter le support</a>
            </div>
        </div>
    </nav>
  )
}

export default Footer
