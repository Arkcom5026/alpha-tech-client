import React, { useEffect, useMemo, useState } from 'react';
import AddressForm from '@/features/address/components/AddressForm';
import { useAddressStore } from '@/features/address/store/addressStore';

/**
 * BranchForm — เวอร์ชันใช้ที่อยู่ตามมาตรฐานใหม่
 * - ใช้ AddressForm (address line + Province→District→Subdistrict + postalCode)
 * - เก็บค่า: address, provinceCode, districtCode, subdistrictCode, postalCode
 * - region ถูกคำนวณอัตโนมัติจาก provinceCode (ข้อมูล region มาจาก API /provinces)
 * - ยกเลิกการกรอก จังหวัด/อำเภอ เป็น text field แบบเดิม
 * - ปิดการใช้งาน alert() ตามแนวทาง [70] → แสดงข้อความในหน้าแทน
 */
const BranchForm = ({
  formData,
  setFormData,
  onSubmit,
  isEdit = false,
  allowLocationDetect = false,
  submitLabel = 'บันทึก',
}) => {
  // Provinces (มี field region)
  const { provinces, ensureProvincesAction } = useAddressStore();

  // โหลด provinces ไว้ล่วงหน้าเพื่อคำนวณ region
  useEffect(() => { void ensureProvincesAction(); }, [ensureProvincesAction]);

  // state สำหรับข้อความแจ้งเตือน (แทน alert)
  const [geoMessage, setGeoMessage] = useState('');

  // ความแม่นยำขั้นต่ำที่ยอมรับ (เมตร) — มากกว่านี้จะไม่อัปเดตพิกัดจากปุ่ม
  const ACC_THRESHOLD_M = 100;
  // Target accuracy for watchPosition to stop early (meters)
  const GEO_TARGET_ACC_M = 30; // เข้มขึ้น
  const GEO_WATCH_MAX_MS = 30000; // ขยายเวลาเก็บตัวอย่าง
  const GEO_WATCH_MAX_SAMPLES = 10; // เพิ่มจำนวนตัวอย่าง
  const GEO_MIN_SAMPLES_FOR_AVG = 3; // ต้องได้อย่างน้อยเท่านี้ก่อนจะเฉลี่ย
  // จำกัดให้อยู่ในไทยเพื่อตัดค่าหลุดโลก (ปรับได้ตามโปรเจค)
  const USE_TH_BOUNDS = true;
  const TH_BOUNDS = { minLat: 5.5, maxLat: 20.5, minLng: 97.3, maxLng: 105.9 };

  // Debug logger for geo features (logs only in dev)
  // Use Vite env only; avoid `process` to satisfy ESLint in browser
  const DEBUG_GEO = (typeof import.meta !== 'undefined' && import.meta.env) ? !import.meta.env.PROD : true;
  const dlog = (...args) => { if (DEBUG_GEO) console.log('[BranchForm][geo]', ...args); };

  // Manual paste fallback UI
  const [manualPasteText, setManualPasteText] = useState('');
  const [showManualPaste, setShowManualPaste] = useState(false);

  // ------ Map picker (Leaflet over OSM) ------
  const [showMapPicker, setShowMapPicker] = useState(false);
  const mapDivRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);

  // Map search state (Nominatim)
  const [mapSearch, setMapSearch] = useState('');
  const [mapSearching, setMapSearching] = useState(false);
  const [mapResults, setMapResults] = useState([]);

  // Geolocate in map modal
  const [mapLocating, setMapLocating] = useState(false);
  const [mapAcc, setMapAcc] = useState(null);
  const [mapInfo, setMapInfo] = useState('');

  const ensureLeaflet = () => new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.L) return resolve();
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const scriptId = 'leaflet-js';
    const done = () => resolve();
    if (document.getElementById(scriptId)) {
      const tryReady = () => (window.L ? resolve() : setTimeout(tryReady, 50));
      tryReady();
      return;
    }
    const s = document.createElement('script');
    s.id = scriptId;
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = done;
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });

  useEffect(() => {
    if (!showMapPicker) return;
    let mapInstance;
    (async () => {
      try {
        await ensureLeaflet();
        const L = window.L;
        if (!mapDivRef.current) return;
        // robust center detection: treat empty string/null as missing and avoid (0,0)
        const latN = (formData.latitude === '' || formData.latitude == null) ? NaN : Number(formData.latitude);
        const lngN = (formData.longitude === '' || formData.longitude == null) ? NaN : Number(formData.longitude);
        const hasLat = Number.isFinite(latN) && Math.abs(latN) > 0.0001;
        const hasLng = Number.isFinite(lngN) && Math.abs(lngN) > 0.0001;
        const center = (hasLat && hasLng)
          ? [latN, lngN]
          : [13.756331, 100.501762]; // BKK default
        mapInstance = L.map(mapDivRef.current).setView(center, 13);
        mapRef.current = mapInstance;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapInstance);
        const marker = L.marker(center, { draggable: true }).addTo(mapInstance);
        markerRef.current = marker;
        mapInstance.on('click', (e) => marker.setLatLng(e.latlng));
      } catch (e) { dlog('leaflet init failed', e); }
    })();
    return () => {
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMapPicker, formData.latitude, formData.longitude]);

  const handleMapUse = () => {
    const marker = markerRef.current;
    if (!marker) { setShowMapPicker(false); return; }
    const pos = marker.getLatLng();
    setFormData((prev) => ({ ...prev, latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6) }));
    setGeoMessage('เลือกพิกัดจากแผนที่แล้ว');
    closeMapPicker();
  };

  const closeMapPicker = () => {
    setShowMapPicker(false);
    setMapResults([]);
    setMapSearch('');
    setMapSearching(false);
  };

  const geocodeNominatim = async (q) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=5&countrycodes=th&q=${encodeURIComponent(q)}`;
    setMapSearching(true);
    try {
      const res = await fetch(url, { headers: { 'Accept-Language': 'th' } });
      const data = await res.json();
      setMapResults(Array.isArray(data) ? data : []);
    } catch (e) {
      dlog('nominatim error', e);
      setMapResults([]);
    } finally {
      setMapSearching(false);
    }
  };

  const handleMapSearch = async () => {
    const q = mapSearch.trim();
    if (!q) return;
    await geocodeNominatim(q);
  };

  const handlePickResult = (item) => {
    if (!item) return;
    const lat = Number(item.lat), lon = Number(item.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon) && mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      mapRef.current.setView([lat, lon], 16);
    }
  };

  // Get best-of geolocation by sampling multiple readings via watchPosition
  const requestBestPosition = ({ targetAcc = GEO_TARGET_ACC_M, maxMs = GEO_WATCH_MAX_MS, maxSamples = GEO_WATCH_MAX_SAMPLES, onUpdate } = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Geolocation not supported')); return; }
      let samples = 0;
      let cleared = false;
      let bestAcc = Infinity;
      const arr = []; // {lat,lng,acc}
      const clear = () => { if (!cleared && watchId != null) { navigator.geolocation.clearWatch(watchId); cleared = true; } };

      const inBounds = (la, ln) => (
        Number.isFinite(la) && Number.isFinite(ln) &&
        Math.abs(la) > 0.0001 && Math.abs(ln) > 0.0001 &&
        (!USE_TH_BOUNDS || (la >= TH_BOUNDS.minLat && la <= TH_BOUNDS.maxLat && ln >= TH_BOUNDS.minLng && ln <= TH_BOUNDS.maxLng))
      );
      const weightedAvg = (points) => {
        let sw = 0, slat = 0, slng = 0;
        for (const p of points) {
          const w = 1 / Math.pow(Math.max(1, p.acc || 1000), 2);
          sw += w; slat += w * p.lat; slng += w * p.lng;
        }
        if (sw === 0) return null;
        const lat = slat / sw, lng = slng / sw;
        // ค่าความคลาดเคลื่อนประมาณจาก w รวม (ไม่ใช่ทางการ แต่พอเป็นตัวชี้วัด)
        const estAcc = Math.round(Math.sqrt(1 / sw));
        return { lat, lng, acc: estAcc };
      };

      const finish = (result) => { clear(); clearTimeout(timer); resolve(result); };

      const onSuccess = (pos) => {
        samples++;
        const acc = typeof pos.coords.accuracy === 'number' ? Math.round(pos.coords.accuracy) : 9999;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!inBounds(lat, lng)) { if (onUpdate) onUpdate({ samples, acc: null, pos }); return; }
        arr.push({ lat, lng, acc });
        bestAcc = Math.min(bestAcc, acc);
        // เลือกเฉลี่ยเฉพาะจุดที่ดีพอ (เข้าคลัสเตอร์ของ best)
        const good = arr.filter(p => p.acc <= Math.min(bestAcc * 1.5, targetAcc * 2));
        const avg = (good.length >= GEO_MIN_SAMPLES_FOR_AVG) ? weightedAvg(good) : null;
        const reportAcc = avg ? avg.acc : acc;
        if (onUpdate) onUpdate({ samples, acc: reportAcc, pos });
        if ((avg && avg.acc <= targetAcc) || samples >= maxSamples) {
          const out = avg || { lat, lng, acc };
          finish({ coords: { latitude: out.lat, longitude: out.lng, accuracy: out.acc } });
        }
      };

      const onError = (err) => {
        clear(); clearTimeout(timer);
        if (arr.length) {
          const good = arr.filter(p => p.acc <= Math.min(bestAcc * 1.5, targetAcc * 2));
          const avg = weightedAvg(good.length ? good : arr);
          finish({ coords: { latitude: avg.lat, longitude: avg.lng, accuracy: avg.acc } });
        } else {
          reject(err);
        }
      };

      const watchId = navigator.geolocation.watchPosition(onSuccess, onError, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
      const timer = setTimeout(() => { onError(new Error('watch timeout')); }, maxMs);
    });
  };


  const handleMapLocate = async () => {
    setMapInfo('');
    if (!navigator.geolocation) {
      setMapInfo('เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง');
      return;
    }
    setMapLocating(true);
    try {
      const best = await requestBestPosition({
        onUpdate: ({ acc, samples }) => {
          setMapInfo(acc != null ? `กำลังระบุตำแหน่ง... (±${acc} m, ${samples} ชุด)` : 'กำลังระบุตำแหน่ง...');
        },
      });
      setMapLocating(false);
      const { latitude, longitude, accuracy } = best.coords;
      const acc = Number.isFinite(accuracy) ? Math.round(accuracy) : null;
      setMapAcc(acc);
      if (mapRef.current && markerRef.current) {
        const L = window.L;
        const target = L ? L.latLng(latitude, longitude) : { lat: latitude, lng: longitude };
        markerRef.current.setLatLng(target);
        mapRef.current.setView(target, 17);
      }
      if (acc != null && acc > ACC_THRESHOLD_M) {
        setMapInfo(`ความแม่นยำต่ำ (±${acc} m) — ลองใหม่กลางแจ้งหรือใช้มือถือ`);
      } else if (acc != null) {
        setMapInfo(`ดึงพิกัดสำเร็จ (±${acc} m)`);
      } else {
        setMapInfo('ดึงพิกัดสำเร็จ');
      }
    } catch (err) {
      setMapLocating(false);
      setMapInfo('ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
      dlog('map locate error', err);
    }
  };

  // รวมค่า address ที่ส่งให้ AddressForm (ควบคุมผ่าน formData โดยตรง)
  const addressValue = useMemo(() => ({
    address: formData.address ?? '',
    provinceCode: formData.provinceCode ?? '',
    districtCode: formData.districtCode ?? '',
    subdistrictCode: formData.subdistrictCode ?? '',
    postalCode: formData.postalCode ?? '',
  }), [formData.address, formData.provinceCode, formData.districtCode, formData.subdistrictCode, formData.postalCode]);

  // เมื่อที่อยู่เปลี่ยนจาก AddressForm → อัปเดต formData + คำนวณ region อัตโนมัติ
  const handleAddressChange = (next) => {
    setFormData((prev) => {
      const merged = { ...prev, ...next };
      const pcode = merged.provinceCode ? String(merged.provinceCode) : '';
      if (pcode && Array.isArray(provinces) && provinces.length) {
        const prov = provinces.find((p) => String(p.code) === pcode);
        if (prov?.region && prov.region !== merged.region) {
          merged.region = prov.region; // อัปเดตภาคอัตโนมัติจากจังหวัด
        }
      }
      return merged;
    });
  };

  // ตรวจจับพิกัด (ตั้งค่า lat/lng เท่านั้น เพื่อเลี่ยงการ map ชื่อ→code ที่คลาดเคลื่อน)
  const handleDetectLocation = async () => {
    setGeoMessage('');
    if (!navigator.geolocation) {
      setGeoMessage('เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง');
      return;
    }
    setGeoMessage('กำลังดึงพิกัด...');
    try {
      const best = await requestBestPosition({
        onUpdate: ({ acc, samples }) => {
          setGeoMessage(acc != null ? `กำลังดึงพิกัด... (±${acc} m, ${samples} ชุด)` : 'กำลังดึงพิกัด...');
        },
      });
      const { latitude, longitude, accuracy } = best.coords;
      const accNum = Number.isFinite(accuracy) ? Math.round(accuracy) : null;
      if (Number.isFinite(accNum) && accNum > ACC_THRESHOLD_M) {
        setGeoMessage(`ความแม่นยำต่ำเกินไป (±${accNum} m) — ไม่อัปเดตพิกัด ลองใหม่กลางแจ้งหรือใช้มือถือ`);
        return;
      }
      const latFixed = Number(latitude).toFixed(6);
      const lngFixed = Number(longitude).toFixed(6);
      setFormData((prev) => ({ ...prev, latitude: latFixed, longitude: lngFixed }));
      const accText = Number.isFinite(accNum) ? ` (±${accNum} m)` : '';
      setGeoMessage(`ดึงพิกัดสำเร็จ${accText}`);
    } catch (error) {
      console.error('[BranchForm] geolocation error', error);
      setGeoMessage('ไม่สามารถดึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
    }
  };

  // ค่าภาค (อ่านอย่างเดียว — คำนวณอัตโนมัติจาก provinceCode)
  const regionText = useMemo(() => {
    const pcode = formData.provinceCode ? String(formData.provinceCode) : '';
    const found = pcode ? provinces.find((p) => String(p.code) === pcode) : null;
    return formData.region || found?.region || '';
  }, [formData.region, formData.provinceCode, provinces]);
  // วางพิกัดจากคลิปบอร์ด (รองรับรูปแบบ "lat, lng")
  const handlePasteLatLng = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        setGeoMessage('เบราว์เซอร์ไม่อนุญาตการวางจากคลิปบอร์ด');
        dlog('clipboard.readText not available');
        return;
      }
      const raw = await navigator.clipboard.readText();
      dlog('raw clipboard:', JSON.stringify(raw).slice(0, 200));

      const cleanNum = (s) => {
        const stripped = (s || '').trim().replace(/[^-0-9.]+/g, '');
        return stripped ? Number(stripped) : NaN;
      };
      const inScope = (a, b) => Number.isFinite(a) && Number.isFinite(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180;
      const preferDecimal = (n) => String(n).includes('.') && (String(n).split('.')[1] || '').length >= 3;

      // ป้องกันการหยิบตัวเลขจากซอร์สโค้ด/ข้อความยาวโดยไม่ได้ตั้งใจ
      const looksLikeCode = (raw.length > 500) && (
        raw.includes('import React') ||
        raw.includes('AddressForm') ||
        raw.includes('BranchForm') ||
        raw.includes("from '@") ||
        raw.includes('className=')
      );
      const SCAN_TOKENS = !looksLikeCode;

      // --- URL-first: รูปแบบ Google Maps ที่พบบ่อยก่อน ---
      {
        const pickURL = (lat, lng, reason) => {
          const la = Number(lat), ln = Number(lng);
          if (!Number.isFinite(la) || !Number.isFinite(ln)) return false;
          if (la < -90 || la > 90 || ln < -180 || ln > 180) return false;
          setFormData((prev) => ({ ...prev, latitude: la.toFixed(6), longitude: ln.toFixed(6) }));
          setGeoMessage(`วางพิกัดจากคลิปบอร์ดแล้ว [${reason}]`);
          dlog('SET via URL-first', { la, ln, reason });
          return true;
        };
        const toPair = (str) => {
          const nums = [];
          let cur = '';
          for (const ch of (str || '')) {
            if ('0123456789.-'.includes(ch)) {
              cur += ch;
            } else {
              if (cur) { nums.push(cur); cur = ''; if (nums.length >= 2) break; }
            }
          }
          if (cur && nums.length < 2) nums.push(cur);
          return nums;
        };
        try {
          const text = (raw || '').trim();
          const normalizeUrl = (s) => {
            let t = String(s || '').trim();
            const first = t[0], last = t[t.length - 1];
            if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '(' && last === ')')) {
              t = t.slice(1, -1).trim();
            }
            const lower = t.toLowerCase();
            if (lower.startsWith('www.') || lower.startsWith('maps.') || lower.startsWith('google.') || lower.startsWith('goo.gl/maps')) {
              t = 'https://' + t;
            }
            return t;
          };
          // 1.1 @lat,lng,zoomz
          const atIdx = text.indexOf('@');
          if (atIdx > -1) {
            const after = text.slice(atIdx + 1);
            const p = toPair(after);
            if (p.length >= 2 && pickURL(p[0], p[1], '@-url')) return;
          }
          // 1.2 ?q=lat,lng
          try {
            const u = new URL(normalizeUrl(text));
            const q = u.searchParams.get('q');
            if (q) {
              const p = toPair(q);
              if (p.length >= 2 && pickURL(p[0], p[1], 'q-param')) return;
            }
            // 1.3 /place/lat,lng
            const placeIdx = u.pathname.indexOf('/place/');
            if (placeIdx > -1) {
              const sub = decodeURIComponent(u.pathname.slice(placeIdx + 7));
              const p = toPair(sub);
              if (p.length >= 2 && pickURL(p[0], p[1], 'place-path')) return;
            }
          } catch (err) {
            dlog('URL parse not valid (q/place), skip', err);
          }
        } catch (err) {
          dlog('URL-first block failed, continue', err);
        }
      }

      // ก่อนอื่นลองคู่แบบ 'lat, lng' ตรง ๆ ทั้งสตริง (กรณีผู้ใช้คัดลอกตัวเลขเพียว ๆ)
      {
        const t = raw.trim();
        const idx = t.indexOf(',');
        if (idx > -1 && t.indexOf(',', idx + 1) === -1) {
          const a = Number(t.slice(0, idx).trim());
          const b = Number(t.slice(idx + 1).trim());
          if (inScope(a, b)) {
            setFormData((prev) => ({ ...prev, latitude: a.toFixed(6), longitude: b.toFixed(6) }));
            setGeoMessage('วางพิกัดจากคลิปบอร์ดแล้ว [strict]');
            dlog('SET via strict-comma', a, b);
            return;
          }
        }
      }

      // 1) พยายามแบบคอมม่าเป็นอันดับแรก (รองรับข้อความธรรมดาและ URL ที่มักคั่นด้วยคอมม่า)
      if (!looksLikeCode && raw.includes(',')) {
        const parts = raw.split(',');
        for (let i = 0; i + 1 < parts.length; i++) {
          const lat = cleanNum(parts[i]);
          const lng = cleanNum(parts[i + 1]);
          dlog('comma candidate:', lat, lng);
          if (inScope(lat, lng) && (preferDecimal(lat) || preferDecimal(lng))) {
            setFormData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
            setGeoMessage('วางพิกัดจากคลิปบอร์ดแล้ว');
            dlog('SET via comma parts');
            return;
          }
        }
      }

      // 2) fallback: แยกทุกตัวเลข แล้วหา pair ที่มีทศนิยมและอยู่ในช่วง
      if (SCAN_TOKENS) { const tokens = raw.trim().split(/[^-0-9.]+/).filter(Boolean);
      dlog('tokens sample:', tokens.slice(0, 20), 'len=', tokens.length);
      for (let i = 0; i + 1 < tokens.length; i++) {
        const aStr = tokens[i];
        const bStr = tokens[i + 1];
        const a = Number(aStr);
        const b = Number(bStr);
        const decPair = aStr.includes('.') && bStr.includes('.');
        if (decPair && inScope(a, b)) {
          setFormData((prev) => ({ ...prev, latitude: a.toFixed(6), longitude: b.toFixed(6) }));
          setGeoMessage('วางพิกัดจากคลิปบอร์ดแล้ว');
          dlog('SET via scan-decimal', a, b);
          return;
        }
      }

      // 3) สำรองสุดท้าย: รับคู่ที่อยู่ในช่วง (แม้ไม่มีทศนิยม)
      for (let i = 0; i + 1 < tokens.length; i++) {
        const a = Number(tokens[i]);
        const b = Number(tokens[i + 1]);
        if (inScope(a, b)) {
          setFormData((prev) => ({ ...prev, latitude: a.toFixed(6), longitude: b.toFixed(6) }));
          setGeoMessage('วางพิกัดจากคลิปบอร์ดแล้ว');
          dlog('SET via scan-any', a, b);
          return;
        }
      }
    }

      const isShort = raw.includes('maps.app.goo.gl') || raw.includes('goo.gl/maps');
      setGeoMessage(isShort
        ? 'ลิงก์ย่อของ Google Maps มักไม่มีพิกัดในตัว — โปรดคัดลอกพิกัดโดยตรง หรือใช้ URL ที่มี @lat,lng หรือ ?q=lat,lng'
        : 'ไม่พบรูปแบบพิกัด เช่น 13.756331, 100.501762');
      dlog('no candidate matched');
      setShowManualPaste(true);
      setManualPasteText(raw);
    } catch (err) {
      console.error('[BranchForm] paste latlng error', err);
      setGeoMessage('วางพิกัดไม่สำเร็จ');
    }
  };
  // Manual confirm for pasted text (fallback when clipboard isn't a maps URL/coords)
  const handleManualConfirm = () => {
    const raw = String(manualPasteText || '').trim();
    dlog('manual input:', raw);

    const normalizeUrl = (s) => {
      let t = String(s || '').trim();
      const first = t[0], last = t[t.length - 1];
      if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '(' && last === ')')) {
        t = t.slice(1, -1).trim();
      }
      const lower = t.toLowerCase();
      if (lower.startsWith('www.') || lower.startsWith('maps.') || lower.startsWith('google.') || lower.startsWith('goo.gl/maps')) {
        t = 'https://' + t;
      }
      return t;
    };

    const inScope = (a, b) => Number.isFinite(a) && Number.isFinite(b) && a >= -90 && a <= 90 && b >= -180 && b <= 180;
    const pick = (lat, lng, reason) => {
      const la = Number(lat), ln = Number(lng);
      if (!inScope(la, ln)) return false;
      setFormData((prev) => ({ ...prev, latitude: la.toFixed(6), longitude: ln.toFixed(6) }));
      setGeoMessage(`ตั้งค่าพิกัดแล้ว${reason ? ` [${reason}]` : ''}`);
      dlog('SET lat/lng (manual):', { la, ln, reason });
      setShowManualPaste(false);
      setManualPasteText('');
      return true;
    };
    const toPair = (str) => {
      const nums = [];
      let cur = '';
      for (const ch of (str || '')) {
        if ('0123456789.-'.includes(ch)) cur += ch; else { if (cur) { nums.push(cur); cur = ''; if (nums.length >= 2) break; } }
      }
      if (cur && nums.length < 2) nums.push(cur);
      return nums;
    };

    // Try URL patterns first
    const atIdx = raw.indexOf('@');
    if (atIdx > -1) {
      const after = raw.slice(atIdx + 1);
      const p = toPair(after);
      if (p.length >= 2 && pick(p[0], p[1], '@-url(manual)')) return;
    }
    try {
      const u = new URL(normalizeUrl(raw));
      const q = u.searchParams.get('q');
      if (q) {
        const p = toPair(q);
        if (p.length >= 2 && pick(p[0], p[1], 'q-param(manual)')) return;
      }
      const placeIdx = u.pathname.indexOf('/place/');
      if (placeIdx > -1) {
        const sub = decodeURIComponent(u.pathname.slice(placeIdx + 7));
        const p = toPair(sub);
        if (p.length >= 2 && pick(p[0], p[1], 'place-path(manual)')) return;
      }
    } catch (err) {
      dlog('manual URL parse not valid, continue', err);
    }

    // Strict comma "lat, lng"
    {
      const idx = raw.indexOf(',');
      if (idx > -1 && raw.indexOf(',', idx + 1) === -1) {
        const a = Number(raw.slice(0, idx).trim());
        const b = Number(raw.slice(idx + 1).trim());
        if (pick(a, b, 'strict')) return;
      }
    }

    // General tokens scan
    const tokens = raw.split(/[^-0-9.]+/).filter(Boolean);
    for (let i = 0; i + 1 < tokens.length; i++) {
      const aStr = tokens[i], bStr = tokens[i + 1];
      if (aStr.includes('.') && bStr.includes('.')) {
        const a = Number(aStr), b = Number(bStr);
        if (pick(a, b, 'scan-decimal')) return;
      }
    }
    for (let i = 0; i + 1 < tokens.length; i++) {
      const a = Number(tokens[i]), b = Number(tokens[i + 1]);
      if (pick(a, b, 'scan-any')) return;
    }

    setGeoMessage('ไม่พบรูปแบบพิกัดที่ถูกต้อง ลองวางเป็น "lat, lng" หรือ URL จาก Google Maps');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">ชื่อสาขา</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
          disabled={isEdit}
        />
      </div>

      {/* เบอร์โทร */}
      <div>
        <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
        <input
          type="text"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="เช่น 02-123-4567"
        />
      </div>

      {/* ที่อยู่มาตรฐานใหม่ */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">ที่อยู่สาขา</label>
        <AddressForm value={addressValue} onChange={handleAddressChange} required />
        <p className="text-xs text-gray-500">ระบุที่อยู่/ถนน แล้วเลือก จังหวัด → อำเภอ → ตำบล ระบบจะเติมรหัสไปรษณีย์ให้อัตโนมัติ แต่สามารถแก้ไขได้</p>
      </div>

      {/* ภาค (อ่านอย่างเดียว) */}
      <div>
        <label className="block text-sm font-medium mb-1">ภาค (อัตโนมัติจากจังหวัด)</label>
        <input
          type="text"
          value={regionText}
          readOnly
          className="w-full border rounded px-3 py-2 bg-gray-50"
        />
      </div>

      {/* RBAC toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rbac-toggle"
          checked={!!formData.RBACEnabled}
          onChange={(e) => setFormData({ ...formData, RBACEnabled: e.target.checked })}
        />
        <label htmlFor="rbac-toggle" className="text-sm">
          เปิดใช้งานระบบ RBAC (สิทธิ์เฉพาะสาขา)
        </label>
      </div>

      {/* พิกัด (แสดงเฉพาะเมื่อเปิดใช้งาน) */}

      {allowLocationDetect && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="number"
              value={formData.latitude || ''}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="w-full border rounded px-3 py-2"
              step="any"
              placeholder="เช่น 13.7563"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="number"
              value={formData.longitude || ''}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="w-full border rounded px-3 py-2"
              step="any"
              placeholder="เช่น 100.5018"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDetectLocation}
              className="text-sm text-green-600 px-6 py-2 border border-green-600 rounded hover:bg-green-50 min-w-[120px]"
            >
              📍 ใช้พิกัด
            </button>
            <button
              type="button"
              onClick={handlePasteLatLng}
              className="text-sm text-slate-700 px-3 py-2 border border-slate-300 rounded hover:bg-slate-50"
              title="วางพิกัดจาก Google Maps: 13.756331, 100.501762"
            >
              📋 วางพิกัด
            </button>
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="text-sm text-slate-700 px-3 py-2 border border-slate-300 rounded hover:bg-slate-50"
              title="เปิดแผนที่เพื่อเลือกพิกัด"
            >
              🗺️ เลือกจากแผนที่
            </button>
            <span className="text-xs text-gray-600 ml-2">{geoMessage}</span>
            {showManualPaste && (
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="text"
                  value={manualPasteText}
                  onChange={(e) => setManualPasteText(e.target.value)}
                  className="border rounded px-2 py-1 w-64"
                  placeholder="วางพิกัดหรือ URL Google Maps ที่นี่"
                />
                <button
                  type="button"
                  onClick={handleManualConfirm}
                  className="text-sm px-3 py-1 border rounded"
                  title="ยืนยันค่าพิกัดจากช่องด้านซ้าย"
                >ยืนยัน</button>
                <button
                  type="button"
                  onClick={() => { setShowManualPaste(false); setManualPasteText(''); }}
                  className="text-sm px-3 py-1 border rounded"
                >ยกเลิก</button>
              </div>
            )}
            {showMapPicker && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg w-[90vw] max-w-3xl h-[80vh] shadow-lg flex flex-col">
                  <div className="p-3 border-b">
                    <div className="font-medium mb-2">เลือกพิกัดจากแผนที่ (คลิกหรือเลื่อนหมุด)</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mapSearch}
                        onChange={(e) => setMapSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleMapSearch(); } }}
                        className="border rounded px-2 py-1 flex-1"
                        placeholder="ค้นหาสถานที่/ตำบล/อำเภอ/จังหวัด (Nominatim)"
                      />
                      <button type="button" onClick={handleMapSearch} className="text-sm px-3 py-1 border rounded min-w-[84px]">
                        {mapSearching ? 'ค้นหา...' : 'ค้นหา'}
                      </button>
                      <button type="button" onClick={handleMapLocate} className="text-sm px-3 py-1 border rounded min-w-[120px]">
                        {mapLocating ? 'กำลังระบุตำแหน่ง...' : '📡 ตำแหน่งฉัน'}
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{mapInfo || (mapAcc != null ? `ความแม่นยำประมาณ ±${mapAcc} m` : '')}</div>
                    {mapResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-auto border rounded divide-y">
                        {mapResults.map((r, idx) => (
                          <button key={idx} type="button" className="block w-full text-left px-2 py-1 hover:bg-gray-50" onClick={() => handlePickResult(r)}>
                            {r.display_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1"><div ref={mapDivRef} style={{ width: '100%', height: '100%' }} /></div>
                  <div className="p-3 border-t flex justify-end gap-2">
                    <button type="button" onClick={closeMapPicker} className="text-sm px-3 py-1 border rounded">ยกเลิก</button>
                    <button type="button" onClick={handleMapUse} className="text-sm px-3 py-1 border rounded bg-green-600 text-white">ใช้ตำแหน่งนี้</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-right">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 min-w-[160px]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default BranchForm;


