import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
    
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // Send email notification
    async sendEmail(to, subject, htmlContent, textContent = null) {
        try {
            const mailOptions = {
                from: `"GrupChat Web" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html: htmlContent,
                text: textContent || this.stripHtml(htmlContent)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('Email sending error:', error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    // Send account deletion request email
    async sendAccountDeletionRequest(email, reason, confirmation, additionalComments) {
        const subject = `Account Deletion Request - ${email}`;
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account Deletion Request - GrupChat</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
                        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 32px; font-weight: bold;">GC</span>
                        </div>
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: white;">🗑️ Account Deletion Request</h1>
                        <p style="margin: 12px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.9);">Deletion request received</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 40px 30px;">
                        <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #991b1b;">Account Deletion Request Details</h2>
                            
                            <div style="space-y: 12px;">
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Email:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${email}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Reason:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${reason}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Confirmation:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${confirmation}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Submission Time:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${new Date().toLocaleString()}</span>
                                </div>
                                
                                ${additionalComments ? `
                                <div style="margin-top: 16px;">
                                    <strong style="color: #991b1b;">Additional Comments:</strong>
                                    <div style="background: white; border-radius: 8px; padding: 16px; margin-top: 8px; color: #7f1d1d; line-height: 1.5;">
                                        ${additionalComments}
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Action Required -->
                        <div style="background: #f9fafb; border-radius: 12px; padding: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #374151;">Action Required:</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.6;">
                                <li>Verify the user's identity</li>
                                <li>Process the account deletion within 30 days</li>
                                <li>Send confirmation email to the user</li>
                                <li>Ensure data retention compliance (90 days for legal/fraud prevention)</li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            © 2025 GrupChat. Account deletion request notification.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail('grupchatinfo@gmail.com', subject, htmlContent);
    }

    // Send data export request email
    async sendDataExportRequest(email, format) {
        const subject = `Data Export Request - ${email}`;
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Data Export Request - GrupChat</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center;">
                        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 32px; font-weight: bold;">GC</span>
                        </div>
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: white;">📊 Data Export Request</h1>
                        <p style="margin: 12px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.9);">Export request received</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 40px 30px;">
                        <div style="background: #d1fae5; border: 2px solid #059669; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #065f46;">Data Export Request Details</h2>
                            
                            <div style="space-y: 12px;">
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #065f46;">Email:</strong>
                                    <span style="color: #047857; margin-left: 8px;">${email}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #065f46;">Format:</strong>
                                    <span style="color: #047857; margin-left: 8px;">${format.toUpperCase()}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #065f46;">Submission Time:</strong>
                                    <span style="color: #047857; margin-left: 8px;">${new Date().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Data Included -->
                        <div style="background: #f0f9ff; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #1e40af;">Data to Include:</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.6;">
                                <li>Profile information (name, email, phone number)</li>
                                <li>Pool participation history</li>
                                <li>Transaction records</li>
                                <li>Account settings and preferences</li>
                                <li>Usage analytics (anonymized)</li>
                            </ul>
                        </div>
                        
                        <!-- Action Required -->
                        <div style="background: #f9fafb; border-radius: 12px; padding: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #374151;">Action Required:</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.6;">
                                <li>Verify the user's identity</li>
                                <li>Compile user data in ${format.toUpperCase()} format</li>
                                <li>Process within 7-14 business days</li>
                                <li>Send secure download link to user's email</li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            © 2025 GrupChat. Data export request notification.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail('grupchatinfo@gmail.com', subject, htmlContent);
    }

    // Send bug report email
    async sendBugReport(name, email, bugType, description, steps, device, priority) {
        const subject = `Bug Report - ${bugType} (${priority.toUpperCase()}) - ${email}`;
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bug Report - GrupChat</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
                        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 32px; font-weight: bold;">🐛</span>
                        </div>
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: white;">Bug Report Received</h1>
                        <p style="margin: 12px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.9);">${bugType} - ${priority.toUpperCase()} Priority</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 40px 30px;">
                        <div style="background: #fee2e2; border: 2px solid #dc2626; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #991b1b;">Bug Report Details</h2>
                            
                            <div style="space-y: 12px;">
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Reporter Name:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${name}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Email:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${email}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Bug Type:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${bugType}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Priority:</strong>
                                    <span style="background: ${priority === 'critical' ? '#dc2626' : priority === 'high' ? '#ea580c' : priority === 'medium' ? '#d97706' : '#65a30d'}; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${priority}</span>
                                </div>
                                
                                ${device ? `
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Device:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${device}</span>
                                </div>
                                ` : ''}
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #991b1b;">Submission Time:</strong>
                                    <span style="color: #7f1d1d; margin-left: 8px;">${new Date().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bug Description -->
                        <div style="background: #fef2f2; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #991b1b;">Bug Description:</h3>
                            <div style="background: white; border-radius: 8px; padding: 16px; color: #7f1d1d; line-height: 1.5;">
                                ${description}
                            </div>
                        </div>
                        
                        ${steps ? `
                        <!-- Steps to Reproduce -->
                        <div style="background: #fff7ed; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #c2410c;">Steps to Reproduce:</h3>
                            <div style="background: white; border-radius: 8px; padding: 16px; color: #9a3412; line-height: 1.5;">
                                ${steps.split('\n').map(step => step.trim()).filter(step => step).map(step => `<p style="margin: 8px 0;">${step}</p>`).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Action Required -->
                        <div style="background: #f9fafb; border-radius: 12px; padding: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #374151;">Action Required:</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.6;">
                                <li>Verify and reproduce the bug</li>
                                <li>Assign to appropriate development team</li>
                                <li>Prioritize based on severity (${priority.toUpperCase()})</li>
                                <li>Update user on progress if needed</li>
                                <li>Test fix thoroughly before deployment</li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            © 2025 GrupChat. Bug report notification.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail('grupchatinfo@gmail.com', subject, htmlContent);
    }

    // Send data correction request email
    async sendDataCorrectionRequest(email, type, description) {
        const subject = `Data Correction Request - ${email}`;
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Data Correction Request - GrupChat</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 40px 30px; text-align: center;">
                        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <span style="color: white; font-size: 32px; font-weight: bold;">GC</span>
                        </div>
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: white;">✏️ Data Correction Request</h1>
                        <p style="margin: 12px 0 0 0; font-size: 18px; color: rgba(255, 255, 255, 0.9);">Correction request received</p>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 40px 30px;">
                        <div style="background: #fef3c7; border: 2px solid #d97706; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #92400e;">Data Correction Request Details</h2>
                            
                            <div style="space-y: 12px;">
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #92400e;">Email:</strong>
                                    <span style="color: #78350f; margin-left: 8px;">${email}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #92400e;">Correction Type:</strong>
                                    <span style="color: #78350f; margin-left: 8px;">${type}</span>
                                </div>
                                
                                <div style="margin-bottom: 12px;">
                                    <strong style="color: #92400e;">Submission Time:</strong>
                                    <span style="color: #78350f; margin-left: 8px;">${new Date().toLocaleString()}</span>
                                </div>
                                
                                <div style="margin-top: 16px;">
                                    <strong style="color: #92400e;">Description:</strong>
                                    <div style="background: white; border-radius: 8px; padding: 16px; margin-top: 8px; color: #78350f; line-height: 1.5;">
                                        ${description}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Required -->
                        <div style="background: #f9fafb; border-radius: 12px; padding: 24px;">
                            <h3 style="margin: 0 0 12px 0; color: #374151;">Action Required:</h3>
                            <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.6;">
                                <li>Verify the user's identity</li>
                                <li>Review the correction request</li>
                                <li>Update the data as appropriate</li>
                                <li>Send confirmation email to user</li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            © 2025 GrupChat. Data correction request notification.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail('grupchatinfo@gmail.com', subject, htmlContent);
    }

    // Helper method to strip HTML tags for text content
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }
}

export const emailService = new EmailService();
