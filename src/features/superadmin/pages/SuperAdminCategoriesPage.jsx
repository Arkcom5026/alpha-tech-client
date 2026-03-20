

// SuperAdminCategoriesPage.jsx (initial clean version)
// Location: src/features/superadmin/pages/SuperAdminCategoriesPage.jsx

import React, { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSuperAdminStore } from '../store/superAdminStore';

const SuperAdminCategoriesPage = () => {
  const token = useAuthStore((state) => state.token);

  const {
    categories,
    categoriesLoading,
    categoriesError,
    fetchCategoriesAction,
    clearCategoriesErrorAction,
  } = useSuperAdminStore();

  useEffect(() => {
    if (!token) return;
    fetchCategoriesAction();
  }, [token, fetchCategoriesAction]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Categories (SuperAdmin)</h1>
          <p className="text-sm text-gray-500">Shared catalog for P1 ecosystem (IT/mobile)</p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-60"
          onClick={() => {
            clearCategoriesErrorAction();
            // TODO: open create form
          }}
        >
          + Add Category
        </button>
      </div>

      {categoriesError ? (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-start justify-between gap-3">
          <span>{categoriesError}</span>
          <button
            type="button"
            className="text-sm underline"
            onClick={clearCategoriesErrorAction}
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">System</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categoriesLoading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">Loading...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="p-3 font-medium">{cat.name}</td>
                  <td className="p-3">
                    <span className={cat.active ? 'text-green-700' : 'text-gray-500'}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">{cat.isSystem ? 'Yes' : 'No'}</td>
                  <td className="p-3 text-right space-x-2">
                    <button type="button" className="text-blue-600">Edit</button>
                    <button type="button" className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminCategoriesPage;

