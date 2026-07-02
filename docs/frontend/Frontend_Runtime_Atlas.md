# Frontend Runtime Atlas

Status: DRAFT / CERTIFICATION IN PROGRESS

## Purpose
Master index for all frontend runtime domains, architecture maps, certification documents, ADRs, and risk references.

## Runtime Domains

- Application Runtime
- Auth Runtime
- Session Runtime
- Transport Runtime (apiClient)
- Branch Runtime
- Router Runtime
- POS Runtime
- Online Runtime
- Cart Runtime
- Checkout Runtime
- Order Runtime
- Logout Runtime
- Error Recovery Runtime

## Certification Index

### Architecture
- Frontend_Upgrade_Master_Plan.md
- Risk_Register.md
- Refactor_Roadmap.md
- Architecture_Decision_Log.md

### Maps
- Dependency_Map.md
- Runtime_Flow_Map.md
- Data_Ownership_Map.md
- API_Surface_Map.md
- State_Management_Map.md
- Component_Layer_Map.md
- Legacy_Surface_Map.md

### Runtime Certification
- Frontend_Runtime_Certification.md
- Runtime_Sequence_Catalog.md
- Runtime_Dependency_Graph.md
- Runtime_Event_Catalog.md
- Error_Recovery_Catalog.md

## Runtime Owner Summary

| Runtime | Primary Owner |
|---------|---------------|
| Auth | authStore |
| Transport | apiClient |
| Branch | branchStore |
| Cart | cartStore |
| Online Order | orderOnlineStore |
| Router | AppRouter |
| POS Shell | HeaderPos + SidebarLoader |

## Critical Runtime Chains

1. Browser → App → Bootstrap → Refresh → Verify → Branch
2. Login → Auth → Branch → Navigation
3. Checkout → Cart → Branch → Order
4. Logout → Cleanup → Navigation
5. 401 → Refresh → Retry

## Working Principle

Every future implementation must be traceable through:

Blueprint
→ ADR
→ Runtime Atlas
→ Runtime Sequence
→ Dependency Graph
→ Event Catalog
→ Error Recovery
→ Implementation
→ Verification

## Next Step

Create:

`docs/frontend/Implementation_Readiness_Review.md`
