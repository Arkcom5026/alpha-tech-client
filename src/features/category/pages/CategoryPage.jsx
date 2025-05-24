// ✅ src/features/category/pages/CategoryPage.jsx
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

import CategoryCreateDialog from '../components/CategoryCreateDialog';

import { useCategoryStore } from '../Store/CategoryStore';
import CategoryTable from '../components/CategoryTable';

const CategoryPage = () => {
  const { categories, fetchCategories } = useCategoryStore();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = (categories || []).filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category) => {
    setMode('edit');
    setSelected(category);
    setOpen(true);
  };

  const handleCreate = () => {
    setMode('create');
    setSelected(null);
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">จัดการหมวดหมู่สินค้า</h2>
        <Button onClick={handleCreate}>เพิ่มหมวดหมู่</Button>
      </div>

      <input
        type="text"
        placeholder="ค้นหาหมวดหมู่..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border px-3 py-2 rounded w-full max-w-sm"
      />

      <CategoryTable data={filtered} onEdit={handleEdit} />

      <CategoryCreateDialog
        open={open}
        onOpenChange={setOpen}
        mode={mode}
        defaultValues={selected}
      />
    </div>
  );
};

export default CategoryPage;
