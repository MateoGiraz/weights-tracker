'use client';

import { Header } from '../../components/Header';
import { LoginForm } from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido a Weights Tracker</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar a tu cuenta</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
} 