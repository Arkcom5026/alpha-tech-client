# Project Boot Protocol

Status: ACTIVE / PROJECT STANDARD
Protocol ID: PBP-CORE-001
Scope: Project-wide task boot standard
Repository: alpha-tech-client

---

## 1. Purpose

This document defines the project-wide boot protocol for new tasks, new ChatGPT conversations, and future contributors.

เป้าหมายคือทำให้ทุก Task ใหม่เริ่มต้นจากบริบทที่ถูกต้อง ไม่รีบวิเคราะห์หรือแก้โค้ดก่อนอ่านเอกสารหลักครบ

---

## 2. Core Principle

```txt
No Analysis Before Boot.
No Implementation Before Certification.
No Runtime Change Without ADR + Approval.
```

---

## 3. Protocol Family

```txt
PBP-CORE-001  Project-wide Boot Protocol
PBP-FE-001    Frontend Boot Protocol
PBP-BE-001    Backend Boot Protocol / RESERVED
```

Backend protocol is reserved and must remain unimplemented until Backend Architecture Certification begins.

---

## 4. Standard Boot Stages

### Stage 1 — Locate Repository

Confirm the active repository.

Expected for current frontend work:

```txt
Arkcom5026/alpha-tech-client
```

---

### Stage 2 — Read Certification Index

For frontend work:

```txt
docs/frontend/CERTIFICATION_INDEX.md
```

---

### Stage 3 — Read Readiness Gate

For frontend implementation planning:

```txt
docs/frontend/Implementation_Readiness_Review.md
```

---

### Stage 4 — Read ADR / Decision Log

For frontend runtime work:

```txt
docs/frontend/Architecture_Decision_Log.md
```

---

### Stage 5 — Boot Report

The assistant must report boot status before analysis.

Required Boot Report fields:

```txt
Repository
Boot Protocol
Boot Progress
Certification Status
Implementation Status
Current Phase
Locked Decisions
Next Required Reads
Ready for Analysis? YES/NO
```

---

## 5. Frontend Boot Protocol Reference

Frontend boot protocol is defined in:

```txt
docs/frontend/CERTIFICATION_INDEX.md
```

Protocol ID:

```txt
PBP-FE-001
```

Frontend boot is complete only after reading:

```txt
1. docs/frontend/CERTIFICATION_INDEX.md
2. docs/frontend/Implementation_Readiness_Review.md
3. docs/frontend/Architecture_Decision_Log.md
```

---

## 6. Backend Lock Rule

Backend Auth Refactor remains locked until frontend runtime is stable and explicitly approved for Backend Architecture Certification.

Current backend status:

```txt
LOCKED
```

No Backend Auth, session, refresh token, branch authorization, or permission runtime changes should be proposed during frontend stabilization.

---

## 7. Engineering Change Protocol

All runtime changes must follow:

```txt
Blueprint
  ↓
Certification
  ↓
ADR
  ↓
Approval
  ↓
Implementation
  ↓
Verification
  ↓
Blueprint Update
```

---

## 8. Ready For Analysis Criteria

The assistant may begin analysis only when:

```txt
Boot documents are read.
Boot report is produced.
Current phase is identified.
Locked decisions are identified.
Next action is aligned with approved roadmap.
```

The assistant may propose implementation only when:

```txt
Implementation readiness is approved.
Required ADRs are approved.
Scope is limited to the current phase.
No locked runtime is touched.
```

---

## 9. Working Conclusion

Project Boot Protocol turns repository onboarding into a repeatable process.

Every new task should begin with boot, not guessing.
