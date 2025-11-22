# 🔄 Username Modal Flow - Update Documentation

## 📋 Overview

This document explains the updated username modal flow that only shows the modal **after clicking "Create New Room"**, not on page load.

---

## ✨ What Changed

### Before (Old Behavior)
❌ Modal appeared immediately on page load if no username saved
❌ Confusing - users saw modal before doing anything
❌ Felt intrusive

### After (New Behavior)
✅ Modal appears **only after** clicking "Create New Room"
✅ Clean landing page experience
✅ Modal triggered by user action
✅ Returning users skip modal entirely

---

## 🎯 Updated Flows

### Flow 1: First-Time User

```
Step 1: Visit homepage
  └─ Landing page shows
  └─ No modal appears ✨

Step 2: Click "Create New Room" button
  └─ Check localStorage
  └─ No username found
  └─ Modal appears ✨

Step 3: Enter username + select gender
  └─ Click "Continue"
  └─ Save to localStorage
  └─ Create room with nanoid(10)

Step 4: Navigate to /editor/{roomId}
  └─ Editor loads with user's avatar
  └─ Username shown in header
```

### Flow 2: Returning User

```
Step 1: Visit homepage
  └─ Landing page shows
  └─ No modal appears

Step 2: Click "Create New Room" button
  └─ Check localStorage
  └─ Username found: "Alice" + "girl" ✅
  └─ Skip modal entirely ✨
  └─ Create room immediately

Step 3: Navigate to /editor/{roomId}
  └─ Editor loads with saved avatar
  └─ Username "Alice" shown in header
```

### Flow 3: Direct Editor Access (No Username)

```
Step 1: Visit /editor/abc123 directly
  └─ Check localStorage
  └─ No username found

Step 2: Modal appears automatically
  └─ Must enter username before editor loads
  └─ Enter name + gender
  └─ Click "Continue"

Step 3: Editor loads
  └─ User info saved
  └─ Collaboration starts
```

### Flow 4: Edit Profile from Editor

```
Step 1: In editor with username "Alice"
  └─ Click pencil icon (✏️) in header

Step 2: Modal opens with current info
  └─ Name pre-filled: "Alice"
  └─ Gender pre-selected: "Girl"

Step 3: Change info (e.g., to "Bob" + "Boy")
  └─ Click "Continue"
  └─ localStorage updated

Step 4: UI updates immediately
  └─ Avatar changes
  └─ Username changes
  └─ Yjs awareness updated
```

---

## 🔧 Technical Implementation

### Home Page (`app/page.tsx`)

#### Key Changes:

1. **Removed `showPrompt` from hook**
   - No longer auto-shows modal

2. **Added local `showModal` state**
   - Controlled manually by button click

3. **Updated `handleCreateRoom`**
   ```typescript
   const handleCreateRoom = () => {
     if (userInfo) {
       // Has saved data → navigate directly
       const roomId = nanoid(10);
       router.push(`/editor/${roomId}`);
     } else {
       // No saved data → show modal
       setShowModal(true);
     }
   };
   ```

4. **Modal closes after save**
   ```typescript
   const handleUsernameSave = (name, gender) => {
     saveUserInfo(name, gender);
     setShowModal(false);  // Close modal
     const roomId = nanoid(10);
     router.push(`/editor/${roomId}`);
   };
   ```

#### Component State:

```typescript
const [showModal, setShowModal] = useState(false);
```

- Starts as `false` (no modal on page load)
- Set to `true` only when button clicked AND no userInfo
- Set to `false` after save/generate

---

### useUsername Hook (`hooks/useUsername.ts`)

#### Key Changes:

1. **Removed `showPrompt` state**
   - No longer tracks modal visibility
   - Hook only manages data, not UI

2. **Removed `openPrompt` and `closePrompt`**
   - Modal control is now in components

3. **Simplified return value**
   ```typescript
   return {
     userInfo,           // User data or null
     isLoading,          // Loading from localStorage
     saveUserInfo,       // Save function
     updateUserInfo,     // Update function
     clearUserInfo,      // Clear function
     generateRandom,     // Random generation
   };
   ```

#### Hook Responsibility:

✅ Load data from localStorage
✅ Save data to localStorage
✅ Provide user info to components
❌ Control modal visibility (now in components)

---

### Editor Page (`app/editor/[roomId]/page.tsx`)

#### Key Changes:

1. **Added `showEditModal` state**
   - For "Edit Profile" button
   - Separate from new user modal

2. **Derived `showModalForNewUser`**
   ```typescript
   const showModalForNewUser = !isLoadingUser && !userInfo;
   ```
   - Shows modal if no user info (direct access)
   - No useEffect needed (derived state)

3. **Two modal instances**
   - New user modal: `showModalForNewUser`
   - Edit profile modal: `showEditModal`

#### Loading States:

```typescript
// Loading user info
if (isLoadingUser) {
  return <LoadingSpinner />;
}

// No user info (direct access)
if (!userInfo) {
  return <UsernamePrompt isOpen={showModalForNewUser} />;
}

// Has user info → show editor
return <Editor />;
```

---

## 🎨 User Experience

### Landing Page Experience

**Before**:
```
User visits / → MODAL POPS UP → Confusing!
```

**After**:
```
User visits / → Clean landing page → Click button → Modal appears
```

### Returning User Experience

**Before**:
```
User visits / → Check storage → Click button → Navigate
(Same as first-time, but faster)
```

**After**:
```
User visits / → Click button → Instantly navigate
(No modal, immediate action)
```

### Direct Editor Access

**Before & After** (same):
```
User visits /editor/abc123 → Check storage → Show modal if needed
```

This case still shows modal automatically because user bypassed home page.

---

## 📊 Component State Management

### State Ownership

| State | Owner | Purpose |
|-------|-------|---------|
| `userInfo` | useUsername hook | User data from localStorage |
| `isLoading` | useUsername hook | Loading state |
| `showModal` | HomePage | Modal for "Create Room" |
| `showEditModal` | EditorPage | Modal for "Edit Profile" |
| `showModalForNewUser` | EditorPage (derived) | Modal for direct access |

### Data Flow

```
localStorage
    ↓
useUsername hook
    ↓
userInfo + isLoading
    ↓
Components (HomePage, EditorPage)
    ↓
Local modal state (showModal, showEditModal)
    ↓
UsernamePrompt component
```

---

## 🧪 Testing

### Test 1: First-Time User (Clean State)

```bash
# Clear localStorage
localStorage.clear();

# Visit home page
http://localhost:3000

✅ Should see: Clean landing page, NO modal
✅ Click "Create New Room"
✅ Should see: Modal appears
✅ Enter "Alice" + select "Girl"
✅ Click "Continue"
✅ Should see: Navigate to /editor/{roomId}
✅ Should see: Alice's avatar in header
```

### Test 2: Returning User

```bash
# Keep localStorage with saved username

# Visit home page
http://localhost:3000

✅ Should see: Clean landing page, NO modal
✅ Click "Create New Room"
✅ Should see: Immediately navigate (NO modal)
✅ Should see: Saved avatar in header
```

### Test 3: Direct Editor Access (No Username)

```bash
# Clear localStorage
localStorage.clear();

# Visit editor directly
http://localhost:3000/editor/test123

✅ Should see: Modal appears immediately
✅ Enter username
✅ Should see: Editor loads after save
```

### Test 4: Edit Profile

```bash
# In editor with saved username

✅ Click pencil icon (✏️) in header
✅ Should see: Modal opens with pre-filled data
✅ Change name/gender
✅ Click "Continue"
✅ Should see: Avatar updates immediately
```

---

## 🔍 Behavior Comparison

### Modal Trigger Conditions

| Scenario | Old Behavior | New Behavior |
|----------|--------------|--------------|
| Visit home (no username) | ❌ Modal shows | ✅ No modal |
| Click "Create Room" (no username) | ❌ Already showing | ✅ Modal shows |
| Click "Create Room" (has username) | ✅ Skip modal | ✅ Skip modal |
| Direct editor access (no username) | ✅ Modal shows | ✅ Modal shows |
| Click "Edit Profile" | ✅ Modal shows | ✅ Modal shows |

### Summary of Changes

**What stayed the same**:
- ✅ Returning users skip modal on button click
- ✅ Direct editor access shows modal
- ✅ Edit profile opens modal
- ✅ Data saved to localStorage
- ✅ Avatar caching works

**What changed**:
- 🔄 Modal doesn't appear on page load
- 🔄 Modal triggered by button click
- 🔄 Cleaner landing page experience
- 🔄 More intuitive user flow

---

## 💡 Benefits

### 1. Better UX
- Clean landing page (no modal blocking content)
- User-initiated action (modal on button click)
- Less intrusive

### 2. Clearer Intent
- User clicks button → knows what to expect
- Modal appears in context of action
- Logical flow

### 3. Faster for Returning Users
- No modal check on page load
- Instant navigation with saved data
- Seamless experience

### 4. Better Performance
- No modal render on page load
- Only renders when needed
- Reduced initial bundle evaluation

---

## 🚨 Edge Cases Handled

### 1. User clicks button twice quickly
```typescript
if (userInfo) {
  // Create room immediately
} else {
  setShowModal(true); // Idempotent
}
```
Modal state is idempotent - setting `true` multiple times is safe.

### 2. User closes modal without saving
Modal remains open because `showModal` stays `true` until save.

### 3. localStorage is disabled
```typescript
try {
  localStorage.getItem(...);
} catch (error) {
  // userInfo stays null
  // Modal will show
}
```
Graceful fallback - modal will show.

### 4. Multiple tabs
Each tab has independent `showModal` state. localStorage is shared, so user data syncs.

---

## 📝 Migration Notes

### For Developers

If you were using the old flow:

**Before**:
```typescript
const { showPrompt } = useUsername();
<UsernamePrompt isOpen={showPrompt} />
```

**After**:
```typescript
const [showModal, setShowModal] = useState(false);
<UsernamePrompt isOpen={showModal} />
```

### Breaking Changes

⚠️ **Removed from useUsername hook**:
- `showPrompt` state
- `openPrompt()` method
- `closePrompt()` method

✅ **Still available**:
- `userInfo`
- `isLoading`
- `saveUserInfo()`
- `updateUserInfo()`
- `clearUserInfo()`
- `generateRandom()`

---

## ✅ Checklist

After this update:

- [x] Modal doesn't show on page load
- [x] Modal shows after "Create New Room" click
- [x] Returning users skip modal
- [x] Direct editor access shows modal
- [x] Edit profile button works
- [x] Data persists in localStorage
- [x] Avatar caching works
- [x] No console errors
- [x] TypeScript compiles
- [x] All hooks follow rules

---

## 🎉 Summary

The username modal now follows a **user-initiated flow**:

1. **Landing page is clean** - No modal blocking view
2. **Modal triggered by action** - Appears after button click
3. **Skip for returning users** - Instant navigation with saved data
4. **Edit anytime** - Change profile from editor

**Result**: Better UX, clearer flow, and happier users! 🚀

---

**Last Updated**: 2024
**Status**: ✅ Implemented and tested