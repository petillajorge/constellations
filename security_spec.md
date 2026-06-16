# Security Specification - Freckle Constellations Cloud Store

## 1. Data Invariants
- A constellation record can never be created or altered without an authenticated user ID (`request.auth.uid`).
- A user can only read, create, update, or delete their own custom saved constellation documents (`resource.data.userId == request.auth.uid`).
- The constellation ID must be a high-integrity, valid alphanumeric string to prevent ID-poisoning.
- The name of a constellation must be a bounded string (less than 200 characters) to prevent database resource exhaustion.

## 2. The "Dirty Dozen" Payloads
Below are 12 malicious payloads designed to violate system boundaries and their expected rejection:

1. **Anonymous Write Entry**: Creating a constellation without authentication. (Expected: `PERMISSION_DENIED`)
2. **Identifier Hijack**: Setting `userId` in the payload to `victim_uid_123` while acting under `attacker_uid_456`. (Expected: `PERMISSION_DENIED`)
3. **Cross-User Snooping**: Reading a collection or document owned by `victim_uid_123` while logged in as `attacker_uid_456`. (Expected: `PERMISSION_DENIED`)
4. **Foreign Document Hostage**: Deleting a constellation record owned by `victim_uid_123` as `attacker_uid_456`. (Expected: `PERMISSION_DENIED`)
5. **ID Poisoning Attack**: Saving a document with an ID containing special command characters or extremely large payload size. (Expected: `PERMISSION_DENIED`)
6. **Title Boundary Exhaustion**: Injecting a custom constellation title exceeding 200 characters. (Expected: `PERMISSION_DENIED`)
7. **Identity Mutation**: Updating an existing constellation to change the `userId` field to another user. (Expected: `PERMISSION_DENIED`)
8. **Shadow Field Injection**: Inserting arbitrary fields such as `isAdmin: true` into the constellation data payload. (Expected: `PERMISSION_DENIED`)
9. **Creation Timestamp Spoof**: Sending manual client-side timestamps instead of conforming to the strict server transactional timeline. (Expected: `PERMISSION_DENIED`)
10. **Zero-Star Orphanage**: Creating a constellation record without the required `starNodes` payload. (Expected: `PERMISSION_DENIED`)
11. **Malicious Empty Name**: Creating a constellation with an empty or undefined title. (Expected: `PERMISSION_DENIED`)
12. **Public Scrape Injection**: Requesting list operations without filter guards matching the signed-in subscriber's ID. (Expected: `PERMISSION_DENIED`)

## 3. Security Rule Verification
Verification is implemented securely in the compiled `/firestore.rules` ruleset.
