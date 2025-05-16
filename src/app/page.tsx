'use client';

import { Header } from '../components/Header';
import { FlexibleRoutine } from '../components/FlexibleRoutine';
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Tu Entrenamiento</h1>
          <FlexibleRoutine />
        </div>
      </main>
    </ProtectedRoute>
  );
} 