'use client';

import React from 'react';
import QRLabelPage from '@/app/qr-labels/page';

const TestQRLabelsPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Testing QR Labels Template</h1>
      <QRLabelPage />
    </div>
  );
};

export default TestQRLabelsPage;
