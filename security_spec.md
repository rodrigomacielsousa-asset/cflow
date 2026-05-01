# Security Specification - C-Flow

## Data Invariants
- **Multi-tenancy**: All data (patients, appointments, records) must be strictly isolated within the `/clinics/{clinicId}` subtree.
- **Relational Access**: Access to any document under `/clinics/{clinicId}` is contingent on the user having a valid role in the `clinicRoles` map of their `/users/{userId}` profile, linked to the `clinicId`.
- **Medical Record Privacy**: Medical records under `/clinics/{clinicId}/patients/{patientId}/medical_records/{recordId}` are only accessible by `practitioner` or `admin` roles.
- **Appointment Integrity**: Appointments cannot be created with past start times (by clients) and must have a valid status.

## The Dirty Dozen Payloads (Red Team Test Scenarios)
1. **Cross-Tenant Read**: User A (Clinic 1) attempts to read Patient B (Clinic 2).
2. **Cross-Tenant Write**: User A attempts to create an Appointment in Clinic 2.
3. **Role Escalation**: A `receptionist` attempts to write a `MedicalRecord`.
4. **Identity Spoofing**: User A attempts to create a `User` profile for User B.
5. **PII Scraping**: Anonymous user attempts to list `/clinics/{clinicId}/patients`.
6. **Appointment Poisoning**: Creating an appointment with a 1MB string as `status`.
7. **Record Deletion**: A `practitioner` attempts to delete an old `MedicalRecord` (only `admin` or immutable logs allowed).
8. **Shadow Field Injection**: Adding `isVerified: true` to a Clinic document on update.
9. **Id Poisoning**: Using a 10KB string as a document ID.
10. **Time Warp**: Creating an appointment with `updatedAt` set in the future.
11. **Orfaned Record**: Creating a `MedicalRecord` for a non-existent `Patient`.
12. **Self-Promotion**: A user updating their own `clinicRoles` in their `/users/{userId}` document to make themselves `admin`.

## Verification Strategy
- Use `isValidId()` for all ID path variables.
- Use `exists()` and `get()` for relational checks.
- Use `affectedKeys().hasOnly()` for all updates.
- Explicit schema validation for all `create` and `update` operations.
