# Testing Guide: Enhanced Username System

## 🧪 Quick Testing Steps

### Test 1: First-Time User Experience

**Steps:**
1. Open browser in **Incognito/Private mode**
2. Navigate to `http://localhost:3000`
3. Click "Create New Room" button
4. ✅ Username modal should appear

**Expected Result:**
- Modal shows with welcome message
- Input field is auto-focused
- Avatar preview shows placeholder
- Gender buttons: Boy, Girl, Random (Random selected by default)

---

### Test 2: Enter Username & Select Gender

**Steps:**
1. Type "Alice" in the name field
2. ✅ Avatar should update as you type
3. Click "Girl" gender option
4. ✅ Avatar should change to girl style
5. Click "Continue"

**Expected Result:**
- Modal closes smoothly
- Navigates to `/editor/{roomId}`
- Editor shows "Alice" with girl avatar in header
- No errors in console

---

### Test 3: Verify localStorage Persistence

**Steps:**
1. After Test 2, open DevTools → Application → Local Storage
2. Check for keys:
   - `collaborative-editor-username` = "Alice"
   - `collaborative-editor-gender` = "girl"
3. Navigate back to home page (`/`)
4. Click "Create New Room" again

**Expected Result:**
- ✅ Modal does NOT appear
- Immediately creates room and navigates
- Same user info in editor header

---

### Test 4: Random Name Generator

**Steps:**
1. Clear localStorage (DevTools → Application → Clear all)
2. Refresh page and click "Create New Room"
3. Click "✨ Random Name" button

**Expected Result:**
- Name field fills with random name (e.g., "Cosmic Panda")
- Gender randomly selected
- Avatar updates to match
- Can click Random Name multiple times for different names

---

### Test 5: Skip/Auto-Generate

**Steps:**
1. Clear localStorage
2. Refresh page and click "Create New Room"
3. Click "Skip for now (auto-generate)" at bottom

**Expected Result:**
- Immediately generates random name + gender
- Saves to localStorage
- Navigates to editor
- Shows generated credentials in header

---

### Test 6: Validation Errors

**Steps:**
1. Clear localStorage
2. Open username modal
3. Try entering:
   - Single character: "A"
   - 21+ characters: "ThisIsAReallyLongUsername"
   - Empty string: ""

**Expected Result:**
- Error message appears in red
- Cannot submit with invalid input
- Character counter shows (X/20)
- Error clears when typing valid input

---

### Test 7: Edit Profile from Editor

**Steps:**
1. Enter editor with saved username "Alice"
2. Look for pencil icon (✏️) button in header
3. Click the edit button

**Expected Result:**
- Modal opens with current name pre-filled: "Alice"
- Current gender pre-selected: "Girl"
- Can change to "Bob" and "Boy"
- Click Continue → Updates immediately

---

### Test 8: Direct URL Access

**Steps:**
1. Clear localStorage completely
2. Navigate directly to: `http://localhost:3000/editor/test123`

**Expected Result:**
- Username modal appears BEFORE editor loads
- Must enter username first
- After saving, editor initializes
- Room ID "test123" shown in header

---

### Test 9: Avatar Display Variations

**Steps:**
1. Test each gender option:
   - Enter "John" + Boy → Blue-tinged avatar + blue badge
   - Enter "Jane" + Girl → Pink-tinged avatar + pink badge
   - Enter "Alex" + Random → Purple-tinged avatar + no badge

**Expected Result:**
- Each gender uses correct API endpoint
- Avatars are visually distinct
- Small colored badge indicates gender (except random)

---

### Test 10: Mobile Responsiveness

**Steps:**
1. Open DevTools → Toggle device toolbar
2. Test on:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**Expected Result:**
- Modal scales appropriately
- Touch interactions work
- Buttons are tappable
- No horizontal scroll
- Text is readable

---

### Test 11: Image Loading States

**Steps:**
1. Open Network tab in DevTools
2. Throttle to "Slow 3G"
3. Open username modal and enter name

**Expected Result:**
- Shows animated loading skeleton while image loads
- Smooth transition when image appears
- If image fails: Shows fallback with initials

---

### Test 12: Multiple Tabs

**Steps:**
1. Set username "Alice" in Tab 1
2. Open new tab (Tab 2)
3. Navigate to home page

**Expected Result:**
- Tab 2 automatically loads "Alice" from localStorage
- Both tabs show same user info
- Consistent experience across tabs

---

### Test 13: Browser Back Button

**Steps:**
1. Clear localStorage
2. Click "Create New Room"
3. Enter username → Navigate to editor
4. Click browser back button

**Expected Result:**
- Returns to home page
- Username still saved
- Can create new room without prompt

---

### Test 14: Page Refresh in Editor

**Steps:**
1. Enter editor with saved username
2. Press F5 or Ctrl+R to refresh

**Expected Result:**
- Page reloads
- Username persists
- Avatar shows immediately
- No prompt appears

---

### Test 15: Clear Data Flow

**Steps:**
1. In editor with username "Alice"
2. Open browser console
3. Run: `localStorage.clear()`
4. Refresh page

**Expected Result:**
- Username prompt appears again
- Must re-enter credentials
- Fresh start for user

---

## 🎯 Visual Verification Checklist

### Modal Appearance
- [ ] Gradient background (gray-800 to gray-900)
- [ ] Centered on screen
- [ ] Backdrop blur effect visible
- [ ] Smooth fade-in animation
- [ ] Welcome icon (user profile SVG)

### Avatar Preview
- [ ] Updates instantly when typing
- [ ] Changes when gender selected
- [ ] Rounded circle shape
- [ ] Proper sizing (80px in modal)
- [ ] Loading skeleton shows

### Gender Buttons
- [ ] Three buttons in a row
- [ ] Emoji icons: 👦 👧 🎲
- [ ] Selected button has colored border
- [ ] Hover effect on unselected
- [ ] Boy = Blue, Girl = Pink, Random = Purple

### Form Elements
- [ ] Input field has focus ring
- [ ] Character counter shows (X/20)
- [ ] Error messages in red
- [ ] Clear placeholder text
- [ ] Proper padding and spacing

### Action Buttons
- [ ] "Continue" button has gradient (blue → purple)
- [ ] "Random Name" button has icon
- [ ] "Skip for now" link is subtle
- [ ] Hover effects work smoothly
- [ ] Buttons are well-spaced

### Editor Header
- [ ] Avatar shows (32px size)
- [ ] Username text beside avatar
- [ ] Edit profile button (pencil icon)
- [ ] All aligned horizontally
- [ ] Proper spacing between elements

---

## 🐛 Common Issues & Fixes

### Issue: Modal doesn't show
**Fix**: Check console for errors, verify `useUsername` hook is called

### Issue: Avatar not loading
**Fix**: Check network tab, verify API URL is correct, check CORS

### Issue: localStorage not saving
**Fix**: Ensure browser allows localStorage, not in incognito mode (for persistence)

### Issue: TypeScript errors
**Fix**: Verify all imports use correct paths with `@/` prefix

### Issue: Hydration mismatch
**Fix**: All components using localStorage have `'use client'` directive

---

## ✅ Success Criteria

All tests pass if:
- [x] Modal shows on first visit
- [x] Username saves to localStorage
- [x] Subsequent visits skip modal
- [x] Avatar displays correctly
- [x] Gender selection works
- [x] Validation prevents invalid input
- [x] Edit profile works from editor
- [x] Direct URL access handled
- [x] Mobile responsive
- [x] No console errors

---

## 📊 Performance Checks

Run these checks:
```bash
# Check bundle size
npm run build

# Expected additions:
# - name-generator.ts: ~2KB
# - useUsername.ts: ~3KB  
# - UserAvatar.tsx: ~3KB
# - UsernamePrompt.tsx: ~8KB
# Total: ~16KB uncompressed
```

---

## 🚀 Ready for Production?

Before deploying, verify:
- [ ] All 15 tests pass
- [ ] No console errors
- [ ] Mobile works perfectly
- [ ] Images load correctly
- [ ] localStorage persists
- [ ] Validation works
- [ ] TypeScript compiles
- [ ] Build succeeds

---

**Testing Complete! 🎉**

If all tests pass, the username system is production-ready!