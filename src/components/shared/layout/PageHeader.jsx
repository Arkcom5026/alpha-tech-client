// ✅ src/components/shared/layout/PageHeader.jsx
const PageHeader = ({ title, actions }) => (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
  
  export default PageHeader;