# Store Device Print Profile — Parallel Wave

## Mission
Create a document-to-print-profile authority independent from any physical printer so templates can target capabilities instead of queue names.

## Required foundation
- Print profile contract
- Paper width and media contract
- Cut, drawer, raster and barcode capability requirements
- Document-type compatibility
- Profile versioning and immutable published revisions
- Preview projection contract

## Initial profiles
- Receipt 58 mm
- Receipt 80 mm
- A4 invoice / delivery document
- Barcode and label
- Kitchen receipt

## Invariants
- Documents reference a profile authority, not a specific printer.
- Profile changes cannot silently alter already-issued document snapshots.
- Unsupported media/capabilities fail before job creation.
- Existing bill editing and document correction flows remain unchanged.
- No physical printing is enabled in this wave.

## Verification
- Profile validation tests.
- Document compatibility matrix tests.
- Immutable revision tests.
- Dynamic receipt content-height projection tests.
