'use client';

import dynamic from 'next/dynamic';

const KeverdTracker = dynamic(() => import('./KeverdProvider'), { ssr: false });

export default function KeverdLoader() {
  return <KeverdTracker />;
}
