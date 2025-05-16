'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { Button } from './ui/Button';

export function Header() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              Weights Tracker
            </Link>
            
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Hoy
              </Link>
              <Link 
                href="/routines" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Rutinas
              </Link>
              <Link 
                href="/exercises" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Ejercicios
              </Link>
            </nav>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menú móvil"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Login/Logout buttons */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {user?.username}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pt-2 pb-4">
            <Link 
              href="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hoy
            </Link>
            <Link 
              href="/routines" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rutinas
            </Link>
            <Link 
              href="/exercises" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ejercicios
            </Link>
            
            {/* Mobile auth actions */}
            <div className="pt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="px-3 py-2 space-y-2">
                  <div className="text-sm text-gray-700">
                    Sesión iniciada como: <span className="font-medium">{user?.username}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 