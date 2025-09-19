// Quick Receive (Simple) — Minimal Disruption SCAFFOLD
// Note: This is a scaffold ONLY (no business logic). Hook it up to quickReceiveSimpleStore later.
// What we changed vs PO:
// - Removed order date & advance payment
// - Added Preview button (to call /quick-receive/preview)
// - Submit goes to quickReceiveSimpleStore (instead of purchaseOrderStore)
// - Trimmed columns, optional VAT%

// ============================================================================
// File: src/features/quickReceive/pages/QuickReceivePage.jsx
// ============================================================================
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QuickReceiveSimpleForm from '../components/QuickReceiveSimpleForm';

const QuickReceivePage = () => {
  const [searchText, setSearchText] = useState('');
  // force a fresh mount of child form each time this page is opened
  const [instanceKey] = useState(() => `qr-${Date.now()}`);

  // fire a global reset event so any store/listener can clear stale results
  useEffect(() => {
    try { window.dispatchEvent(new CustomEvent('quick-receive:reset')); } catch { /* noop */ }
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">รับสินค้าแบบด่วน (Simple)</h1>
        <Button variant="outline" onClick={() => window.history.back()}>ย้อนกลับ</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <QuickReceiveSimpleForm
            key={instanceKey}
            searchText={searchText}
            onSearchTextChange={setSearchText}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickReceivePage;
