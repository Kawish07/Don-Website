# Pre-Deployment Checklist ✅

## 1️⃣ LOCAL TESTING (Before Pushing to Git)

- [ ] **Test Client Locally**
  ```bash
  cd client
  npm install
  npm run dev
  ```
  - Open http://localhost:3000
  - Check all listings load
  - **Verify ALL images display** on AllListings page
  - Click on listings and verify images in ListingDetail page

- [ ] **Test Server Locally**
  ```bash
  cd server
  npm install
  npm run dev
  ```
  - Should start on http://localhost:5000
  - Check console for "Connected to MongoDB"
  - Test endpoint: http://localhost:5000/api/listings
  - Should return JSON with images as `/uploads/filename.jpg`

- [ ] **Test Image Loading**
  - Open DevTools (F12) → Network tab
  - Go to listing page
  - Look for image requests in Network tab
  - Should see: `http://localhost:5000/uploads/xxxxx.jpg` with status **200**
  - If 404 → images not uploading correctly

---

## 2️⃣ BACKUP & VERSION CONTROL

- [ ] **Backup Uploads Folder**
  ```bash
  # Copy the entire uploads folder with all images
  cp -r server/uploads server/uploads.backup
  ```

- [ ] **Commit All Code to Git**
  ```bash
  git add .
  git commit -m "Pre-deployment: Add image support and fix configuration"
  git push origin main
  ```
  - **Make sure ALL files committed including:**
    - client/.env.local
    - client/.env.production
    - server/.env
    - server/.env.production

---

## 3️⃣ VERIFY ENVIRONMENT VARIABLES

### ✅ Local Development (.env files)
- [ ] **client/.env.local:**
  ```
  VITE_API_URL=http://localhost:5000
  ```

- [ ] **server/.env:**
  ```
  NODE_ENV=development
  PORT=5000
  SITE_BASE=http://localhost:5000
  CORS_ORIGIN=http://localhost:3000
  MONGO_URI=<your-mongodb-uri>
  JWT_SECRET=<your-secret>
  ```

### ✅ Production (.env.production files)
- [ ] **client/.env.production:**
  ```
  VITE_API_URL=https://yourdomain.com
  ```
  *(Replace yourdomain.com with your actual Hostinger domain)*

- [ ] **server/.env.production:**
  ```
  NODE_ENV=production
  PORT=5000
  SITE_BASE=https://yourdomain.com
  CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
  MONGO_URI=<your-mongodb-uri>
  JWT_SECRET=<your-secret>
  ```

---

## 4️⃣ VERIFY FILE STRUCTURE

- [ ] **Client folder has:**
  - ✅ `package.json`
  - ✅ `vite.config.js`
  - ✅ `index.html`
  - ✅ `src/` folder with all components
  - ✅ `.env.production` file

- [ ] **Server folder has:**
  - ✅ `package.json`
  - ✅ `index.js`
  - ✅ `controllers/`, `models/`, `routes/`, `middlewares/`
  - ✅ `uploads/` folder with all images
  - ✅ `.env.production` file

---

## 5️⃣ PRODUCTION BUILD TEST

- [ ] **Build Client for Production**
  ```bash
  cd client
  npm run build
  ```
  - Should create `client/dist/` folder
  - No errors in output

- [ ] **Test Server Production Mode Locally** (optional but recommended)
  ```bash
  cd server
  NODE_ENV=production npm run dev
  ```

---

## 6️⃣ DEPLOYMENT STEPS (For Hostinger)

### On Hostinger Control Panel:

1. [ ] **Create/Setup Node.js Application**
   - Go to Hostinger → Node.js / Applications
   - Create new Node.js app
   - Set Node version to 16+ (or latest)
   - Set startup file: `server/index.js`

2. [ ] **Upload Your Code**
   - Via Git (recommended):
     ```bash
     git clone your-repo-url
     cd your-repo
     ```
   - OR upload manually via FTP/File Manager

3. [ ] **Set Environment Variables**
   - In Hostinger Node.js app settings → Environment Variables
   - Add all variables from `server/.env.production`:
     ```
     NODE_ENV=production
     PORT=5000
     MONGO_URI=<your-mongodb-uri>
     JWT_SECRET=<your-jwt-secret>
     SITE_BASE=https://yourdomain.com
     CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
     SENDGRID_API_KEY=<your-sendgrid-key>
     SENDGRID_FROM_EMAIL=<your-email>
     SENDGRID_TO_EMAIL=<your-email>
     ```

4. [ ] **Install Dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

5. [ ] **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

6. [ ] **Start Server**
   - Hostinger usually auto-starts Node app
   - Or manually start via Node.js app dashboard

7. [ ] **Verify Images Folder**
   - Make sure `server/uploads/` folder exists
   - Has **write permissions** (755 or 775)
   - Contains all your images

---

## 7️⃣ POST-DEPLOYMENT VERIFICATION

- [ ] **Test Frontend on Hostinger**
  - Visit `https://yourdomain.com`
  - Listings page loads
  - **All images display properly**
  - No CORS errors in DevTools Console

- [ ] **Test Backend API**
  - Visit `https://yourdomain.com/api/listings`
  - Should return JSON data with images

- [ ] **Check Images**
  - Right-click image → Open in new tab
  - Should load: `https://yourdomain.com/uploads/xxxxx.jpg`
  - Status should be **200** (not 404)

- [ ] **Check Admin Dashboard**
  - Visit `https://yourdomain.com/admin`
  - Try login with: kawishiqbal898@gmail.com / 11223344
  - Upload a new listing with image
  - Verify image appears on frontend

---

## 8️⃣ TROUBLESHOOTING

**Images not showing after deployment?**
- [ ] Check if `server/uploads/` folder exists on Hostinger
- [ ] Verify `SITE_BASE` is correct in `.env.production`
- [ ] Check DevTools Network tab for 404 errors on images
- [ ] Make sure uploads folder has read permissions (755)

**CORS errors?**
- [ ] Verify `CORS_ORIGIN` includes your domain in `.env.production`
- [ ] Use `https://` not `http://` for production

**Database connection issues?**
- [ ] Double-check `MONGO_URI` in production `.env`
- [ ] Verify MongoDB allows connections from Hostinger IP

---

## ✨ Summary

**What to Deploy:**
1. ✅ `client/` folder (entire)
2. ✅ `server/` folder (entire, including `uploads/`)
3. ✅ `.env.production` files in both folders

**Make sure before deploying:**
1. ✅ All images work on localhost
2. ✅ `.env.production` files are updated with your domain
3. ✅ Code is committed to Git
4. ✅ `server/uploads/` folder is backed up and ready to deploy

**Deploy order:**
1. Upload code to Hostinger
2. Set environment variables
3. Install dependencies
4. Build client (`npm run build`)
5. Start server
6. Test on your domain

---

Done! 🚀 When you're ready, all images will show on your Hostinger domain.
