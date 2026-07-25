import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PurchaseOrderForm from '../components/PurchaseOrderForm';

const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const [searchText, setSearchText] = useState('');

  const handleBack = useCallback(() => {
    try {
      navigate(-1);
    } catch {
      try {
        navigate(`/${shopSlug}/pos/purchases`);
      } catch {
        // no-op: the main navigation remains available as a fallback.
      }
    }
  }, [navigate, shopSlug]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">สร้างใบสั่งซื้อใหม่</h1>
        <Button variant="outline" onClick={handleBack}>
          ย้อนกลับ
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <PurchaseOrderForm
            searchText={searchText}
            onSearchTextChange={setSearchText}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePurchaseOrderPage;
