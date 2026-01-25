# Setting Up Google OAuth for Sheets Integration

To enable the "Sync to Google Sheets" feature, you need to obtain a **Google Client ID**. Follow these steps:

## Step 1: Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown (top left) and select **"New Project"**.
3. Name it `ReportMaker` (or similar) and click **Create**.
4. Select the newly created project.

## Step 2: Enable Google Sheets API
1. In the left sidebar, go to **APIs & Services > Library**.
2. Search for **"Google Sheets API"**.
3. Click on the result and then click **Enable**.

## Step 3: Configure OAuth Consent Screen
1. In the left sidebar, go to **APIs & Services > OAuth consent screen**.
2. Select **External** (unless you are a Google Workspace user and want to limit to your org) and click **Create**.
3. **App Information**:
   - **App Name**: ReportMaker
   - **User Support Email**: Select your email.
4. **Developer Contact Information**: Enter your email.
5. Click **Save and Continue**.
6. **Scopes**: Click **Add or Remove Scopes**.
   - Search for `https://www.googleapis.com/auth/spreadsheets`.
   - Select it (it allows reading/writing sheets).
   - Click **Update**.
7. Click **Save and Continue**.

### CRITICAL: Testing vs. Production Mode
By default, your app is in **Testing** mode.

#### Option A: Keep in Testing Mode (Recommended for Internal Use)
- **Who can log in?** ONLY exact email addresses you add to the "Test Users" list.
- **Pros:** No verification required, immediate setup.
- **Cons:** You must manually add every teacher/admin email.
- **Action:** 
    1. In the "Test Users" step, click **Add Users**.
    2. Enter the Gmail addresses of everyone who needs access (e.g., `teacher1@gmail.com`).
    3. Click **Save**.

#### Option B: Publish to Production (For "Anyone" to log in)
- **Who can log in?** Anyone with a Google Account.
- **Pros:** No manual user management.
- **Cons:** Because we request `spreadsheets` access (a "Sensitive Scope"), Google will show a "Google hasn't verified this app" warning screen to users unless you undergo a verification process (which takes days/weeks).
- **Action:**
    1. Go to **OAuth consent screen** dashboard.
    2. Click **Publish App**.
    3. Confirm. 
    4. *Note:* Users will see a warning screen. They can bypass it by clicking **Advanced > Go to ReportMaker (unsafe)**, but for a professional public app, you must submit for verification.

## Step 4: Create Credentials (Client ID)
1. In the left sidebar, go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials** (top bar) and select **OAuth client ID**.
3. **Application Type**: Select **Web application**.
4. **Name**: `ReportMaker Web Client`.
5. **Authorized JavaScript Origins**:
   - Click **+ Add URI**.
   - Enter your local development URL: `http://localhost:5173` (or whatever port Vite is running on).
   - *Note: If you deploy to production (e.g., Vercel), add that domain here too.*
6. **Authorized Redirect URIs**:
   - You can leave this empty for the pop-up flow, or add `http://localhost:5173`.
7. Click **Create**.

## Step 5: Copy the Client ID
1. A modal will appear with your **Client ID** (it looks like `123456-abcde.apps.googleusercontent.com`).
2. Copy this string.
3. Create a file named `.env` in the root of your project (`d:\MgGlobal\ReportMaker\.env`).
4. Paste the ID like this:

```env
VITE_GOOGLE_CLIENT_ID=your-copied-client-id-here.apps.googleusercontent.com
```

> **Note**: Do not commit the `.env` file to public repositories if it contains sensitive keys, although the Client ID is generally considered public information in web apps.
