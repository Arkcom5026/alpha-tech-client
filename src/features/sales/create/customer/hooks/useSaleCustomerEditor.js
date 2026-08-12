import { useCallback, useMemo, useState } from 'react';

const EMPTY_EDITOR = {
  name: '',
  phone: '',
  email: '',
  customerType: 'INDIVIDUAL',
  companyName: '',
  departmentName: '',
  taxId: '',
  addressDetail: '',
  provinceCode: '',
  districtCode: '',
  subdistrictCode: '',
  postalCode: '',
};

export const useSaleCustomerEditor = () => {
  const [editor, setEditor] = useState(EMPTY_EDITOR);
  const [isModified, setIsModified] = useState(false);

  const patchEditor = useCallback((patch, { modified = true } = {}) => {
    setEditor((current) => ({ ...current, ...patch }));
    if (modified) setIsModified(true);
  }, []);

  const hydrateCustomer = useCallback((customer = {}) => {
    setEditor({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      customerType: customer.type || 'INDIVIDUAL',
      companyName: customer.companyName || '',
      departmentName: customer.departmentName || '',
      taxId: customer.taxId || '',
      addressDetail: customer.addressDetail || customer.address || '',
      provinceCode: customer.provinceCode || '',
      districtCode: customer.districtCode || '',
      subdistrictCode: customer.subdistrictCode || '',
      postalCode: customer.postalCode || customer.postcode || '',
    });
    setIsModified(false);
  }, []);

  const clearEditor = useCallback((seed = {}) => {
    setEditor({ ...EMPTY_EDITOR, ...seed });
    setIsModified(false);
  }, []);

  const createPayload = useMemo(() => ({
    name: editor.name.trim(),
    phone: String(editor.phone || '').replace(/\D/g, ''),
    email: editor.email.trim(),
    subdistrictCode: editor.subdistrictCode || null,
    postcode: editor.postalCode || undefined,
    addressDetail: editor.addressDetail,
    type: editor.customerType,
    companyName: editor.companyName,
    departmentName: editor.customerType === 'INDIVIDUAL' ? '' : editor.departmentName,
    taxId: editor.taxId,
  }), [editor]);

  const validateForSave = useCallback(() => {
    if (!editor.name.trim()) return 'กรุณากรอกชื่อลูกค้า';
    const phone = String(editor.phone || '').replace(/\D/g, '');
    if (phone && !/^[0-9]{10}$/.test(phone)) return 'กรุณากรอกเบอร์โทรให้ครบ 10 หลัก';
    return null;
  }, [editor.name, editor.phone]);

  return {
    editor,
    patchEditor,
    hydrateCustomer,
    clearEditor,
    isModified,
    setIsModified,
    createPayload,
    validateForSave,
  };
};
