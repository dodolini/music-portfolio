'use client';
import { useRouter, usePathname } from 'next/navigation';
import { SelectPicker } from 'rsuite';

const LanguageSwitcher = ({ currentLang }: { currentLang: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const data = [
    { label: 'Polski', value: 'pl' },
    { label: 'English', value: 'en' },
  ];

  const handleChange = (newLang: string | null) => {
    if (!newLang) return;

    const segments = pathname.split('/').filter(Boolean);

    if (segments.length > 0) {
      segments[0] = newLang;
    } else {
      segments.push(newLang);
    }

    const newPath = '/' + segments.join('/');
    router.push(newPath);
  };

  return (
    <SelectPicker
      data={data}
      value={currentLang}
      onChange={handleChange}
      cleanable={false} 
      searchable={false}
      style={{ width: 90 }}
    />
  );
};

export default LanguageSwitcher;
