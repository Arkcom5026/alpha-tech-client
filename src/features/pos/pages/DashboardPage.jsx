// ✅ src/features/pos/pages/DashboardPage.jsx
import { Card, CardContent } from '@/components/ui/card';
import { FaMoneyBillWave, FaFileInvoice, FaUserFriends, FaBoxes } from 'react-icons/fa';
import SalesBarChart from '../components/dashboard/SalesBarChart'; // ✅ import เพิ่ม

const metrics = [
  {
    title: 'ยอดขายวันนี้',
    value: '฿12,340',
    icon: <FaMoneyBillWave className="text-2xl text-green-500 dark:text-green-400" />,
    bg: 'bg-green-100 dark:bg-green-900',
  },
  {
    title: 'จำนวนบิล',
    value: '87',
    icon: <FaFileInvoice className="text-2xl text-blue-500 dark:text-blue-400" />,
    bg: 'bg-blue-100 dark:bg-blue-900',
  },
  {
    title: 'จำนวนลูกค้า',
    value: '64',
    icon: <FaUserFriends className="text-2xl text-yellow-500 dark:text-yellow-400" />,
    bg: 'bg-yellow-100 dark:bg-yellow-900',
  },
  {
    title: 'สินค้าในสต๊อก',
    value: '542',
    icon: <FaBoxes className="text-2xl text-purple-500 dark:text-purple-400" />,
    bg: 'bg-purple-100 dark:bg-purple-900',
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, index) => (
          <Card
            key={index}
            className={`transition-all duration-300 hover:scale-[1.02] shadow-md rounded-2xl p-4 ${item.bg}`}
          >
            <CardContent className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white/50 dark:bg-black/30">{item.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground">{item.name}</p>
                <h2 className="text-2xl font-bold text-foreground">{item.value}</h2>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ✅ เพิ่มกราฟตรงนี้ */}
      <SalesBarChart />
    </div>
  );
};

export default DashboardPage;
