# 🔄 Clear Cached Authentication

If you're seeing old user data (like "sdf"), you need to clear the browser cache:

## Method 1: Use the Clear Page (Easiest)
1. Navigate to: `http://localhost:5173/clear-auth.html`
2. Click "Clear Auth Data"
3. Done! ✅

## Method 2: Browser Console
1. Press `F12` to open browser console
2. Go to "Console" tab
3. Paste this code:
```javascript
localStorage.removeItem('lifeos-auth')
localStorage.removeItem('lifeos-user')
location.reload()
```
4. Press Enter
5. Done! ✅

## Method 3: Application Storage
1. Press `F12` to open DevTools
2. Go to "Application" tab
3. Click "Local Storage" → `http://localhost:5173`
4. Right-click → "Clear"
5. Refresh page
6. Done! ✅

---

## ✨ Now Test:

### Regular Sign In:
1. Go to Login page
2. Enter: `john.doe@example.com`
3. Password: `anything`
4. You'll see: "John doe" as the name

### Google Sign In:
1. Click "Google" button
2. Enter your email when prompted
3. Name auto-extracted from email
4. Signed in! 🎉

### GitHub Sign In:
1. Click "GitHub" button
2. Enter your email when prompted
3. Name auto-extracted from email
4. Signed in! 🎉

---

**Note:** The old "sdf" data was cached. After clearing, all new logins will work perfectly!
