'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseAuth } from '@/lib/supabase-auth';
import { buttonPrimary, input, label } from '@/components/shared/styles';

type Mode = 'sign-in' | 'sign-up';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseAuth();

      if (mode === 'sign-in') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        router.replace('/');
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // No session means the project requires email confirmation first.
      if (!data.session) {
        setNotice('Account created. Check your email to confirm it, then sign in.');
        setMode('sign-in');
        return;
      }

      router.replace('/');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'sign-in' ? 'sign-up' : 'sign-in'));
    setError(null);
    setNotice(null);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4 transition-colors">
      <div className="w-full max-w-sm">
        <h1 className="font-title text-3xl font-bold text-accent text-center">LogKeep</h1>
        <p className="mt-2 mb-8 text-center font-sans text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {mode === 'sign-in' ? 'Sign in to your library' : 'Create your account'}
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-6 space-y-4 transition-colors"
        >
          <div>
            <label htmlFor="email" className={label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className={input}
            />
          </div>

          <div>
            <label htmlFor="password" className={label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              className={input}
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="font-sans text-sm text-accent" role="status">
              {notice}
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className={`${buttonPrimary} w-full`}>
            {isSubmitting
              ? 'Please wait...'
              : mode === 'sign-in'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="mt-4 w-full font-sans text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-accent transition-colors cursor-pointer"
        >
          {mode === 'sign-in'
            ? 'Need an account? Sign up'
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </main>
  );
}
