
// ✅ src/features/product/components/ProductTable.jsx
import { Link, useNavigate } from 'react-router-dom';
import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const ProductTable = ({ products, onDelete, deleting }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border overflow-x-auto">
      <h3 className="text-md font-semibold px-4 pt-3 pb-2 text-gray-700">รายการสินค้าที่สั่งซื้อ</h3>
      <Table>
        <TableHeader className="bg-blue-100">
          <TableRow>
            
            <TableHead className="text-center w-[150px]">หมวดหมู่</TableHead>
            <TableHead className="text-center w-[130px]">ประเภท</TableHead>
            <TableHead className="text-center w-[130px]">ลักษณะ</TableHead>
            <TableHead className="text-center w-[130px]">รูปแบบ</TableHead>            
            <TableHead className="text-center w-[120px]">ชื่อ</TableHead>
            <TableHead className="text-center w-[120px]">รุ่น</TableHead>
            <TableHead className="text-center w-[80px]">ราคาทุน</TableHead>
            <TableHead className="text-center w-[100px]">ราคาส่ง</TableHead>
            <TableHead className="text-center w-[100px]">ราคาช่าง</TableHead>
            <TableHead className="text-center w-[100px]">ราคาปลีก</TableHead>
            <TableHead className="text-center w-[100px]">ราคาออนไลน์</TableHead>
            <TableHead className="text-center w-[120px]">จัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.length > 0 ? (
            products.map((item, index) => {
              const isLast = index === products.length - 1;
              return (
                <TableRow key={item.id}>                  
                  <TableCell>{item.category || '-'}</TableCell>
                  <TableCell>{item.productType || '-'}</TableCell>
                  <TableCell>{item.productProfile || '-'}</TableCell>
                  <TableCell>{item.productTemplate || '-'}</TableCell>                  
                  <TableCell>{item.name || '-'}</TableCell>
                  <TableCell>{item.model || '-'}</TableCell>
                  <TableCell className="text-center">
                    {item.costPrice?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.priceWholesale?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.priceTechnician?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.priceRetail?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.priceOnline?.toLocaleString() || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <StandardActionButtons
                      onDelete={() => onDelete(item.id)}
                      deleting={deleting}
                      onEdit={() => navigate(`/pos/stock/products/edit/${item.id}`)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground">
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




