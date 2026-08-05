import React from 'react';
import { AlertCircle, FileText, LoaderCircle } from 'lucide-react';

const DeliveryNoteDocumentState = ({ status = 'loading', message }) => {
  const isLoading = status === 'loading';
  const isError = status === 'error';
  const Icon = isLoading ? LoaderCircle : isError ? AlertCircle : FileText;

  return (
    <main className="flex min-h-[70vh] items-center justify-center p-4">
      <section className={`w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm ${isError ? 'border-rose-200' : 'border-slate-200'}`}>
        <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${isError ? 'bg-rose-50 text-rose-700' : 'bg-teal-50 text-teal-700'}`}>
          <Icon className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-950">
          {isLoading ? 'กำลังเตรียมใบส่งสินค้า' : isError ? 'ไม่สามารถเปิดใบส่งสินค้าได้' : 'ไม่พบใบส่งสินค้า'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      </section>
    </main>
  );
};

export default DeliveryNoteDocumentState;
