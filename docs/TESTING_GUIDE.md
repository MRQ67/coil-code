# 🧪 Collaborative Code Editor - Testing Guide

## 🎯 Quick Test (2 minutes)

### Prerequisites Check
- [ ] PartyKit server running on port 1999
- [ ] Next.js frontend running on port 3000
- [ ] `.env.local` file configured correctly

### Basic Functionality Test
1. [ ] Open `http://localhost:3000`
2. [ ] Click "Create New Room"
3. [ ] Monaco Editor loads successfully
4. [ ] Open same URL in new tab
5. [ ] Type in one tab, see changes in other tab
6. [ ] **Result**: Real-time sync working ✨

---

## 🔍 Detailed Testing Checklist

## 1️⃣ Server Tests

### PartyKit Server (Port 1999)

```bash
cd partykit
bun run dev
```

**Expected Output**:
```
🎈 PartyKit v0.0.115
---------------------
Build succeeded, starting server...
[pk:inf] Ready on http://0.0.0.0:1999
```

**Checklist**:
- [ ] Server starts without errors
- [ ] No TypeScript compilation errors
- [ ] Port 1999 is listening
- [ ] No "module not found" errors
- [ ] WebSocket server is ready

**Test HTTP Endpoint**:
```bash
curl http://localhost:1999
```
- [ ] Returns response (not 404)

---

## 2️⃣ Frontend Tests

### Next.js Frontend (Port 3000)

```bash
cd frontend
bun run dev
```

**Expected Output**:
```
▲ Next.js 16.0.0 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in ~3s
```

**Checklist**:
- [ ] Server starts without errors
- [ ] No Turbopack configuration errors
- [ ] No TypeScript errors
- [ ] Environment variables loaded
- [ ] Tailwind CSS compiled

---

## 3️⃣ Home Page Tests

**URL**: `http://localhost:3000`

### Visual Elements
- [ ] Page loads without errors
- [ ] Gradient background renders
- [ ] "Collaborative Code Editor" heading visible
- [ ] Code icon/logo displays
- [ ] "Create New Room" button visible
- [ ] Feature cards displayed (3 cards)
- [ ] Footer text visible

### Styling Check
- [ ] Gradient background (gray-900 to gray-800)
- [ ] Button has gradient (blue-500 to purple-600)
- [ ] Button has hover effect (scales on hover)
- [ ] Responsive layout works
- [ ] Icons render correctly
- [ ] No layout shifts

### Functionality
- [ ] Click "Create New Room" button
- [ ] Generates 10-character room ID
- [ ] Redirects to `/editor/[roomId]`
- [ ] URL format: `http://localhost:3000/editor/abc1234567`
- [ ] Room ID is unique each time

### Console Check
Open DevTools → Console:
- [ ] No JavaScript errors
- [ ] No warning messages
- [ ] No failed network requests

---

## 4️⃣ Editor Page Tests

**URL**: `http://localhost:3000/editor/test123`

### Loading State
- [ ] "Connecting to room..." spinner appears
- [ ] Spinner animates
- [ ] Room ID displays
- [ ] Loading text is readable

### Editor Loads
- [ ] Loading state disappears (< 3 seconds)
- [ ] Monaco Editor renders
- [ ] Editor has dark theme
- [ ] Editor is focused and ready to type
- [ ] No blank screen
- [ ] No infinite loading

### Header Elements
- [ ] "Collaborative Code Editor" title
- [ ] Green "Connected" badge
- [ ] Room ID displayed in header
- [ ] "Leave Room" button visible
- [ ] Header styling correct

### Editor Features
- [ ] Syntax highlighting works
- [ ] Line numbers visible
- [ ] Can type and edit
- [ ] Code formatting works
- [ ] Tab indentation works
- [ ] Undo/Redo works (Ctrl+Z / Ctrl+Y)
- [ ] Find/Replace works (Ctrl+F)
- [ ] Font size is 14px
- [ ] Minimap is disabled
- [ ] Word wrap is enabled

### Console Check
Open DevTools → Console:
- [ ] No errors
- [ ] No failed WebSocket connections
- [ ] Yjs sync messages appear (if verbose logging enabled)

### Network Check
Open DevTools → Network → WS:
- [ ] WebSocket connection established
- [ ] URL: `ws://localhost:1999/parties/editor/test123`
- [ ] Status: 101 Switching Protocols
- [ ] Connection stays open (not closing)
- [ ] Messages tab shows Yjs protocol messages

---

## 5️⃣ Collaboration Tests

### Two-Tab Test (Same Browser)

**Setup**:
1. Tab 1: Create new room
2. Copy the URL
3. Tab 2: Open same URL

**Tests**:
- [ ] Both tabs load editor
- [ ] Both show "Connected" badge
- [ ] Tab 1: Type "hello"
- [ ] Tab 2: See "hello" appear instantly (< 100ms)
- [ ] Tab 2: Type " world"
- [ ] Tab 1: See " world" appear instantly
- [ ] Cursor position updates
- [ ] No lag or delay
- [ ] No duplicate text
- [ ] No text loss

### Multi-Line Editing
- [ ] Tab 1: Type on line 1
- [ ] Tab 2: Type on line 5
- [ ] Both lines appear correctly
- [ ] No overwrites
- [ ] Line numbers correct

### Simultaneous Editing
- [ ] Tab 1 & 2: Type at same time
- [ ] Both edits appear
- [ ] CRDT resolves conflicts
- [ ] Document state is consistent
- [ ] No race conditions

### Different Browser Test
- [ ] Chrome: Open room
- [ ] Firefox: Open same room
- [ ] Test sync between browsers
- [ ] Both can edit
- [ ] Changes sync bidirectionally

### Private/Incognito Mode Test
- [ ] Normal window: Create room
- [ ] Incognito window: Open same room
- [ ] Test sync
- [ ] Both can edit independently

---

## 6️⃣ Edge Cases

### Invalid Room ID
**Test**: Navigate to `http://localhost:3000/editor/`
- [ ] Shows error message
- [ ] "Invalid room ID" displayed
- [ ] "Back to Home" button works
- [ ] No crash or infinite loading

### Very Long Room ID
**Test**: `http://localhost:3000/editor/verylongroomidthatismorethanusual`
- [ ] Room still works
- [ ] ID displays in header (may truncate)
- [ ] No overflow issues

### Special Characters in Room ID
**Test**: Try various room IDs:
- `test-room-123` - [ ] Works
- `test_room_123` - [ ] Works
- `test.room.123` - [ ] Works

### Network Disconnection
**Test**:
1. Open editor room
2. Stop PartyKit server
3. [ ] Editor continues to work locally
4. [ ] Restart PartyKit server
5. [ ] Connection auto-recovers
6. [ ] Document re-syncs

### Page Refresh
- [ ] Refresh editor page
- [ ] Content persists (if persistence enabled)
- [ ] Reconnects to room
- [ ] Other tabs still sync

### Multiple Rooms Isolation
- [ ] Room A: `/editor/roomA`
- [ ] Room B: `/editor/roomB`
- [ ] Edit in Room A
- [ ] Room B is not affected
- [ ] Rooms are completely isolated

---

## 7️⃣ Performance Tests

### Load Time
- [ ] Home page loads < 2 seconds
- [ ] Editor page loads < 3 seconds
- [ ] Monaco Editor initializes < 2 seconds
- [ ] WebSocket connects < 1 second

### Sync Latency
- [ ] Local network: < 100ms
- [ ] Changes appear near-instant
- [ ] No noticeable lag

### Memory Usage
Open DevTools → Memory:
- [ ] Initial load: < 100MB
- [ ] After 5 minutes editing: < 150MB
- [ ] No memory leaks
- [ ] Memory stable over time

### Large Document
**Test**: Paste 1000+ lines of code
- [ ] Editor handles it smoothly
- [ ] Scrolling is smooth
- [ ] Sync still works
- [ ] No performance degradation

### Rapid Typing
- [ ] Type very fast
- [ ] All characters captured
- [ ] Syncs correctly
- [ ] No dropped characters

---

## 8️⃣ Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest) - Full support
- [ ] Firefox (latest) - Full support
- [ ] Edge (latest) - Full support
- [ ] Safari (latest) - Full support
- [ ] Opera (latest) - Full support

### Mobile Browsers (Bonus)
- [ ] iOS Safari - Works
- [ ] Chrome Mobile - Works
- [ ] Firefox Mobile - Works

### Screen Sizes
- [ ] Desktop (1920x1080) - Perfect
- [ ] Laptop (1366x768) - Good
- [ ] Tablet (768x1024) - Acceptable
- [ ] Mobile (375x667) - May need improvements

---

## 9️⃣ Security Tests

### Room Privacy
- [ ] Room IDs are unpredictable
- [ ] Can't easily guess other room IDs
- [ ] 10-character nanoid is secure enough

### XSS Prevention
**Test**: Try typing malicious code:
```javascript
<script>alert('XSS')</script>
```
- [ ] Rendered as text (not executed)
- [ ] Monaco handles HTML safely

### WebSocket Security
- [ ] Using ws:// for localhost (OK for dev)
- [ ] Should use wss:// in production

---

## 🔟 Error Handling Tests

### PartyKit Server Down
**Test**:
1. Stop PartyKit server
2. Try creating new room
- [ ] Shows connection error or loading forever
- [ ] No crash
- [ ] Can return to home page

### Environment Variable Missing
**Test**: Remove `NEXT_PUBLIC_PARTYKIT_HOST` from `.env.local`
- [ ] Shows error in console
- [ ] Graceful failure
- [ ] Clear error message

### Monaco Fails to Load
**Test**: Block Monaco CDN (if used)
- [ ] Shows loading state or error
- [ ] Doesn't crash app
- [ ] Error message helpful

---

## 1️⃣1️⃣ User Experience Tests

### First-Time User Flow
- [ ] Home page is intuitive
- [ ] Button is obvious
- [ ] Room creation is instant
- [ ] Editor is familiar (looks like VS Code)
- [ ] No confusing elements

### Keyboard Shortcuts
- [ ] Ctrl+Z (Undo) works
- [ ] Ctrl+Y (Redo) works
- [ ] Ctrl+F (Find) works
- [ ] Ctrl+H (Replace) works
- [ ] Ctrl+/ (Comment) works
- [ ] Tab (Indent) works
- [ ] Shift+Tab (Outdent) works

### Copy/Paste
- [ ] Ctrl+C copies
- [ ] Ctrl+V pastes
- [ ] Ctrl+X cuts
- [ ] Paste from external source works
- [ ] Format is preserved

### Leave Room
- [ ] Click "Leave Room" button
- [ ] Returns to home page
- [ ] WebSocket disconnects
- [ ] No memory leaks

---

## 1️⃣2️⃣ Final Integration Test

### Complete Workflow Test

**Scenario**: Two users collaborate on code

**User 1 Actions**:
1. [ ] Open home page
2. [ ] Click "Create New Room"
3. [ ] Share URL with User 2
4. [ ] Type: `function hello() {`
5. [ ] User 2 completes the function
6. [ ] Continue collaborating
7. [ ] Leave room

**User 2 Actions**:
1. [ ] Receive URL from User 1
2. [ ] Open URL in browser
3. [ ] See User 1's code
4. [ ] Type: `  return "Hello World!";`
5. [ ] Type: `}`
6. [ ] Both see complete function
7. [ ] Leave room

**Expected Result**:
```javascript
function hello() {
  return "Hello World!";
}
```

**Verification**:
- [ ] Both users see same code
- [ ] No conflicts occurred
- [ ] Code is properly formatted
- [ ] Syntax highlighting works
- [ ] Both can leave cleanly

---

## 📊 Test Results Summary

### Critical (Must Pass)
- [ ] Server starts successfully
- [ ] Frontend loads without errors
- [ ] Editor renders correctly
- [ ] Real-time sync works
- [ ] WebSocket connects properly

### Important (Should Pass)
- [ ] Multiple tabs/browsers sync
- [ ] No memory leaks
- [ ] Good performance (< 100ms latency)
- [ ] Error states handled gracefully
- [ ] UI is responsive

### Nice to Have (Bonus)
- [ ] Works on mobile
- [ ] Fast load times (< 2s)
- [ ] Smooth scrolling
- [ ] All keyboard shortcuts work

---

## ✅ Sign-Off Checklist

Before considering the app "production-ready":

### Functionality
- [ ] All critical tests pass
- [ ] Real-time collaboration works flawlessly
- [ ] No data loss during sync
- [ ] Room isolation verified

### Performance
- [ ] Load time acceptable
- [ ] Sync latency < 100ms
- [ ] No memory leaks
- [ ] Handles large documents

### Reliability
- [ ] No crashes
- [ ] Error handling works
- [ ] Reconnection works
- [ ] Stable over 30+ minutes

### User Experience
- [ ] Intuitive interface
- [ ] Fast and responsive
- [ ] Clear feedback (loading, connected, etc.)
- [ ] No confusion

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Clean code structure
- [ ] Proper cleanup on unmount

---

## 🐛 Bug Report Template

If you find issues during testing:

```
**Bug Title**: [Short description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Environment**:
- OS: Windows 11 / macOS / Linux
- Browser: Chrome 120 / Firefox 121 / etc.
- Node/Bun version: 
- Server running: Yes / No

**Screenshots/Videos**:
[Attach if applicable]

**Console Errors**:
```
[Paste console errors]
```

**Network Errors**:
[Check DevTools → Network → WS]
```
```

---

## 🎉 Test Passed!

If all tests pass:

✅ **Your collaborative code editor is production-ready!**

Next steps:
1. Deploy to production (Vercel + PartyKit)
2. Add more features (cursors, chat, persistence)
3. Share with users and get feedback
4. Monitor performance in production

**Congratulations!** 🎊 You built a real-time collaborative code editor! 🚀

---

**Happy Testing!** 🧪✨