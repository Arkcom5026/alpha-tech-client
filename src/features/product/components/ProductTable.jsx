

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
  // รองรับชื่อ prop เก่า/ใหม่ (กันพลาดเวลา refactor)
  onEdit,
  onDisable,
  onEnable,
  onDisableProduct,
  onEnableProduct,
  // disabling/enabling อาจเป็น boolean หรือเป็น id ที่กำลังทำงานอยู่
  disabling,
  enabling,
  density = 'normal',
  showAllPrices = false,
}) => {
  const handleEdit = onEdit;
  const handleDisable = onDisable || onDisableProduct;
  const handleEnable = onEnable || onEnableProduct;

  const isDisabling = (id) => (typeof disabling === 'boolean' ? disabling : String(disabling) === String(id));
  const isEnabling = (id) => (typeof enabling === 'boolean' ? enabling : String(enabling) === String(id));

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

  const colCount = showAllPrices ? 11 : 8; // หมวด/ประเภท/แบรนด์/สเปก/เทมเพลต/ราคาปลีก/ราคาออนไลน์/จัดการ + (ราคาทุน/ส่ง/ช่าง)

  const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('th-TH') : v ? Number(v).toLocaleString('th-TH') : '-');

  return (
    <div className="w-full overflow-x-auto">
      <Table className={rowClass}>
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-zinc-50/70 dark:bg-zinc-800/40">
            <TableHead className="text-center w-[150px] text-zinc-700 dark:text-zinc-200">หมวดหมู่</TableHead>
            <TableHead className="text-center w-[130px] text-zinc-700 dark:text-zinc-200">ประเภท</TableHead>
            <TableHead className="text-center w-[130px] text-zinc-700 dark:text-zinc-200">แบรนด์</TableHead>
            <TableHead className="text-center w-[160px] text-zinc-700 dark:text-zinc-200">โปรไฟล์</TableHead>
            <TableHead className="text-left w-[180px] text-zinc-700 dark:text-zinc-200">เทมเพลต</TableHead>

            {/* ตัวเลข: ให้ชิดขวาเสมอ */}
            {showAllPrices && (
              <>
                <TableHead className="text-right w-[90px] tabular-nums text-zinc-700 dark:text-zinc-200">ราคาทุน</TableHead>
                <TableHead className="text-right w-[100px] tabular-nums text-zinc-700 dark:text-zinc-200">ราคาส่ง</TableHead>
                <TableHead className="text-right w-[100px] tabular-nums text-zinc-700 dark:text-zinc-200">ราคาช่าง</TableHead>
              </>
            )}
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

                  {showAllPrices && (
                    <>
                      <TableCell className={`text-right tabular-nums ${cellPad}`}>{fmt(item.costPrice)}</TableCell>
                      <TableCell className={`text-right tabular-nums ${cellPad}`}>{fmt(item.priceWholesale)}</TableCell>
                      <TableCell className={`text-right tabular-nums ${cellPad}`}>{fmt(item.priceTechnician)}</TableCell>
                    </>
                  )}

                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{fmt(item.priceRetail)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${cellPad}`}>{fmt(item.priceOnline)}</TableCell>

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

                      {isActive ? (
                        <ActionButton
                          className="text-white bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
                          onClick={() => handleDisable?.(item.id)}
                          disabled={isDisabling(item.id)}
                          title="ปิดใช้งานสินค้า"
                        >
                          ปิดใช้งาน
                        </ActionButton>
                      ) : (
                        <ActionButton
                          className="text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                          onClick={() => {
                          
                          handleEnable?.(item.id);
                        }}
                          disabled={isEnabling(item.id)}
                          title="เปิดใช้งานสินค้า"
                        >
                          เปิดใช้งาน
                        </ActionButton>
                      )}
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








