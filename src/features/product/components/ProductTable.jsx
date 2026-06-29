import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const ActionButton = ({ children, className = '', type = 'button', ...rest }) => (
  <button
    type={type}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const ProductTable = ({
  products = [],
  onEdit,
  onDelete,
  deleting,
  canDelete = false,
  density = 'normal',
  productTypes = [],
}) => {
  const handleEdit = onEdit;
  const isDeleting = (id) => (typeof deleting === 'boolean' ? deleting : String(deleting) === String(id));

  const resolveActive = (row) => {
    const raw = row?.active ?? row?.isActive ?? row?.enabled;
    if (typeof raw === 'boolean') return raw;
    if (raw === 0 || raw === '0') return false;
    if (raw === 1 || raw === '1') return true;
    if (row?.status) return String(row.status).toUpperCase() !== 'INACTIVE';
    if (row?.deletedAt) return false;
    return true;
  };

  const rowClass = density === 'compact' ? 'text-xs' : 'text-sm';
  const cellPad = density === 'compact' ? 'py-1.5 px-3' : 'py-3 px-4';
  const colCount = 9; 

  const toNumOrNull = (v) => {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return n;
  };

  const priceCell = (v) => {
    const n = toNumOrNull(v);
    const isMissing = n == null || n === 0;
    const text = isMissing ? '—' : n.toLocaleString('th-TH');
    return <span className={isMissing ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-100 font-medium'}>{text}</span>;
  };

  const resolveBranchPrice = (item) => {
    if (!item || typeof item !== 'object') return null;
    const hasFlat =
      item.costPrice != null ||
      item.priceRetail != null ||
      item.priceOnline != null ||
      item.priceWholesale != null ||
      item.priceTechnician != null;
    if (hasFlat) return item;

    const single = item.branchPrice || item.branchPriceRef || item.branchPriceByBranch || item.price || null;
    if (single && typeof single === 'object') return single;

    const arr = item.branchPrices || item.branchPriceList || item.prices || null;
    if (Array.isArray(arr) && arr.length > 0) return arr[0];

    return null;
  };

  const resolveProductTypeName = (item) => {
    if (typeof item?.productType === 'string' && item.productType.trim()) return item.productType;
    if (item?.productType?.name) return item.productType.name;
    if (item?.productTypeName) return item.productTypeName;
    if (item?.typeName) return item.typeName;

    const productTypeId = item?.productTypeId ?? item?.productType?.id ?? item?.product_type_id;
    if (productTypeId != null && Array.isArray(productTypes)) {
      const found = productTypes.find((type) => Number(type?.id) === Number(productTypeId));
      if (found?.name) return found.name;
    }

    return '-';
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl">
      <Table className={`${rowClass} min-w-[980px] border-collapse`}>
        <TableHeader className="bg-zinc-100 dark:bg-zinc-800/80 sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className={`text-center font-semibold text-zinc-800 dark:text-zinc-200 ${cellPad}`}>ประเภทสินค้า</TableHead>
            <TableHead className={`text-center font-semibold text-zinc-800 dark:text-zinc-200 ${cellPad}`}>แบรนด์</TableHead>
            <TableHead className={`text-left font-semibold text-zinc-800 dark:text-zinc-200 ${cellPad}`}>ชื่อสินค้า</TableHead>
            <TableHead className={`text-right font-semibold text-zinc-800 dark:text-zinc-200 ${cellPad} tabular-nums`}>ราคาทุน</TableHead>
            <TableHead className={`text-right font-semibold text-zinc-800 dark:text-zinc-200 ${cellPad} tabular-nums`}>ราคาส่ง</TableHead>
            <TableHead className={`text-right font-semibold text-zinc-800 dark:text-zinc-200 ${cellPad} tabular-nums`}>ราคาช่าง</TableHead>
            <TableHead className={`text-right font-semibold text-zinc-800 dark:text-zinc-200 ${cellPad} tabular-nums`}>ราคาปลีก</TableHead>
            <TableHead className={`text-right font-semibold text-zinc-800 dark:text-zinc-200 ${cellPad} tabular-nums`}>ราคาออนไลน์</TableHead>
            <TableHead className={`text-right font-semibold text-zinc-800 dark:text-zinc-200 sticky right-0 z-20 bg-zinc-100 dark:bg-zinc-800/90 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] ${cellPad}`}>จัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.isArray(products) && products.length > 0 ? (
            products.map((item) => {
              const isActive = resolveActive(item);

              return (
                <TableRow
                  key={item.id}
                  className={`bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors border-zinc-200 dark:border-zinc-800 ${rowClass} ${!isActive ? 'opacity-50' : ''}`}
                >
                  <TableCell className={`text-center text-zinc-700 dark:text-zinc-300 ${cellPad}`}>{resolveProductTypeName(item)}</TableCell>
                  <TableCell className={`text-center text-zinc-700 dark:text-zinc-300 ${cellPad}`}>{item?.brand ?? item?.brandName ?? '-'}</TableCell>
                  <TableCell className={`text-left font-medium text-zinc-900 dark:text-zinc-100 ${cellPad}`}>{item.name || '-'}</TableCell>
                  
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.costPrice ?? item.costPrice)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.priceWholesale ?? item.priceWholesale)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.priceTechnician ?? item.priceTechnician)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.priceRetail ?? item.priceRetail)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.priceOnline ?? item.priceOnline)}</TableCell>

                  <TableCell className={`text-right whitespace-nowrap sticky right-0 z-10 bg-white dark:bg-zinc-900 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.15)] ${cellPad}`}>
                    <div className="inline-flex items-center gap-2 justify-end">
                      <ActionButton
                        className="border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:ring-zinc-400"
                        onClick={() => handleEdit?.(item.id)}
                        disabled={!handleEdit}
                      >
                        แก้ไข
                      </ActionButton>

                      {canDelete ? (
                        <ActionButton
                          className="text-white bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 shadow-sm"
                          onClick={() => onDelete?.(item.id)}
                          disabled={!onDelete || isDeleting(item.id)}
                        >
                          {isDeleting(item.id) ? 'กำลังลบ…' : 'ลบ'}
                        </ActionButton>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow className="bg-white dark:bg-zinc-900">
              <TableCell colSpan={colCount} className="text-center text-zinc-500 dark:text-zinc-400 font-medium py-12">
                ไม่พบข้อมูลสินค้า
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;