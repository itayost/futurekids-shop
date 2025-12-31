'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from './CartProvider';

export default function Navbar() {
  const { itemCount, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  // Reset closing state when menu opens
  useEffect(() => {
    if (menuOpen) {
      setIsMenuClosing(false);
    }
  }, [menuOpen]);

  const handleCloseMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setMenuOpen(false);
    }, 200); // Match fade-out animation duration
  };

  const navLinks = [
    { href: '/', label: 'הספרים' },
    { href: '/games', label: 'משחקים אינטראקטיביים' },
    { href: '/lessons', label: 'מערכי שיעור' },
    { href: '/content', label: 'בתקשורת' },
    { href: '/contact', label: 'צור קשר' },
  ];

  return (
    <>
      <nav className="bg-white border-b-4 border-[#545454] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="KidCode"
              width={140}
              height={45}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 space-x-reverse font-bold text-base items-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-pink-500">
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-[#545454] text-white px-5 py-2 rounded-lg hover:bg-gray-600 transition relative mr-4"
            >
              <ShoppingCart size={20} />
              הסל שלי
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-badge-bounce"
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-[#545454] text-white p-3 rounded-lg relative"
              aria-label="הסל שלי"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-badge-bounce"
                >
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center bg-[#545454] text-white p-3 rounded-lg"
              aria-label="תפריט"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      {menuOpen && (
        <div className={`fixed inset-0 bg-[#545454] z-[60] flex flex-col ${isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b-4 border-pink-500">
            <Image
              src="/logo.png"
              alt="KidCode"
              width={140}
              height={45}
              className="h-10 w-auto brightness-0 invert"
            />
            <button
              onClick={handleCloseMenu}
              className="p-3 text-white hover:bg-gray-600 rounded-lg transition"
              aria-label="סגור תפריט"
            >
              <X size={28} />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-1 flex flex-col justify-center items-center gap-2 p-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleCloseMenu}
                className="text-white text-2xl font-black py-4 px-8 hover:text-pink-500 transition w-full text-center"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                handleCloseMenu();
                setTimeout(() => setIsOpen(true), 200);
              }}
              className="text-white text-2xl font-black py-4 px-8 hover:text-pink-500 transition w-full text-center flex items-center justify-center gap-3"
            >
              <ShoppingCart size={24} />
              הסל שלי
              {itemCount > 0 && (
                <span className="bg-pink-500 text-white text-lg font-bold px-3 py-1 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
