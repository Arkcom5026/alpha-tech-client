# Online Store Brand Content Studio

## Mission

Elevate Online Store Studio from a theme/color prototype into a production merchant brand-content workspace while preserving the Alpha-Tech platform theme as the visual authority.

## Product authority

The platform owns:

- Storefront theme
- Typography
- Spacing
- Component language
- Accessibility
- Responsive behavior
- Interaction patterns

Merchants may customize content only:

- Store logo
- Store cover and hero artwork
- Promotion artwork and copy
- Store headline and description
- Featured content
- Section visibility and ordering within platform-approved patterns

## Increment sequence

1. Lock platform theme controls in Merchant Studio.
2. Introduce `contentConfiguration` editing and payload adoption.
3. Extract a shared storefront renderer for Draft Preview and Public Storefront parity.
4. Add desktop, tablet, and mobile preview modes.
5. Add contract gates for locked-theme authority and content projection.

## Architecture boundary

```text
Alpha-Tech Platform Theme
          |
          +-- typography
          +-- layout rules
          +-- reusable storefront components
          +-- responsive behavior
          |
Merchant Brand Content
          +-- logo
          +-- hero / cover
          +-- promotion
          +-- headline / description
          +-- approved section configuration
```

## Safety boundaries

- Public storefront reads published snapshot state only.
- Draft preview may render draft content but must not expose it through public routes.
- Store isolation remains scoped to the authenticated/current store.
- Existing anonymous browsing, cart, identity-at-commitment, and commitment flows remain intact.
- No backend business logic moves into the client.
- No direct production deployment in this increment.

## Verification gates

- Locked platform-theme contract
- Merchant content configuration contract
- Draft-preview/public-renderer parity contract
- Existing canonical storefront route contract
- Existing anonymous cart and commitment contracts
- Typecheck
- Production build
