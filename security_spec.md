# Security Spec: Firestore Access Control for Rajan Kaithwas Vedic Astrology

## 1. Data Invariants
- `bookings`: Anyone can create a consultation booking with validated contact fields (name, phone, serviceId). Users can read/manage their own bookings if authenticated. Admins can read/manage all bookings.
- `enquiries`: Anyone can submit an enquiry message (name, phone, message). Admins can read and manage enquiries.
- `kundli_records`: Authenticated users can create and read their own saved birth chart records (`userId == request.auth.uid`). Admins can read all records.

## 2. The Dirty Dozen Test Payloads
1. **Unauthenticated Admin Escalation**: Booking write with `role: "admin"` injected.
2. **Resource Poisoning ID**: Document ID length > 128 characters or special binary characters.
3. **Invalid Phone Payload**: `phone` with 500 characters or invalid characters.
4. **Invalid Name Payload**: `name` missing or zero length string `""`.
5. **Unauthorized Booking Read**: User A attempting to read User B's booking record.
6. **Unauthorized Enquiry List**: Non-admin attempting to list all customer enquiries.
7. **Cross-Tenant Kundli Spoofing**: Creating `kundli_records` with `userId` set to another user's UID.
8. **Malicious Long Message**: `enquiry` with message payload > 1000 characters.
9. **Status Manipulation**: Non-admin attempting to update booking `status` to `completed`.
10. **Immutable Timestamp Mutation**: Attempting to overwrite `createdAt` with a backdated string during update.
11. **Blanket Query Scraping**: Attempting `getDocs(collection('kundli_records'))` without filtering by `userId`.
12. **Ghost Field Injection**: Adding unapproved keys like `isVip: true` to an enquiry payload.

## 3. Test Runner Specification
Tests verify PERMISSION_DENIED on all unauthorized writes, spoofed user IDs, invalid field lengths, and illegal state transitions.
