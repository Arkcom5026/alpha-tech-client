import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReturnableSales } from '../api/saleReturnApi';
import SaleReturnHelpDrawer from '../help/SaleReturnHelpDrawer';
import { filterReturnableSales } from '../search/policies/filterReturnableSales';
import SaleReturnSearchWorkspace from '../search/workspace/SaleReturnSearchWorkspace';

const ReturnSearchPage = () => {
  const navigate = useNavigate();
  const { shopSlug = 'advancetech' } = useParams();
  const [sales, setSales] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    getReturnableSales().then(setSales).catch((err) => setError(err.response?.data?.message || err.message));
  }, []);

  const filtered = useMemo(() => filterReturnableSales(sales, query), [query, sales]);

  const handleSelectSale = (sale) => {
    navigate(`/${shopSlug}/pos/sales/sale-return/create/${sale.id}`);
  };

  return (
    <>
      <SaleReturnSearchWorkspace
        query={query}
        onQueryChange={setQuery}
        sales={filtered}
        error={error}
        helpLabel="คู่มือ"
        onSelectSale={handleSelectSale}
        onOpenHelp={() => setHelpOpen(true)}
      />
      <SaleReturnHelpDrawer open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default ReturnSearchPage;
