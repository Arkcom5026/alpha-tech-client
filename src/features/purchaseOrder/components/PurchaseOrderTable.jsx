


import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

// PurchaseOrderTable
// - ปรับอินพุตจำนวน/ราคาให้เป็นไปตามกฎข้อ 78 (placeholder, ชิดขวา, ไม่บังคับ 0 ระหว่างพิมพ์)
// - ใช้ raw state แยกสำหรับช่อง input เพื่อ UX ที่ลื่นไหล แล้วค่อยแปลงเป็นตัวเลขเมื่ออัปเดตเข้า store
const PurchaseOrderTable = ({ products = [], setProducts = () => {}, loading = false, editable = true }) => {
  const lastRowRef = useRef(null);

  // เก็บค่าที่ผู้ใช้กำลังพิมพ์แบบ raw string เพื่อไม่ให้เด้งเป็น 0 ระหว่างพิมพ์
  const [rawQty, setRawQty] = useState({}); // { [id]: string }
  const [rawCost, setRawCost] = useState({}); // { [id]: string }

  // ซิงก์ค่าเริ่มต้นเมื่อ products เปลี่ยน (เฉพาะรายการที่ยังไม่มีใน raw)
  useEffect(() => {
    setRawQty((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        if (!(p.id in next)) next[p.id] = String(p.quantity ?? 1);
      });
      return next;
    });
    setRawCost((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        if (!(p.id in next)) next[p.id] = (p.costPrice ?? 0) > 0 ? String(p.costPrice) : '';
      });
      return next;
    });
  }, [products]);

  const parseQty = (value) => {
    const n = parseInt(value ?? '', 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  };

  const parseCost = (value) => {
    const n = parseFloat(value ?? '');
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    // ล้าง raw state เพื่อความสะอาด
    setRawQty((prev) => {
      const n = { ...prev }; delete n[id]; return n;
    });
    setRawCost((prev) => {
      const n = { ...prev }; delete n[id]; return n;
    });
  };

  // อัปเดตจำนวนตามที่ผู้ใช้พิมพ์ (raw) + อัปเดตตัวเลขเข้าตะกร้าเมื่อค่ามีความหมาย
  const handleQtyChange = (id, value) => {
    const cleaned = String(value ?? '').replace(/[^0-9]/g, '');
    setRawQty((prev) => ({ ...prev, [id]: cleaned }));

    // ✅ ไม่ปล่อยให้ state ค้างค่าที่ไม่แน่นอน: ถ้าว่างให้ถือเป็น 1
    const qty = cleaned === '' ? 1 : parseQty(cleaned);
    setProducts((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: qty } : it)));
  };

  // อัปเดตราคาตามที่ผู้ใช้พิมพ์ (raw) + อัปเดตตัวเลขเข้าตะกร้าเมื่อค่ามีความหมาย
  const handleCostChange = (id, value) => {
    const cleaned = String(value ?? '')
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1');

    setRawCost((prev) => ({ ...prev, [id]: cleaned }));

    // ✅ ไม่ปล่อยให้ state ค้างค่า undefined: ถ้าว่างให้ถือเป็น 0
    const cost = cleaned === '' ? 0 : parseCost(cleaned);
    setProducts((prev) => prev.map((it) => (it.id === id ? { ...it, costPrice: cost } : it)));
  };

  useEffect(() => {
    if (lastRowRef.current) {
      try {
        lastRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch { /* no-op to avoid eslint no-empty */ }
    }
  }, [products.length]);

  const rows = useMemo(() => products, [products]);

  return (
    <div className="rounded-md border overflow-x-auto">
      <h3 className="text-md font-semibold px-4 pt-3 pb-2 text-gray-700">รายการสินค้าที่สั่งซื้อ</h3>
      <Table>
        <TableHeader className="bg-blue-100">
          <TableRow>
            <TableHead className="text-center w-[150px]">หมวดหมู่</TableHead>
            <TableHead className="text-center w-[130px]">ประเภท</TableHead>
            <TableHead className="text-center w-[130px]">แบรนด์</TableHead>
            <TableHead className="text-center w-[130px]">สเปก</TableHead>
            <TableHead className="text-center w-[120px]">ชื่อสินค้า</TableHead>
                        <TableHead className="text-center w-[60px]">จำนวน</TableHead>
            <TableHead className="text-center w-[60px]">ราคา</TableHead>
            <TableHead className="text-center w-[80px]">ราคารวม</TableHead>
            <TableHead className="text-center w-[100px]">จัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {!loading && rows.length > 0 ? (
            rows.map((item, index) => {
              const isLast = index === rows.length - 1;

              const qtyDisplay = rawQty[item.id] ?? String(item.quantity ?? 1);
              const costDisplay = rawCost[item.id] ?? ((item.costPrice ?? 0) > 0 ? String(item.costPrice) : '');

              const qtyParsed = parseQty(qtyDisplay);
              const costParsed = parseCost(costDisplay);
              const total = qtyParsed * costParsed;

              return (
                <TableRow key={item.id} ref={isLast ? lastRowRef : null} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell>{item.category || '-'}</TableCell>
                  <TableCell>{item.productType || '-'}</TableCell>
                  <TableCell>{item.productProfile || '-'}</TableCell>
                  <TableCell>{item.productTemplate || '-'}</TableCell>
                  <TableCell>{item.name || '-'}</TableCell>
                  
                  <TableCell className="align-middle">
                    <input
                      type="number"
                      className="w-20 text-right border rounded p-1"
                      value={qtyDisplay}
                      placeholder="1"
                      min={1}
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault();
                      }}
                      inputMode="numeric"
                    />
                  </TableCell>

                  <TableCell className="align-middle">
                    <input
                      type="number"
                      className="w-24 text-right border rounded p-1"
                      value={costDisplay}
                      placeholder="0.00"
                      min={0}
                      onChange={(e) => handleCostChange(item.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.preventDefault();
                      }}
                      inputMode="decimal"
                    />
                  </TableCell>

                  <TableCell className="text-center align-middle">{total.toLocaleString()} ฿</TableCell>

                  {editable && (
                    <TableCell className="text-center align-middle">
                      <div className="flex justify-center">
                        <StandardActionButtons onDelete={() => handleDelete(item.id)} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                {loading ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีรายการสินค้าในใบสั่งซื้อ'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseOrderTable;



