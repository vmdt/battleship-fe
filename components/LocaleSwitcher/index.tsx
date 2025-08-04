'use client';

import {useLocale, useTranslations} from 'next-intl';
import {Locale} from '@/i18n/config';
import {setUserLocale} from '@/services/locale';
import {useTransition} from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface LocaleSwitcherProps {
  collapsed?: boolean;
}

export default function LocaleSwitcher({ collapsed }: LocaleSwitcherProps) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  const [, startTransition] = useTransition();
  
  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" {...(collapsed ? { size: 'icon' } : {})}>{t(`${collapsed ? `${locale}_icon` : locale}`)}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onChange('en')}>{t('en')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('vi')}>{t('vi')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}