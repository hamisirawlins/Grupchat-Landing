'use client';

import { KeverdProvider, useKeverd } from '@keverdjs/react';

function KeverdLogger() {
  const { deviceId, riskScore, isLoading } = useKeverd();

  // if (!isLoading) {
  //   console.log({ deviceId, riskScore, isLoading });
  // }

  return null;
}

export default function KeverdTracker() {
  return (
    <KeverdProvider apiKey={process.env.NEXT_PUBLIC_KEVERD_TOKEN}>
      <KeverdLogger />
    </KeverdProvider>
  );
}
