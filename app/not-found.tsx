
import { getMessages } from 'next-intl/server';
import Link from 'next/link';
import '@/app/globals.css';

export default async function NotFound() {
  const messages = await getMessages();

  const notFoundMessages = messages.NotFoundPage as Record<string, string> || {};

  return (
    <main className="grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
            <p className="text-base font-semibold text-primary">404</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                {notFoundMessages.title || 'Page Not Found'}
            </h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
                {notFoundMessages.description || 'The page you are looking for does not exist.'}
            </p>
            <div className="mt-10">
                <Link 
                    href="/" 
                    className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    {notFoundMessages.goHome || 'Go back to Home'}
                </Link>
            </div>
        </div>
    </main>
  );
} 