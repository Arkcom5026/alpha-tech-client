// ✅ src/components/shared/display/EmptyState.jsx
const EmptyState = ({ message = 'ไม่มีข้อมูล', icon }) => (
    <div className="text-center text-gray-500 py-10">
      {icon && <div className="mb-2 flex justify-center">{icon}</div>}
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
  
  export default EmptyState;
  