// ✅ src/components/shared/table/SharedDataTable.jsx
const SharedDataTable = ({ columns, data }) => {
    return (
      <table className="w-full text-sm text-left border">
        <thead className="bg-gray-100 dark:bg-zinc-800">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-2 border-b font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50 dark:hover:bg-zinc-900">
              {columns.map((col) => (
                <td key={col.key} className="p-2">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default SharedDataTable;
  