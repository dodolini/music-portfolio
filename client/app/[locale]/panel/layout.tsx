// app/[locale]/panel/layout.tsx
'use client';
import 'rsuite/dist/rsuite-no-reset.min.css';
import { Navbar, Nav, Sidebar, Sidenav, Footer } from 'rsuite';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('adminPanel');
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const params = useParams();
  const lang = params?.locale as string;

  const handleLogout = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' }
     });
     
     const resp = await response.json()
     if (resp.success) router.push('/panel-login');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="w-full">
        <Navbar appearance="inverse">
          <Navbar.Brand className="pl-4">{t('panelHeader')}</Navbar.Brand>
          <Nav pullRight>
            <Nav.Item>
              <LanguageSwitcher currentLang={lang} />
            </Nav.Item>
            <Nav.Item onClick={handleLogout}>{t('logout')}</Nav.Item>
          </Nav>
        </Navbar>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar className="h-full" width={220} collapsible>
          <Sidenav defaultOpenKeys={['1']} appearance="subtle">
            <Sidenav.Body>
              <Nav>
                <Nav.Item eventKey="1" onClick={() => router.push(`/${lang}/panel/beats`)}>
                  {t('beatsManagement')}
                </Nav.Item>
              </Nav>
            </Sidenav.Body>
          </Sidenav>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>

          <Footer className="text-center p-4 text-sm text-gray-400">
            © {currentYear} NeumyBeats
          </Footer>
        </div>
      </div>
    </div>
  );
}
