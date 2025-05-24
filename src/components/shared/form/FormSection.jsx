// ✅ src/components/shared/form/FormSection.jsx
const FormSection = ({ title, children }) => (
    <div className="border rounded-xl p-4 mb-4 shadow-sm bg-white dark:bg-zinc-900">
      <h2 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{title}</h2>
      {children}
    </div>
  );
  
  export default FormSection;
  