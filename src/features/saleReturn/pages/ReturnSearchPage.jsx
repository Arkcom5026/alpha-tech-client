import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSaleReturnStore from '@/features/saleReturn/store/saleReturnStore';
import ReturnSearchWorkspace from '../search/ReturnSearchWorkspace';
import filterReturnableSales from '../search/filterReturnableSales';

const ReturnSearchPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { returnableSales, loadReturnableSalesAction } = useSaleReturnStore();

  useEffect(() => {
    if (returnableSales.length === 0) {
      loadReturnableSalesAction();
    }
  }, []);

  const filteredSales = useMemo(
    () => filterReturnableSales(returnableSales, { search, fromDate, toDate }),
    [returnableSales, search, fromDate, toDate],
  );

  const handleCreateReturn = (saleId) => {
    navigate(`/pos/sales/sale-return/create/${saleId}`);
  };

  return (
    <ReturnSearchWorkspace
      search={search}
      fromDate={fromDate}
      toDate={toDate}
      onSearchChange={setSearch}
      onFromDateChange={setFromDate}
      onToDateChange={setToDate}
      sales={filteredSales}
      onCreateReturn={handleCreateReturn}
    />
  );
};

export default ReturnSearchPage;
