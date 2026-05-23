// app/[locale]/panel/page.tsx
import { isAuthenticated } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations  } from 'next-intl/server';

export default async function PanelPage() {
  const t = await getTranslations('adminPanel');
  const auth = await isAuthenticated();
  
  if (!auth) redirect('/panel-login');

  return <h1 className="text-2xl font-bold">{t('panelLabel')}</h1>;
}
