import StoreHomepageSectionsPanel from './StoreHomepageSectionsPanel';
import StoreIdentityPanel from './StoreIdentityPanel';
import StoreMediaPanel from './StoreMediaPanel';
import StorefrontPreview from './StorefrontPreview';

const StoreStudioWorkspace = ({
  activePanel,
  capability,
  content,
  enabledSections,
  previewMode,
  onCapabilityChange,
  onIdentityChange,
  onHeroChange,
  onPreviewModeChange,
  onToggleSection,
}) => (
  <main className="space-y-6">
    {activePanel === 'identity' ? (
      <StoreIdentityPanel
        capability={capability}
        content={content}
        onCapabilityChange={onCapabilityChange}
        onIdentityChange={onIdentityChange}
        onHeroChange={onHeroChange}
      />
    ) : null}

    {activePanel === 'media' ? <StoreMediaPanel content={content} /> : null}

    {activePanel === 'homepage' ? (
      <StoreHomepageSectionsPanel
        sections={enabledSections}
        onToggleSection={onToggleSection}
      />
    ) : null}

    <StorefrontPreview
      capability={capability}
      content={content}
      enabledSections={enabledSections}
      previewMode={previewMode}
      onPreviewModeChange={onPreviewModeChange}
    />
  </main>
);

export default StoreStudioWorkspace;
