


// ✅ src/features/product/components/ProductTable.jsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Generic action button (ให้รูปแบบเดียวกับ ProductTemplateTable)
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

  // ✅ Edit
  onEdit,

  // ✅ Delete (SUPERADMIN only)
  onDelete,
  deleting,
  canDelete = false,

  density = 'normal',

}) => {
  const handleEdit = onEdit;

  // deleting อาจเป็น boolean หรือเป็น id ที่กำลังทำงานอยู่
  const isDeleting = (id) => (typeof deleting === 'boolean' ? deleting : String(deleting) === String(id));

  const resolveActive = (row) => {
    // ✅ normalize active flag (boolean / 0-1 / string)
    const raw = row?.active ?? row?.isActive ?? row?.enabled;
    if (typeof raw === 'boolean') return raw;
    if (raw === 0 || raw === '0') return false;
    if (raw === 1 || raw === '1') return true;
    if (row?.status) return String(row.status).toUpperCase() !== 'INACTIVE';
    if (row?.deletedAt) return false;
    return true;
  };

  const rowClass = density === 'compact' ? 'text-xs' : 'text-sm';
  const cellPad = density === 'compact' ? 'py-1' : 'py-2';

  const colCount = 11; // แสดงราคาทั้งหมดเสมอ (ทุน/ส่ง/ช่าง/ปลีก/ออนไลน์)

  // ✅ Price formatter (production UX):
  // - null/undefined/''/0 -> show em dash with muted style ("no price")
  // - number -> Thai format with tabular nums
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
    return <span className={isMissing ? 'opacity-50' : ''}>{text}</span>;
  };

  // ✅ Resolve price source (BranchPrice) - support multiple response shapes
  // Expected DB fields: costPrice, priceWholesale, priceTechnician, priceRetail, priceOnline
  const resolveBranchPrice = (item) => {
    // Common shapes from BE
    if (!item || typeof item !== 'object') return null;

    // 1) flat fields already merged onto item
    const hasFlat =
      item.costPrice != null ||
      item.priceRetail != null ||
      item.priceOnline != null ||
      item.priceWholesale != null ||
      item.priceTechnician != null;
    if (hasFlat) return item;

    // 2) nested single object
    const single = item.branchPrice || item.branchPriceRef || item.branchPriceByBranch || item.price || null;
    if (single && typeof single === 'object') return single;

    // 3) nested array (pick first; upstream should filter by branchId)
    const arr = item.branchPrices || item.branchPriceList || item.prices || null;
    if (Array.isArray(arr) && arr.length > 0) return arr[0];

    return null;
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className={rowClass}>
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-zinc-50/70 dark:bg-zinc-800/40">
            <TableHead className="text-center w-[150px] text-zinc-700 dark:text-zinc-200">หมวดหมู่สินค้า (category)</TableHead>
            <TableHead className="text-center w-[130px] text-zinc-700 dark:text-zinc-200">ประเภทสินค้า (productType)</TableHead>
            <TableHead className="text-center w-[130px] text-zinc-700 dark:text-zinc-200">แบรนด์ (brand)</TableHead>
            <TableHead className="text-center w-[160px] text-zinc-700 dark:text-zinc-200">SKU/รุ่น (sku/model)</TableHead>
            <TableHead className="text-left w-[180px] text-zinc-700 dark:text-zinc-200">ชื่อสินค้า (name)</TableHead>

            {/* ตัวเลข: ให้ชิดขวาเสมอ */}
            {
              <>
                <TableHead className="text-right w-[90px] tabular-nums text-zinc-700 dark:text-zinc-200">ราคาทุน</TableHead>
                <TableHead className="text-right w-[100px] tabular-nums text-zinc-700 dark:text-zinc-200">ราคาส่ง</TableHead>
                <TableHead className="text-right w-[100px] tabular-nums text-zinc-700 dark:text-zinc-200">ราคาช่าง</TableHead>
              </>
            }
            <TableHead className="text-right w-[100px] tabular-nums text-zinc-700 dark:text-zinc-200">ราคาปลีก</TableHead>
            <TableHead className="text-right w-[110px] tabular-nums text-zinc-700 dark:text-zinc-200">ราคาออนไลน์</TableHead>

            <TableHead className="text-right w-[200px] text-zinc-700 dark:text-zinc-200 sticky right-0 z-20 bg-white dark:bg-zinc-900">จัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.isArray(products) && products.length > 0 ? (
            products.map((item) => {
              const isActive = resolveActive(item);

              return (
                <TableRow
                  key={item.id}
                  className={`hover:bg-zinc-50/40 dark:hover:bg-zinc-800/30 ${rowClass} ${!isActive ? 'opacity-60' : ''}`}
                >
                  <TableCell className={`text-center ${cellPad}`}>{item?.category ?? item?.categoryName ?? item?.categoryLabel ?? item?.categoryRef?.name ?? item?.categoryRef?.label ?? item?.category?.name ?? '-'}</TableCell>
                  <TableCell className={`text-center ${cellPad}`}>{item?.productType ?? item?.productTypeName ?? item?.typeName ?? item?.productTypeRef?.name ?? item?.productTypeRef?.label ?? item?.productType?.name ?? '-'}</TableCell>
                  <TableCell className={`text-center ${cellPad}`}>{item?.brand ?? item?.brandName ?? item?.brandLabel ?? item?.brandRef?.name ?? item?.brand?.name ?? '-'}</TableCell>

                  {/* ✅ โปรไฟล์สินค้า */}
                  <TableCell className={`text-center ${cellPad}`}>{item.sku || item.model || item.spec || '-'}</TableCell>

                  <TableCell className={`text-left ${cellPad}`}>
                    <div className="flex items-center gap-2">
                      <span>{item.name || '-'}</span>
                    </div>
                  </TableCell>

                
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.costPrice ?? item.costPrice)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.priceWholesale ?? item.priceWholesale)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.priceTechnician ?? item.priceTechnician)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.priceRetail ?? item.priceRetail)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{priceCell(resolveBranchPrice(item)?.priceOnline ?? item.priceOnline)}</TableCell>

                  <TableCell className={`px-4 ${cellPad} text-right whitespace-nowrap sticky right-0 z-10 bg-white dark:bg-zinc-900`}>
                    <div className="inline-flex items-center gap-2 justify-end min-w-[220px]">
                      <ActionButton
                        className="border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-400"
                        onClick={() => handleEdit?.(item.id)}
                        disabled={!handleEdit}
                        title="แก้ไขสินค้า"
                      >
                        แก้ไข
                      </ActionButton>

                      {/* ✅ Policy: ห้ามปิดใช้งานจาก POS (Product เป็น Global master data) */}

                      {canDelete ? (
                        <ActionButton
                          className="text-white bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
                          onClick={() => onDelete?.(item.id)}
                          disabled={!onDelete || isDeleting(item.id)}
                          title="ลบถาวร (เฉพาะ SUPERADMIN)"
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
            <TableRow>
              <TableCell colSpan={colCount} className="text-center text-zinc-500 dark:text-zinc-400 py-10">
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














