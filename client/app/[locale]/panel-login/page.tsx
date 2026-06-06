'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from 'rsuite';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<boolean>(false)

  const router = useRouter();
  const t = useTranslations('login');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (res.ok) {
        router.push('/panel');
      } else {
        setError(t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
    >
      <form
        onSubmit={handleLogin}
        className="bg-opacity-30 backdrop-blur-sm shadow-xl rounded px-8 pt-6 pb-8 w-full max-w-sm"
      >
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="mb-4">
          <label className="block text-white" style={{color: 'rgb(254 239 196)'}}>{t('username')}</label>
          <input
            className="border rounded w-full px-3 py-2 bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-white" style={{color: 'rgb(254 239 196)'}}>{t('password')}</label>
          <input
            type="password"
            className="border rounded w-full px-3 py-2 bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="bg-opacity-70 text-white px-4 py-2 rounded w-full hover:bg-opacity-90 transition cursor-pointer"
          style={{backgroundColor: '#e77891ff'}}
          loading={loading}
        >
          {t('button')}
        </Button>
      </form>
    </div>
  );
}
