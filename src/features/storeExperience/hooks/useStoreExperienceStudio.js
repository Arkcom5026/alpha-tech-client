import { useEffect, useMemo, useState } from 'react';
import {
  getPartnerStoreCapability,
  getStoreExperienceDraft,
  publishStoreExperience,
  savePartnerStoreCapability,
  saveStoreExperienceDraft,
  unpublishStoreExperience,
} from '../api/storeExperienceApi';
import {
  createDefaultDraft,
  defaultCapability,
} from '../constants/storeExperienceDefaults';
import {
  buildCapabilityPayload,
  buildDraftPayload,
} from '../utils/storeExperiencePayloads';

const initialState = Object.freeze({ loading: true, busy: false, error: '', success: '' });

const messageFrom = (error) => error?.response?.data?.message || error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

const useStoreExperienceStudio = () => {
  const [capability, setCapability] = useState(defaultCapability);
  const [draft, setDraft] = useState(createDefaultDraft());
  const [state, setState] = useState(initialState);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activePanel, setActivePanel] = useState('identity');

  useEffect(() => {
    let active = true;

    Promise.all([getPartnerStoreCapability(), getStoreExperienceDraft()])
      .then(([nextCapability, nextDraft]) => {
        if (!active) return;
        const fallbackDraft = createDefaultDraft();
        setCapability({ ...defaultCapability, ...(nextCapability || {}) });
        setDraft({
          ...fallbackDraft,
          ...(nextDraft || {}),
          themePreset: 'platform-default',
          layoutPreset: 'platform-default',
          themeTokens: fallbackDraft.themeTokens,
          sectionConfiguration: nextDraft?.sectionConfiguration || fallbackDraft.sectionConfiguration,
          contentConfiguration: {
            ...fallbackDraft.contentConfiguration,
            ...(nextDraft?.contentConfiguration || {}),
            identity: {
              ...fallbackDraft.contentConfiguration.identity,
              ...(nextDraft?.contentConfiguration?.identity || {}),
            },
            hero: {
              ...fallbackDraft.contentConfiguration.hero,
              ...(nextDraft?.contentConfiguration?.hero || {}),
            },
            promotions: nextDraft?.contentConfiguration?.promotions || [],
          },
        });
        setState({ loading: false, busy: false, error: '', success: '' });
      })
      .catch((error) => {
        if (!active) return;
        setState({ loading: false, busy: false, error: messageFrom(error), success: '' });
      });

    return () => { active = false; };
  }, []);

  const isLive = Boolean(capability.storefrontEnabled);
  const hasDraftChanges = isLive && draft.status !== 'PUBLISHED';
  const enabledSections = useMemo(
    () => (draft.sectionConfiguration || []).filter((section) => section.enabled),
    [draft.sectionConfiguration]
  );

  const updateCapability = (patch) => setCapability((current) => ({ ...current, ...patch }));
  const updateContent = (group, patch) => setDraft((current) => ({
    ...current,
    status: current.status === 'PUBLISHED' ? 'DRAFT' : current.status,
    contentConfiguration: {
      ...current.contentConfiguration,
      [group]: {
        ...(current.contentConfiguration?.[group] || {}),
        ...patch,
      },
    },
  }));

  const toggleSection = (type) => setDraft((current) => ({
    ...current,
    status: current.status === 'PUBLISHED' ? 'DRAFT' : current.status,
    sectionConfiguration: (current.sectionConfiguration || []).map((section) =>
      section.type === type ? { ...section, enabled: !section.enabled } : section
    ),
  }));

  const run = async (operation) => {
    setState((current) => ({ ...current, busy: true, error: '', success: '' }));
    try {
      await operation();
    } catch (error) {
      setState({ loading: false, busy: false, error: messageFrom(error), success: '' });
    }
  };

  const save = () => run(async () => {
    const [savedCapability, savedDraft] = await Promise.all([
      savePartnerStoreCapability(buildCapabilityPayload(capability, capability.storefrontEnabled)),
      saveStoreExperienceDraft(buildDraftPayload(draft)),
    ]);
    setCapability({ ...defaultCapability, ...(savedCapability || {}) });
    setDraft((current) => ({ ...current, ...(savedDraft || {}) }));
    setState({
      loading: false,
      busy: false,
      error: '',
      success: isLive
        ? 'บันทึกแบบร่างแล้ว หน้าร้านที่เผยแพร่ยังเปิดตามปกติ'
        : 'บันทึกแบบร่างหน้าร้านเรียบร้อยแล้ว',
    });
  });

  const publish = () => run(async () => {
    const [savedCapability, savedDraft] = await Promise.all([
      savePartnerStoreCapability(buildCapabilityPayload(capability, true)),
      saveStoreExperienceDraft(buildDraftPayload(draft)),
    ]);
    setCapability({ ...defaultCapability, ...(savedCapability || {}), storefrontEnabled: true });
    setDraft((current) => ({ ...current, ...(savedDraft || {}) }));
    const published = await publishStoreExperience();
    setCapability((current) => ({ ...current, ...(published?.capability || {}), storefrontEnabled: true }));
    setDraft((current) => ({ ...current, ...(published?.experience || {}), status: 'PUBLISHED' }));
    setState({ loading: false, busy: false, error: '', success: 'เผยแพร่หน้าร้านเรียบร้อยแล้ว ลูกค้าสามารถเข้าชมได้ทันที' });
  });

  const unpublish = () => run(async () => {
    const result = await unpublishStoreExperience();
    setCapability((current) => ({ ...current, ...(result?.capability || {}), storefrontEnabled: false }));
    setDraft((current) => ({ ...current, ...(result?.experience || {}) }));
    setState({ loading: false, busy: false, error: '', success: 'ปิดหน้าร้านสาธารณะแล้ว แบบร่างและเวอร์ชันที่เผยแพร่ยังถูกเก็บไว้' });
  });

  const preview = () => {
    const slug = String(capability.storefrontSlug || '').trim();
    if (!slug) {
      setState((current) => ({ ...current, error: 'กรุณาระบุ URL ร้านก่อนดูหน้าร้าน', success: '' }));
      return;
    }
    window.open(`/${slug}`, '_blank', 'noopener,noreferrer');
  };

  return {
    capability,
    draft,
    state,
    previewMode,
    activePanel,
    isLive,
    hasDraftChanges,
    enabledSections,
    setPreviewMode,
    setActivePanel,
    updateCapability,
    updateContent,
    toggleSection,
    save,
    publish,
    unpublish,
    preview,
  };
};

export default useStoreExperienceStudio;
