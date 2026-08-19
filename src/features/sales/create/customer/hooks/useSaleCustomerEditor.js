import { useCallback, useMemo, useState } from 'react';

const EMPTY_EDITOR = {
  name: '',
  phone: '',
  email: '',
  customerType: 'INDIVIDUAL',
  quotationWorkflowOverride: null,
  companyName: '',
  departmentName: '',
  taxId: '',
  addressDetail: '',
  provinceCode: '',
  districtCode: '',
  subdistrictCode: '',
  postalCode: '',
};

const LEGAL_ENTITY_TYPES = new Set(['ORGANIZATION', 'GOVERNMENT']);

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
      quotationWorkflowOverride:
        customer.quotationWorkflowOverride === true || customer.quotationWorkflowOverride === false
          ? customer.quotationWorkflowOverride
          : null,
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
    quotationWorkflowOverride: editor.quotationWorkflowOverride,
    companyName: editor.companyName.trim(),
    departmentName: editor.customerType === 'INDIVIDUAL' ? '' : editor.departmentName.trim(),
    taxId: editor.taxId.trim(),
  }), [editor]);

  const validateForSave = useCallback(() => {
    const isLegalEntity = LEGAL_ENTITY_TYPES.has(editor.customerType);
    if (isLegalEntity) {
      if (!editor.companyName.trim()) return 'กรุณากรอกชื่อบริษัทหรือหน่วยงาน';
    } else if (!editor.name.trim()) {
      return 'กรุณากรอกชื่อลูกค้า';
    }

    const phone = String(editor.phone || '').replace(/\D/g, '');
    if (!phone) return 'กรุณากรอกเบอร์โทร';
    if (!/^[0-9]{9,10}$/.test(phone)) return 'กรุณากรอกเบอร์โทร 9 หรือ 10 หลัก';
    return null;
  }, [editor.companyName, editor.customerType, editor.name, editor.phone]);

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
