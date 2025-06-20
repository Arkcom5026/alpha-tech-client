import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';

const ProductSearchTable = ({ results = [], onAdd }) => {
    const [quantities, setQuantities] = useState({});
    const [costPrices, setCostPrices] = useState({});
    const [removedIds, setRemovedIds] = useState([]);

    const handleQuantityChange = (id, value) => {
        setQuantities((prev) => ({ ...prev, [id]: Number(value) || 0 }));
    };

    const handleCostPriceChange = (id, value) => {
        setCostPrices((prev) => ({ ...prev, [id]: Number(value) || 0 }));
    };

    const handleAdd = (product) => {
        const quantity = quantities[product.id] || 1;
        const costPrice = costPrices[product.id] || 0;
        onAdd({
            id: product.id,
            title: product.name,
            productType: product.productType,
            description: product.description,
            template: product.template,
            quantity,
            costPrice,
        });
        // ล้างข้อมูลออกทั้งแถวโดยลบ productId ออกจากผลการค้นหา
        setQuantities((prev) => {
            const updated = { ...prev };
            delete updated[product.id];
            return updated;
        });
        setCostPrices((prev) => {
            const updated = { ...prev };
            delete updated[product.id];
            return updated;
        });
        setRemovedIds((prev) => [...prev, product.id]);
    };

    const visibleResults = results.filter((p) => !removedIds.includes(p.id));

    return (
        <div className="rounded-md border overflow-x-auto mt-6 shadow-sm">
            <h3 className="text-md font-semibold px-4 pt-3 pb-2 text-gray-700">ผลการค้นหา</h3>
            <Table>
                <TableHeader className="bg-blue-100">
                    <TableRow>
                        <TableHead className="text-center w-[200px]">ชื่อสินค้า</TableHead>
                        <TableHead className="text-center w-[160px]">หมวดหมู่</TableHead>
                        <TableHead className="text-center">รายละเอียด</TableHead>
                        <TableHead className="text-center w-[100px]">จำนวน</TableHead>
                        <TableHead className="text-center w-[120px]">ราคาต่อหน่วย</TableHead>
                        <TableHead className="text-center w-[120px]">ราคารวม</TableHead>
                        <TableHead className="text-center w-[120px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visibleResults.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                ไม่พบรายการสินค้า กรุณาพิมพ์ชื่อหรือสแกนบาร์โค้ด
                            </TableCell>
                        </TableRow>
                    ) : (
                        visibleResults.map((product, index) => {
                            const qty = quantities[product.id] || 1;
                            const costPrice = costPrices[product.id] || 0;
                            const total = qty * costPrice;
                            return (
                                <TableRow key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <TableCell className="text-center align-middle">{product.name}</TableCell>
                                    <TableCell className="text-center align-middle">{product.template?.name || 'ไม่มีหมวดหมู่'}</TableCell>
                                    <TableCell className="text-center align-middle">{product.description || '-'}</TableCell>
                                    <TableCell className="text-center align-middle">
                                        <input
                                            type="number"
                                            className="w-20 text-center border rounded p-1"
                                            value={qty}
                                            min={1}
                                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center align-middle">
                                        <input
                                            type="number"
                                            className="w-24 text-center border rounded p-1"
                                            value={costPrice}
                                            min={0}
                                            onChange={(e) => handleCostPriceChange(product.id, e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center align-middle">{total.toLocaleString()} ฿</TableCell>
                                    <TableCell className="text-center align-middle">
                                        <div className="flex justify-center">
                                            <StandardActionButtons onAdd={() => handleAdd(product)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default ProductSearchTable;
