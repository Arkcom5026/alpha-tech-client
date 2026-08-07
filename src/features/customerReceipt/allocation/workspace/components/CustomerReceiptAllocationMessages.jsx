import React from 'react';

const CustomerReceiptAllocationMessages = ({ error = '', successMessage = '' }) => (
  <>
    {!!error && (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )}

    {!!successMessage && (
      <div role="status" className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        {successMessage}
      </div>
    )}
  </>
);

export default CustomerReceiptAllocationMessages;
