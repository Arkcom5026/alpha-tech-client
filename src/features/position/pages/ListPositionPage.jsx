// --- filepath: src/features/position/pages/ListPositionPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmation } from '@/runtime';
import { usePositionStore } from '../stores/positionStore.js';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{children}</span>
);

const ActionButton = ({ children, className = '', type = 'button', ...rest }) => (
  <button
    type={type}
    className={`px-3 py-1.5 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

const ListPositionPage = () => {
  const navigate = useNavigate();
  const { list, meta, error, message, fetchListAction, toggleActiveAction } = usePositionStore();

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('all');
  const [confirm, setConfirm] = useState(null); // {row, nextActive, key}

  useEffect(() => {
    fetchListAction({ page, limit, search, active: active === 'all' ? undefined : active === 'true' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, active]);

  const onEdit = (row) => navigate(`edit/${row.id}`);

  const requestToggleConfirmation = async (row) => {
    const nextActive = !row?.isActive;
    const key = `position.toggleActive.${row.id}`;
    setConfirm({ row, nextActive, key });

    const accepted = await confirmation.confirm({ key });
    if (!accepted) {
      setConfirm((current) => (current?.key === key ? null : current));
      return;
    }

    try {
      await toggleActiveAction(row.id);
    } finally {
      setConfirm((current) => (current?.key === key ? null : current));
    }
  };

  const handleToggle = (row) => void requestToggleConfirmation(row);
  const cancelConfirmation = () => {
    if (confirm?.key) confirmation.cancel(confirm.key);
  };
  const acceptConfirmation = () => {
    if (confirm?.key) confirmation.resolve(confirm.key, true);
  };

  const rows = Array.isArray(list) ? list : [];

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-[1100px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">ตำแหน่งพนักงาน</h1>
              {message && <span className="text-xs text-green-600">{message}</span>}
              {error && <span className="text-xs text-rose-600">{error?.message || String(error)}</span>}
            </div>
            <div className="flex items-center gap-2">
              <ActionButton className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" onClick={() => navigate('create')}>
                เพิ่มตำแหน่ง
              </ActionButton>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-2">
          <input
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 w-full max-w-md bg-white dark:bg-zinc-900"
            placeholder="ค้นหาชื่อตำแหน่ง..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900"
            value={active}
            onChange={(event) => setActive(event.target.value)}
          >
            <option value="all">ทั้งหมด</option>
            <option value="true">ใช้งานอยู่</option>
            <option value="false">ปิดใช้งาน</option>
          </select>
        </div>

        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-600 bg-zinc-50 dark:bg-zinc-800">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-2 w-[60px] text-center">#</th>
              <th className="px-4 py-2 w-[40%]">ชื่อตำแหน่ง</th>
              <th className="px-4 py-2">คำอธิบาย</th>
              <th className="px-4 py-2 w-[10%] text-center">สถานะ</th>
              <th className="px-4 py-2 text-right w-[20%]">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">ไม่พบข้อมูล</td>
              </tr>
            )}

            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50 ${idx % 2 === 1 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/40 dark:bg-zinc-900/40'}`}
              >
                <td className="px-4 py-3 text-center">{(page - 1) * limit + idx + 1}</td>
                <td className="px-4 py-3">{row.name || '-'}</td>
                <td className="px-4 py-3">{row.description || '-'}</td>
                <td className="px-4 py-3 text-center">
                  {row.isActive ? (
                    <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-400/30">ใช้งาน</Badge>
                  ) : (
                    <Badge className="bg-zinc-200 text-zinc-800 ring-zinc-400/40 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-500/40">ปิดใช้งาน</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-2 justify-end min-w-[220px]">
                    <ActionButton
                      className="border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => onEdit(row)}
                    >
                      แก้ไข
                    </ActionButton>
                    <ActionButton
                      className={`text-white ${row.isActive ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`}
                      onClick={() => handleToggle(row)}
                    >
                      {row.isActive ? 'ปิดใช้งาน' : 'กู้คืน'}
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta?.pages > 1 && (
          <div className="flex gap-2 p-4 justify-center border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
            {Array.from({ length: meta.pages }, (_, index) => index + 1).map((targetPage) => (
              <button
                key={targetPage}
                className={`px-3 py-1.5 border rounded ${targetPage === page ? 'bg-gray-200 dark:bg-zinc-700' : ''}`}
                onClick={() => setPage(targetPage)}
              >
                {targetPage}
              </button>
            ))}
          </div>
        )}

        {confirm && (
          <div className="px-4 py-3 flex items-center justify-between bg-amber-50/90 dark:bg-amber-900/30 border-t border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-900 dark:text-amber-200">
              ยืนยันการ{confirm.nextActive ? 'กู้คืน' : 'ปิดใช้งาน'} ตำแหน่ง “{confirm.row?.name}” หรือไม่?
            </div>
            <div className="flex gap-2">
              <ActionButton className="border border-amber-300 text-amber-900 hover:bg-amber-100" onClick={cancelConfirmation}>
                ยกเลิก
              </ActionButton>
              <ActionButton className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500" onClick={acceptConfirmation}>
                ยืนยัน
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPositionPage;
