// ✅ src/features/pos/components/dashboard/SalesBarChart.jsx
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts';
  
  const data = [
    { day: 'จ.', sales: 3200 },
    { day: 'อ.', sales: 4200 },
    { day: 'พ.', sales: 3100 },
    { day: 'พฤ.', sales: 5500 },
    { day: 'ศ.', sales: 4700 },
    { day: 'ส.', sales: 3800 },
    { day: 'อา.', sales: 2000 },
  ];
  
  const SalesBarChart = () => {
    return (
      <div className="mt-8 bg-muted dark:bg-zinc-900 p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4 text-foreground">ยอดขายรายวัน (บาท)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="day" stroke="#8884d8" />
            <YAxis stroke="#8884d8" />
            <Tooltip />
            <Bar dataKey="sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  export default SalesBarChart;
  