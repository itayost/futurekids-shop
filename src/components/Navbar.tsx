'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

  return (
    <>
      <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-3xl font-black text-black tracking-tighter hover:text-pink-500 transition"
          >
            Future<span className="text-pink-500">Kids</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 space-x-reverse font-bold text-lg items-center">
            <Link href="/" className="hover:text-pink-500">
              החנות
            </Link>
            <Link href="/content" className="hover:text-pink-500">
              הופעות ומאמרים
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition relative"
            >
              <ShoppingCart size={20} />
              סל קניות
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
              className="flex items-center gap-2 bg-black text-white p-3 rounded-lg relative"
              aria-label="סל קניות"
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
              className="flex items-center bg-black text-white p-3 rounded-lg"
              aria-label="תפריט"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      {menuOpen && (
        <div className={`fixed inset-0 bg-black z-[60] flex flex-col ${isMenuClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b-4 border-pink-500">
            <span className="text-3xl font-black text-white">
              Future<span className="text-pink-500">Kids</span>
            </span>
            <button
              onClick={handleCloseMenu}
              className="p-3 text-white hover:bg-gray-800 rounded-lg transition"
              aria-label="סגור תפריט"
            >
              <X size={28} />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-1 flex flex-col justify-center items-center gap-2 p-6">
            <Link
              href="/"
              onClick={handleCloseMenu}
              className="text-white text-3xl font-black py-6 px-8 hover:text-pink-500 transition w-full text-center"
            >
              החנות
            </Link>
            <Link
              href="/content"
              onClick={handleCloseMenu}
              className="text-white text-3xl font-black py-6 px-8 hover:text-pink-500 transition w-full text-center"
            >
              הופעות ומאמרים
            </Link>
            <button
              onClick={() => {
                handleCloseMenu();
                setTimeout(() => setIsOpen(true), 200);
              }}
              className="text-white text-3xl font-black py-6 px-8 hover:text-pink-500 transition w-full text-center flex items-center justify-center gap-3"
            >
              <ShoppingCart size={28} />
              סל קניות
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
