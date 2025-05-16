import { Header } from '../../components/Header';
import { RegisterForm } from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <RegisterForm />
      </div>
    </main>
  );
} 