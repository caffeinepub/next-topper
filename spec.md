# Next Topper

## Current State
Admin Panel requires login via Internet Identity + admin role. No additional password protection exists.

## Requested Changes (Diff)

### Add
- Backend: `setAdminPassword(password: Text)` — admin-only, stores a hashed/plain password
- Backend: `checkAdminPassword(password: Text): async Bool` — verifies password
- Frontend: Password gate screen in AdminPage — shown after login/admin check, before panel content
- Frontend: "Change Password" section in Admin Panel settings area
- Default password: "nexttopper123" (admin can change it)

### Modify
- AdminPage: Insert password gate step between admin-role check and main panel UI

### Remove
- Nothing

## Implementation Plan
1. Add `adminPassword` stable var to backend with default "nexttopper123"
2. Add `setAdminPassword` (admin-only) and `checkAdminPassword` query functions
3. Regenerate frontend bindings
4. In AdminPage, add `passwordUnlocked` state; show a password input screen if not unlocked
5. On correct password, set `passwordUnlocked = true` (session only)
6. Add "Change Password" form at bottom of Admin Panel
