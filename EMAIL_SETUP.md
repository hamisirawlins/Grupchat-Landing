# Email Setup for Data Management Requests

This document explains how to configure email functionality for data management requests (account deletion, data export, and data correction).

## Overview

The application sends email notifications to `info@grupchat.net` when users submit:
- Account deletion requests
- Data export requests  
- Data correction requests
- Bug reports

## Environment Variables

You need to set the following environment variables in your `.env.local` file:

```bash
# Email Configuration (same credentials as gc-gateway)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this 16-character password as `EMAIL_PASS`

## API Endpoints

### Account Deletion
- **Endpoint**: `POST /api/data/delete-account`
- **Body**: `{ email, reason, confirmation, additionalComments }`
- **Email sent to**: `info@grupchat.net`

### Data Export
- **Endpoint**: `POST /api/data/export` 
- **Body**: `{ email, format }`
- **Email sent to**: `info@grupchat.net`

### Data Correction
- **Endpoint**: `POST /api/data/correction`
- **Body**: `{ email, type, description }`
- **Email sent to**: `info@grupchat.net`

### Bug Reports
- **Endpoint**: `POST /api/bug-report`
- **Body**: `{ name, email, bugType, description, steps, device, priority }`
- **Email sent to**: `info@grupchat.net`

## Email Templates

Each request type sends a beautifully formatted HTML email with:
- Request details
- User information
- Action required checklist
- Professional GrupChat branding

## Testing

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables** in `.env.local`

3. **Test the endpoints** by submitting forms through the UI:
   - `/delete-account` - Account deletion form
   - `/manage-data` - Data export and correction forms
   - `/report-bug` - Bug report form

## Error Handling

- **Client-side**: User-friendly error messages with alerts
- **Server-side**: Detailed logging and structured error responses
- **Email failures**: Graceful degradation with error logging

## Security

- **No authentication required** for data requests (privacy compliance)
- **Email validation** on all endpoints
- **Input sanitization** for all form fields
- **Rate limiting** should be implemented for production

## Dependencies

- `nodemailer`: ^6.9.15 (for sending emails)
- Uses the same email service pattern as gc-gateway backend
