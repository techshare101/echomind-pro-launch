# 📧 Contact System Setup Guide

## Overview
The EchoMind Pro contact system allows users to send messages from the dashboard, which automatically:
1. Saves to Firestore (`contact_messages` collection)
2. Sends notification email to `contact@metalmindtech.com`
3. Sends auto-reply confirmation to the user

---

## 🚀 Quick Setup

### 1. Get Gmail App Password

If using Gmail for `contact@metalmindtech.com`:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords**
4. Create new app password:
   - App: Mail
   - Device: Other (Custom name) → "EchoMind Functions"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 2. Set Firebase Secrets

```powershell
# Set the email address
firebase functions:secrets:set CONTACT_EMAIL
# Enter: contact@metalmindtech.com

# Set the app password
firebase functions:secrets:set CONTACT_EMAIL_PASSWORD
# Paste the 16-character app password (no spaces)
```

### 3. Deploy Functions

```powershell
firebase deploy --only functions
```

---

## 🧪 Testing

### Test the Contact Form

1. Go to: `https://echomind-pro-launch.vercel.app/dashboard.html`
2. Click **💬 Contact Support** (bottom-right)
3. Fill in:
   - Name: Your name
   - Email: Your test email
   - Message: Test message
4. Click **Send Message**

### Verify Success

✅ **Frontend**: Success message appears, modal closes after 2 seconds

✅ **Firestore**: Check Firebase Console → Firestore Database → `contact_messages`
   - Should see new document with your message
   - Fields: `emailSent: true`, `autoReplySent: true`

✅ **Email to MetalMindTech**: Check `contact@metalmindtech.com` inbox
   - Subject: "📬 New EchoMind Contact: [Name]"
   - Beautiful HTML email with message details

✅ **Auto-Reply to User**: Check the email you used in the form
   - Subject: "✅ We received your message - EchoMind Pro"
   - Confirmation email with your message quoted

---

## 📊 Firestore Structure

Each contact message creates a document in `contact_messages`:

```javascript
{
  name: "John Doe",
  email: "john@example.com",
  message: "I need help with...",
  sent_to: "contact@metalmindtech.com",
  timestamp: Timestamp,
  status: "new",
  source: "dashboard",
  emailSent: true,
  emailSentAt: Timestamp,
  autoReplySent: true
}
```

---

## 🔧 Troubleshooting

### Emails Not Sending

1. **Check Firebase Logs**:
   ```powershell
   firebase functions:log --only sendContactEmail
   ```

2. **Verify Secrets**:
   ```powershell
   firebase functions:secrets:access CONTACT_EMAIL
   firebase functions:secrets:access CONTACT_EMAIL_PASSWORD
   ```

3. **Common Issues**:
   - ❌ Gmail blocking: Enable "Less secure app access" or use App Password
   - ❌ Wrong credentials: Re-set secrets with correct values
   - ❌ Firestore permissions: Check Firebase rules allow writes to `contact_messages`

### Modal Not Showing

1. **Clear browser cache**: `Ctrl + Shift + R`
2. **Check console**: Look for JavaScript errors
3. **Verify deployment**: Make sure latest `dashboard.html` is deployed to Vercel

---

## 🎨 Customization

### Change Email Template

Edit `functions/index.js` → `sendContactEmail` function:
- Line ~543: Notification email to MetalMindTech
- Line ~630: Auto-reply email to user

### Change Recipient Email

Update the `to:` field in `mailOptions` (line ~545):
```javascript
to: "your-new-email@example.com",
```

### Disable Auto-Reply

Comment out lines 714-720 in `functions/index.js`:
```javascript
// try {
//   await transporter.sendMail(autoReplyOptions);
//   console.log("✅ Auto-reply sent to user:", messageData.email);
// } catch (replyError) {
//   console.error("⚠️ Auto-reply failed (non-critical):", replyError.message);
// }
```

---

## 📈 Production Recommendations

### For High Volume (>100 messages/day)

Consider switching from Gmail to:
- **SendGrid** (99% deliverability, 100 free emails/day)
- **Mailgun** (Professional email API)
- **AWS SES** (Very cheap, $0.10 per 1000 emails)

### Email Analytics

Add tracking to see:
- Open rates
- Click rates
- Response times

### Spam Protection

Add rate limiting to prevent abuse:
```javascript
// Check if user sent message in last 5 minutes
const recentMessages = await db.collection('contact_messages')
  .where('email', '==', messageData.email)
  .where('timestamp', '>', fiveMinutesAgo)
  .get();

if (recentMessages.size > 0) {
  throw new Error('Please wait before sending another message');
}
```

---

## ✅ Deployment Checklist

- [ ] Nodemailer installed (`npm install` in functions/)
- [ ] Email secrets configured (`CONTACT_EMAIL`, `CONTACT_EMAIL_PASSWORD`)
- [ ] Functions deployed (`firebase deploy --only functions`)
- [ ] Frontend deployed (`vercel --prod`)
- [ ] Test message sent successfully
- [ ] Notification email received at `contact@metalmindtech.com`
- [ ] Auto-reply received by test user
- [ ] Firestore document created with correct fields

---

## 🔐 Security Notes

- ✅ Email credentials stored as Firebase Secrets (encrypted)
- ✅ Never exposed to client-side code
- ✅ Auto-reply prevents email address harvesting
- ✅ Firestore rules should restrict writes to authenticated users (optional)

---

**Need help?** Contact the development team or check Firebase Functions logs for detailed error messages.
