"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    router.replace(CONFIG.auth.redirectPath);
  }, [router]);

  return null;
}
