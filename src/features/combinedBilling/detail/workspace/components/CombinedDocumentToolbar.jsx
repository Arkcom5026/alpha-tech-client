import React from 'react';

const CombinedDocumentToolbar = ({ onBack, onPrint }) => (
  <div className="max-w-4xl mx-auto mb-6 print:hidden">
    <div className="flex justify-between items-center">
      <button
        type="button"
        onClick={onBack}
        className="text-indigo-600 hover:text-indigo-800"
      >
        &larr; กลับไปหน้ารวมบิล
      </button>
      <button
        type="button"
        onClick={onPrint}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        พิมพ์เอกสาร
      </button>
    </div>
  </div>
);

export default CombinedDocumentToolbar;
