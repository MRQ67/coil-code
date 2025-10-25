# 🔧 Git Setup Guide

## 📋 Overview

This guide explains what files should and shouldn't be committed to Git in your collaborative code editor project.

---

## ✅ What to Commit

### **Source Code**
- ✅ All `.ts`, `.tsx`, `.js`, `.jsx` files
- ✅ Configuration files (`package.json`, `tsconfig.json`, etc.)
- ✅ Component files in `frontend/components/`
- ✅ Hook files in `frontend/hooks/`
- ✅ Utility files in `frontend/lib/`
- ✅ PartyKit server code (`partykit/server.ts`, `partykit/index.ts`)

### **Configuration**
- ✅ `package.json` and `package-lock.json` (or `bun.lock`)
- ✅ `tsconfig.json`
- ✅ `next.config.ts`
- ✅ `tailwind.config.js` / `postcss.config.mjs`
- ✅ `partykit.json`
- ✅ `.gitignore` files

### **Documentation**
- ✅ `README.md` files
- ✅ Documentation files (`.md` files)
- ✅ Guides and setup instructions

### **Static Assets**
- ✅ Images, fonts, icons in `public/`
- ✅ `favicon.ico`

---

## ❌ What NOT to Commit

### **Dependencies**
- ❌ `node_modules/` - Always excluded (installed via `npm install`)
- ❌ Build artifacts from dependencies

### **Build Output**
- ❌ `.next/` - Next.js build output
- ❌ `out/` - Next.js static export
- ❌ `dist/` - Distribution builds
- ❌ `build/` - General build output

### **PartyKit State** ⚠️ **IMPORTANT**
- ❌ `.partykit/` - Local development state
  - Contains cache and party state
  - Should NOT be committed
  - Each developer has their own local state
  - Production uses PartyKit's hosted state

**Why ignore `.partykit/`?**
- Development state is local and temporary
- Contains WebSocket connection data
- Different for each developer
- Production uses PartyKit cloud, not local files
- Can get large over time
- May contain sensitive connection info

### **Environment Files**
- ❌ `.env.local` - Local environment variables
- ❌ `.env*.local` - Any local env files
- ⚠️ `.env.example` - OK to commit (template only)

### **Cache & Temp Files**
- ❌ `.cache/` - Various caches
- ❌ `*.tsbuildinfo` - TypeScript build info
- ❌ `.eslintcache` - ESLint cache
- ❌ `*.log` - Log files

### **IDE & OS Files**
- ❌ `.vscode/` - VS Code settings (personal preference)
- ❌ `.idea/` - IntelliJ/WebStorm settings
- ❌ `.DS_Store` - macOS folder metadata
- ❌ `Thumbs.db` - Windows thumbnail cache

### **Vercel Deployment**
- ❌ `.vercel/` - Vercel deployment config (regenerated)

---

## 📁 Directory-by-Directory Guide

### Root Directory (`coilcode/`)
```
coilcode/
├── .gitignore              ✅ Commit
├── README.md               ✅ Commit
├── *.md documentation      ✅ Commit
├── .partykit/              ❌ DON'T COMMIT (local state)
└── node_modules/           ❌ DON'T COMMIT (dependencies)
```

### Frontend Directory (`frontend/`)
```
frontend/
├── app/                    ✅ Commit all source files
├── components/             ✅ Commit all source files
├── hooks/                  ✅ Commit all source files
├── lib/                    ✅ Commit all source files
├── public/                 ✅ Commit static assets
├── .next/                  ❌ DON'T COMMIT (build output)
├── node_modules/           ❌ DON'T COMMIT (dependencies)
├── .vercel/                ❌ DON'T COMMIT (deployment)
├── package.json            ✅ Commit
├── tsconfig.json           ✅ Commit
├── next.config.ts          ✅ Commit
└── *.tsbuildinfo           ❌ DON'T COMMIT (cache)
```

### PartyKit Directory (`partykit/`)
```
partykit/
├── server.ts               ✅ Commit (your server code)
├── index.ts                ✅ Commit (your server code)
├── .partykit/              ❌ DON'T COMMIT (local state)
│   ├── state/              ❌ Local development state
│   │   ├── cache/          ❌ WebSocket cache
│   │   └── party/          ❌ Party data
├── node_modules/           ❌ DON'T COMMIT (dependencies)
├── package.json            ✅ Commit
├── partykit.json           ✅ Commit
└── tsconfig.json           ✅ Commit
```

---

## 🔍 Understanding `.partykit/` Directory

### What's Inside?
```
.partykit/
└── state/
    ├── cache/      - WebSocket connection cache
    └── party/      - Individual room/party states
        └── [roomId]/
            └── data files
```

### Why It's Generated
- Created automatically when you run `partykit dev`
- Stores local development state for testing
- Persists data between development sessions
- Simulates what would be in production

### Development vs Production

**Development (Local)**:
```
partykit dev
  ↓
Creates .partykit/ folder
  ↓
Stores state locally
  ↓
Good for testing offline
```

**Production (PartyKit Cloud)**:
```
partykit deploy
  ↓
Uses PartyKit's infrastructure
  ↓
State stored in their cloud
  ↓
No local .partykit/ folder needed
```

---

## 🛠️ Setup Instructions

### 1. Initial Setup

If you haven't committed anything yet:

```bash
cd D:\coilcode

# Initialize git (if not already done)
git init

# The .gitignore is already set up correctly
# Verify it contains .partykit/
cat .gitignore | grep partykit

# Stage all files (respecting .gitignore)
git add .

# Check what will be committed
git status

# Should NOT see:
# - node_modules/
# - .next/
# - .partykit/
# - *.log files
```

### 2. First Commit

```bash
# Commit your code
git commit -m "Initial commit: Collaborative code editor with username system"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/your-repo.git

# Push to GitHub
git push -u origin main
```

### 3. If You Already Committed `.partykit/`

If you accidentally committed it before:

```bash
# Remove from Git (but keep locally)
git rm -r --cached partykit/.partykit/

# The .gitignore will now prevent it from being added again
git commit -m "Remove .partykit/ directory from tracking"

# Push changes
git push
```

### 4. Clean Up After Pull

When other developers clone/pull:

```bash
# Clone the repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Install frontend dependencies
cd frontend
npm install

# Install PartyKit dependencies
cd ../partykit
npm install

# Run development (will create .partykit/ locally)
partykit dev
# This creates their own .partykit/ folder
# It won't conflict with Git
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Committing node_modules
```bash
# If you see node_modules in git status:
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
```

### ❌ Mistake 2: Committing .next build
```bash
# Remove it:
git rm -r --cached frontend/.next
git commit -m "Remove .next build from tracking"
```

### ❌ Mistake 3: Committing .partykit state
```bash
# Remove it:
git rm -r --cached partykit/.partykit
git commit -m "Remove .partykit state from tracking"
```

### ❌ Mistake 4: Large repository size
```bash
# Check what's taking space:
git ls-files | xargs ls -lh | sort -k5 -h -r | head -20

# If you committed large files, use git filter-branch or BFG Repo Cleaner
```

---

## 📊 Verify Your Setup

### Check What's Ignored

```bash
# See all ignored files
git status --ignored

# Test if a specific file is ignored
git check-ignore -v partykit/.partykit/

# Should output something like:
# .gitignore:44:.partykit/  partykit/.partykit/
```

### Check What Will Be Committed

```bash
# See what would be added
git add --dry-run .

# See current status
git status

# See size of repository
du -sh .git
```

---

## 🔐 Environment Variables

### Example `.env.local` (DON'T COMMIT)
```env
# Frontend environment variables
NEXT_PUBLIC_PARTYKIT_HOST=your-project.partykit.dev
DATABASE_URL=your-connection-string
API_SECRET_KEY=your-secret-key
```

### Example `.env.example` (OK TO COMMIT)
```env
# Frontend environment variables (template)
NEXT_PUBLIC_PARTYKIT_HOST=
DATABASE_URL=
API_SECRET_KEY=
```

---

## 📝 .gitignore Best Practices

### 1. Use Comments
```gitignore
# Dependencies
node_modules/

# PartyKit (local development state)
.partykit/
```

### 2. Be Specific
```gitignore
# Good (specific)
frontend/.next/
partykit/.partykit/

# Less ideal (too broad)
.next/
```

### 3. Include Common Patterns
```gitignore
# All log files
*.log

# All TypeScript build info
*.tsbuildinfo

# Any .env.local files
.env*.local
```

---

## 🎯 Quick Reference

### Files to ALWAYS commit:
✅ Source code (`.ts`, `.tsx`, `.js`, `.jsx`)
✅ `package.json` / `package-lock.json` / `bun.lock`
✅ Configuration files (`.json`, `.config.js`, `.config.ts`)
✅ Documentation (`.md` files)
✅ Static assets (`public/` folder)

### Files to NEVER commit:
❌ `node_modules/`
❌ `.next/` or `out/`
❌ `.partykit/` ⚠️ **IMPORTANT**
❌ `.env.local` or `.env*.local`
❌ `*.log` files
❌ IDE settings (`.vscode/`, `.idea/`)
❌ OS files (`.DS_Store`, `Thumbs.db`)

---

## 🚀 Deployment Notes

### PartyKit Deployment

When you deploy to PartyKit:
```bash
cd partykit
partykit deploy
```

- ✅ Deploys your server code (`server.ts`, `index.ts`)
- ✅ Uses PartyKit's cloud infrastructure
- ❌ Does NOT use your local `.partykit/` folder
- ❌ Does NOT need `.partykit/` committed

### Vercel Deployment

When you deploy frontend to Vercel:
```bash
cd frontend
vercel deploy --prod
```

- ✅ Builds from source code
- ✅ Installs dependencies from `package.json`
- ❌ Does NOT use local `node_modules/`
- ❌ Does NOT use local `.next/`

---

## ✅ Final Checklist

Before pushing to Git:

- [ ] `.gitignore` exists in root directory
- [ ] `.partykit/` is listed in `.gitignore`
- [ ] `node_modules/` is listed in `.gitignore`
- [ ] `.next/` is listed in `.gitignore`
- [ ] Run `git status` and verify no ignored files appear
- [ ] Check repository size is reasonable (<10MB for source only)
- [ ] Environment variables are in `.env.local` (not committed)
- [ ] No sensitive keys or tokens in committed files

---

## 🆘 Need Help?

### Check if file is ignored:
```bash
git check-ignore -v path/to/file
```

### Remove accidentally committed file:
```bash
git rm --cached path/to/file
git commit -m "Remove file from tracking"
```

### See what's taking space:
```bash
git ls-files | xargs ls -lh | sort -k5 -h -r | head
```

---

## 📚 Summary

**TL;DR**: Yes, you should gitignore `.partykit/`! ✅

It's a local development state directory that:
- Is automatically generated
- Contains temporary data
- Differs for each developer
- Should never be committed
- Is already in your `.gitignore`

Your `.gitignore` is now properly configured to handle:
- ✅ PartyKit state (`.partykit/`)
- ✅ Dependencies (`node_modules/`)
- ✅ Build output (`.next/`, `out/`)
- ✅ Environment files (`.env*.local`)
- ✅ Cache and logs
- ✅ IDE and OS files

**You're all set for Git! 🎉**

---

**Last Updated**: 2024
**Status**: ✅ Production Ready