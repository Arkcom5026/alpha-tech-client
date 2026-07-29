import React from 'react';
import InputMask from 'react-input-mask';
import { Phone, RefreshCw, Search } from 'lucide-react';

const SaleCustomerSearch = ({
  clearKey,
  phone,
  rawPhone,
  searchMode,
  nameSearch,
  customerLoading,
  phoneInputRef,
  onSearchModeChange,
  onPhoneChange,
  onNameSearchChange,
  onSubmit,
}) => (
  <>
    <div className="flex gap-4 mb-2 text-[10px] font-black text-slate-400">
      <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors select-none">
        <input
          type="radio"
          name="searchMode"
          checked={searchMode === 'name'}
          onChange={() => onSearchModeChange('name')}
          className="accent-slate-900 h-3 w-3"
        />
        <span className={searchMode === 'name' ? 'text-slate-900 font-black' : ''}>
          ค้นจากรายชื่อ
        </span>
      </label>
      <label className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors select-none">
        <input
          type="radio"
          name="searchMode"
          checked={searchMode === 'phone'}
          onChange={() => onSearchModeChange('phone')}
          className="accent-slate-900 h-3 w-3"
        />
        <span className={searchMode === 'phone' ? 'text-slate-900 font-black' : ''}>
          ค้นจากเบอร์โทร
        </span>
      </label>
    </div>

    <div className="relative mb-2.5">
      {searchMode === 'phone' ? (
        <>
          <Phone className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
          <InputMask
            key={clearKey}
            mask="099-999-9999"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value, rawPhone)}
            onKeyDown={(event) => event.key === 'Enter' && onSubmit()}
          >
            {(inputProps) => (
              <input
                {...inputProps}
                ref={phoneInputRef}
                id="customer-phone-input"
                type="tel"
                placeholder="ป้อนเบอร์โทร 10 หลักแล้วกด Enter..."
                className="h-7 w-full pl-7 pr-8 font-mono font-black text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-xs shadow-inner"
              />
            )}
          </InputMask>
        </>
      ) : (
        <>
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
          <input
            type="text"
            placeholder="พิมพ์ชื่อลูกค้าแล้วกด Enter..."
            value={nameSearch}
            onChange={(event) => onNameSearchChange(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && onSubmit()}
            className="h-7 w-full pl-7 pr-8 font-bold text-slate-900 bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none transition-all text-xs shadow-inner"
          />
        </>
      )}

      <div className="absolute right-2 top-2 text-slate-400 pointer-events-none">
        {customerLoading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <Search className="w-3 h-3 opacity-30" />
        )}
      </div>
    </div>
  </>
);

export default SaleCustomerSearch;
