import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import '../globals.css';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// tłumaczone meta
export async function generateMetadata(
  { params }: { params: { locale: string } }
): Promise<Metadata> {
  const parameters = await params;
  const locale =  parameters.locale;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'SEO' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords').split(','),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: locale === 'pl' ? 'pl_PL' : 'en_US',
      type: 'website',
      url: 'https://neumyBeats.pl',
      siteName: 'Producent muzyczny',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const parameters = await params;
  const locale =  parameters.locale;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={'overflow-x-hidden'}>
        <NextIntlClientProvider locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
