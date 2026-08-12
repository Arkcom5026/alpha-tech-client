import React from 'react';
import QRCode from 'react-qr-code';
import MobileDeviceScanner from './MobileDeviceScanner';
import { listCustomerContactChannels } from '../../communication/api/communicationApi';

export const emptyRepairCommunicationPreference = {
  channelType: '',
  destination: '',
  displayLabel: '',
  profileId: null,
  contactChannelId: null,
  consentGranted: false,
};

const CHANNELS = [
  ['PHONE', 'โทรศัพท์'],
  ['SMS', 'SMS'],
  ['EMAIL', 'อีเมล'],
  ['LINE', 'LINE'],
  ['FACEBOOK', 'Facebook'],
  ['OTHER', 'ช่องทางอื่น'],
];

const RepairCommunicationPreferenceFields = ({ value, onChange, contact, customerId, profiles = [], profilesWarning = '' }) => {
  const preference = value || emptyRepairCommunicationPreference;
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [savedChannels, setSavedChannels] = React.useState([]);
  const patch = (next) => onChange({ ...preference, ...next });
  const selectChannel = (channelType) => {
    const suggestedDestination =
      channelType === 'EMAIL' ? (contact?.contactEmail || contact?.email) :
        ['PHONE', 'SMS'].includes(channelType) ? (contact?.contactPhone || contact?.phone) : '';
    patch({ channelType, profileId: null, contactChannelId: null, destination: preference.destination || suggestedDestination || '' });
  };

  const selectProfile = (profile) => patch({
    channelType: profile.channelType,
    profileId: profile.id,
    contactChannelId: null,
    destination: preference.channelType === profile.channelType ? preference.destination : '',
  });

  React.useEffect(() => {
    let active = true;
    if (!customerId) { setSavedChannels([]); return undefined; }
    listCustomerContactChannels(customerId).then((items) => {
      if (active) setSavedChannels(Array.isArray(items) ? items : []);
    }).catch(() => { if (active) setSavedChannels([]); });
    return () => { active = false; };
  }, [customerId]);

  const selectSavedChannel = (channel) => patch({
    channelType: channel.channelType,
    destination: channel.address,
    displayLabel: channel.displayLabel || '',
    contactChannelId: channel.id,
    consentGranted: channel.consentStatus === 'GRANTED',
  });

  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
      <h4 className="font-black text-sky-950">ช่องทางติดต่อสำหรับงานนี้ (ไม่บังคับ)</h4>
      <p className="mt-1 text-xs leading-5 text-sky-800">
        ไม่เลือกก็เปิดงานซ่อมได้ตามปกติ การส่งข้อความอัตโนมัติจะเพิ่มภายหลังโดยไม่ผูกกับ Repair
      </p>
      {profiles.length ? (
        <div className="mt-3">
          <p className="text-xs font-black text-slate-600">ให้ลูกค้าสแกน QR ของร้าน</p>
          <div className="mt-2 flex gap-3 overflow-x-auto pb-2">
            {profiles.filter((profile) => profile.enabled !== false).map((profile) => {
              const qrValue = profile.qrPayload || profile.publicUri || profile.address;
              return (
                <button key={profile.id} type="button" onClick={() => selectProfile(profile)} className={`min-w-36 rounded-xl border bg-white p-3 text-left ${preference.profileId === profile.id ? 'border-sky-600 ring-2 ring-sky-200' : 'border-sky-200'}`}>
                  {qrValue ? <div className="mx-auto w-fit bg-white p-1"><QRCode value={qrValue} size={96} level="M" /></div> : null}
                  <span className="mt-2 block text-sm font-black text-slate-900">{profile.displayName}</span>
                  <span className="block text-xs text-slate-500">{profile.channelType}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {profilesWarning ? <p className="mt-2 text-xs text-amber-700">ยังโหลด QR ของร้านไม่ได้ แต่รับงานซ่อมต่อได้ตามปกติ</p> : null}
      {savedChannels.length ? (
        <div className="mt-3">
          <p className="text-xs font-black text-slate-600">ช่องทางเดิมของลูกค้า</p>
          <div className="mt-2 flex flex-wrap gap-2">{savedChannels.map((channel) => (
            <button key={channel.id} type="button" onClick={() => selectSavedChannel(channel)} className="min-h-11 rounded-xl border border-sky-200 bg-white px-3 text-left text-sm">
              <strong>{channel.displayLabel || channel.channelType}</strong> <span className="text-slate-500">{channel.address}</span>
            </button>
          ))}</div>
        </div>
      ) : null}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-black text-slate-600">ช่องทางที่ลูกค้าต้องการ</span>
          <select value={preference.channelType} onChange={(event) => selectChannel(event.target.value)} className="min-h-12 w-full rounded-xl border border-sky-200 bg-white px-4">
            <option value="">ไม่ระบุ</option>
            {CHANNELS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        {preference.channelType ? (
          <label className="space-y-1">
            <span className="text-xs font-black text-slate-600">หมายเลข / บัญชี / ที่อยู่</span>
            <div className="flex gap-2">
              <input value={preference.destination} onChange={(event) => patch({ destination: event.target.value })} placeholder="เว้นว่างได้" className="min-h-12 min-w-0 flex-1 rounded-xl border border-sky-200 bg-white px-4" />
              <button type="button" onClick={() => setScannerOpen(true)} className="min-h-12 rounded-xl border border-sky-300 bg-white px-3 text-sm font-black text-sky-800">สแกน QR ลูกค้า</button>
            </div>
          </label>
        ) : null}
      </div>
      {preference.channelType ? (
        <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm text-sky-950">
          <input type="checkbox" checked={preference.consentGranted} onChange={(event) => patch({ consentGranted: event.target.checked })} className="mt-1 h-4 w-4" />
          <span>ลูกค้ายินยอมให้ติดต่อผ่านช่องทางนี้เกี่ยวกับงานซ่อม</span>
        </label>
      ) : null}
      <MobileDeviceScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={(destination) => {
          patch({ destination, contactChannelId: null });
          setScannerOpen(false);
        }}
      />
    </section>
  );
};

export default RepairCommunicationPreferenceFields;
