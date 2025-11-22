# 🚀 Quick Start: Multi-Device Collaboration

## 🎯 Goal
Get your collaborative code editor working on **multiple devices** (phone, tablet, another computer).

---

## ⚡ Super Quick Start (3 Steps)

### Step 1: Find Your IP Address

**Windows**:
```bash
ipconfig
```
Look for "IPv4 Address": `192.168.x.x`

**Mac/Linux**:
```bash
ifconfig | grep "inet "
```

Example: `192.168.1.5` ← This is YOUR_IP

---

### Step 2: Start Both Servers

**Terminal 1** - Start PartyKit:
```bash
cd D:\coilcode\partykit
npm run dev
```
Wait for: `⚡ PartyKit server running at http://127.0.0.1:1999`

**Terminal 2** - Start Next.js (Network Mode):
```bash
cd D:\coilcode\frontend
npm run dev:network
```
Wait for:
```
✓ Ready in 2.3s
- Local:    http://localhost:3000
- Network:  http://192.168.1.5:3000  ← Use this!
```

---

### Step 3: Access from Devices

**Device 1 (Your Computer)**:
- Open browser
- Visit: `http://192.168.1.5:3000` (use YOUR_IP)
- Click "Create New Room"
- Copy the room URL

**Device 2 (Phone/Tablet)**:
- Open browser
- Paste the room URL (with YOUR_IP, not localhost)
- Example: `http://192.168.1.5:3000/editor/abc123`

**Both devices should now see the same editor and sync in real-time! 🎉**

---

## 🔥 Troubleshooting

### ❌ Can't Access from Device 2

**Solution**: Check firewall

```bash
# Windows (Run as Administrator)
netsh advfirewall firewall add rule name="Next.js Dev" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule="PartyKit Dev" dir=in action=allow protocol=TCP localport=1999
```

### ❌ WebSocket Connection Failed

**Check**:
1. Are BOTH servers running? (PartyKit + Next.js)
2. Are you using YOUR_IP, not "localhost"?
3. Are both devices on the same WiFi?

**Quick Fix**:
```bash
# On Device 2, can you reach the server?
# Open browser and visit: http://YOUR_IP:3000
# If this doesn't load, it's a network/firewall issue
```

### ❌ Works on Computer, Not on Phone

**Problem**: You're probably using `localhost` in the URL

**Solution**: Replace `localhost` with your IP address
- ❌ `http://localhost:3000/editor/abc123`
- ✅ `http://192.168.1.5:3000/editor/abc123`

---

## 📱 Testing Checklist

Before testing:
- [ ] PartyKit running (Terminal 1)
- [ ] Next.js running with `npm run dev:network` (Terminal 2)
- [ ] You know your IP address (e.g., 192.168.1.5)
- [ ] Firewall allows ports 3000 and 1999
- [ ] Both devices on same WiFi

Test it:
1. Device 1: Visit `http://YOUR_IP:3000`
2. Device 1: Create a room
3. Device 2: Visit the same room URL (with YOUR_IP)
4. Type on Device 1 → See it on Device 2 ✅
5. Type on Device 2 → See it on Device 1 ✅

---

## 🎨 Visual Guide

### Network Setup
```
Computer (192.168.1.5)
├── PartyKit Server (port 1999)
└── Next.js Server (port 3000)

Phone/Tablet
└── Browser → http://192.168.1.5:3000
    └── WebSocket → ws://192.168.1.5:1999 ✅
```

### What URLs to Use

| Device | URL | Notes |
|--------|-----|-------|
| Your Computer | `http://localhost:3000` OR `http://192.168.1.5:3000` | Both work |
| Phone/Tablet | `http://192.168.1.5:3000` | Must use IP! |
| Another Computer | `http://192.168.1.5:3000` | Must use IP! |

---

## 🌐 For Production (Optional)

Want to test from anywhere (not just local network)?

### Deploy to PartyKit Cloud:
```bash
cd D:\coilcode\partykit
npx partykit deploy
```
You'll get: `your-project.partykit.dev`

### Set Environment Variable:
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_PARTYKIT_HOST=your-project.partykit.dev
```

### Deploy Frontend:
```bash
cd D:\coilcode\frontend
npm run build
vercel deploy --prod
```

Now anyone with the link can collaborate! 🌍

---

## 💡 Pro Tips

### Tip 1: Use QR Code
Generate QR code for the room URL so phones can scan it:
- Visit: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://192.168.1.5:3000/editor/abc123`

### Tip 2: Bookmark Your IP
Save `http://YOUR_IP:3000` as a bookmark on your phone for quick access.

### Tip 3: Check Network Tab
If things aren't working:
1. Open DevTools (F12)
2. Go to Console
3. Look for: `🔌 Connecting to PartyKit at: 192.168.1.5:1999`
4. Should NOT see WebSocket errors

---

## ❓ Common Questions

**Q: Why can't I use localhost on my phone?**
A: `localhost` refers to the device itself. Your phone's localhost is different from your computer's localhost.

**Q: Do I need to restart the servers when switching devices?**
A: No! Once both servers are running, any device can connect.

**Q: Can I use this over the internet?**
A: Not with local IP addresses (192.168.x.x). You need to deploy to production for internet access.

**Q: What if my IP address changes?**
A: Your router might assign a new IP after reboot. Just check `ipconfig` again and use the new IP.

**Q: Can more than 2 devices connect?**
A: Yes! As many devices as you want can join the same room.

---

## 🎯 Summary

**Commands**:
```bash
# Terminal 1
cd partykit && npm run dev

# Terminal 2  
cd frontend && npm run dev:network
```

**URLs**:
- Same machine: `http://localhost:3000`
- Other devices: `http://YOUR_IP:3000`

**Key Points**:
- ✅ Use `dev:network` script (not just `dev`)
- ✅ Use IP address (not localhost) on other devices
- ✅ Both devices must be on same WiFi
- ✅ Firewall must allow ports 3000 and 1999

---

**That's it! You're ready for multi-device collaboration! 🎊**

For more details, see: `WEBSOCKET_CROSS_DEVICE_FIX.md`
