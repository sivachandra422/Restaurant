import * as nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
  specialInstructions?: string;
  estimatedTime?: string;
  timestamp: Date;
}

export interface NotificationEmailData {
  type: 'new-order' | 'order-update' | 'daily-report' | 'low-stock' | 'system-alert';
  title: string;
  message: string;
  data?: any;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email configuration is available
    const emailConfig = this.getEmailConfig();
    
    if (emailConfig) {
      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;
      console.log('Email service configured successfully');
    } else {
      console.log('Email service not configured - using mock mode');
      this.isConfigured = false;
    }
  }

  private getEmailConfig(): EmailConfig | null {
    // For production, use environment variables
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      return {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      };
    }

    // For development, you can use Gmail or other services
    // You'll need to set up app-specific passwords
    return null;
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log('Email service not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text || this.stripHtml(template.html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Order notification emails
  async sendOrderConfirmation(data: OrderEmailData, recipientEmail: string): Promise<boolean> {
    const template = this.generateOrderConfirmationTemplate(data);
    return this.sendEmail(recipientEmail, template);
  }

  async sendOrderUpdate(data: OrderEmailData, recipientEmail: string): Promise<boolean> {
    const template = this.generateOrderUpdateTemplate(data);
    return this.sendEmail(recipientEmail, template);
  }

  async sendKitchenNotification(data: OrderEmailData, kitchenEmail: string): Promise<boolean> {
    const template = this.generateKitchenNotificationTemplate(data);
    return this.sendEmail(kitchenEmail, template);
  }

  // System notification emails
  async sendSystemNotification(data: NotificationEmailData, recipientEmail: string): Promise<boolean> {
    const template = this.generateSystemNotificationTemplate(data);
    return this.sendEmail(recipientEmail, template);
  }

  async sendDailyReport(analyticsData: any, recipientEmail: string): Promise<boolean> {
    const template = this.generateDailyReportTemplate(analyticsData);
    return this.sendEmail(recipientEmail, template);
  }

  // Template generators
  private generateOrderConfirmationTemplate(data: OrderEmailData): EmailTemplate {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.subtotal}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Sri Kanya Restaurant</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #f97316; color: white; padding: 12px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Sri Kanya Family Restaurant</h1>
            <p>Order Confirmation</p>
          </div>
          <div class="content">
            <div class="order-details">
              <h2>Order #${data.orderId}</h2>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Phone:</strong> ${data.customerPhone}</p>
              <p><strong>Table:</strong> ${data.tableNumber}</p>
              <p><strong>Date:</strong> ${data.timestamp.toLocaleString()}</p>
              ${data.estimatedTime ? `<p><strong>Estimated Time:</strong> ${data.estimatedTime}</p>` : ''}
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total">
              <strong>Total Amount: ₹${data.totalAmount}</strong>
            </div>
            
            ${data.specialInstructions ? `
              <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong>Special Instructions:</strong><br>
                ${data.specialInstructions}
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>Thank you for choosing Sri Kanya Family Restaurant!</p>
            <p>📍 Dharmavaram, Andhra Pradesh - 533430</p>
            <p>📞 +91-9876543210</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `Order Confirmation #${data.orderId} - Sri Kanya Restaurant`,
      html
    };
  }

  private generateOrderUpdateTemplate(data: OrderEmailData): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Update - Sri Kanya Restaurant</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .status-update { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Sri Kanya Family Restaurant</h1>
            <p>Order Update</p>
          </div>
          <div class="content">
            <div class="status-update">
              <h2>Order #${data.orderId} Status Update</h2>
              <p>Your order has been updated and is being prepared.</p>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Table:</strong> ${data.tableNumber}</p>
              <p><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `Order Update #${data.orderId} - Sri Kanya Restaurant`,
      html
    };
  }

  private generateKitchenNotificationTemplate(data: OrderEmailData): EmailTemplate {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">-</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order - Kitchen Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .urgent { background: #fef2f2; border: 2px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background: #dc2626; color: white; padding: 12px; text-align: left; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 NEW ORDER - KITCHEN</h1>
            <p>Order #${data.orderId}</p>
          </div>
          <div class="content">
            <div class="urgent">
              <h2>Order Details</h2>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Table:</strong> ${data.tableNumber}</p>
              <p><strong>Time:</strong> ${data.timestamp.toLocaleString()}</p>
              ${data.estimatedTime ? `<p><strong>Estimated Time:</strong> ${data.estimatedTime}</p>` : ''}
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th>Special Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            ${data.specialInstructions ? `
              <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong>Order Instructions:</strong><br>
                ${data.specialInstructions}
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `🔥 NEW ORDER #${data.orderId} - Kitchen`,
      html
    };
  }

  private generateSystemNotificationTemplate(data: NotificationEmailData): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title} - Sri Kanya Restaurant</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .notification { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Sri Kanya Family Restaurant</h1>
            <p>${data.title}</p>
          </div>
          <div class="content">
            <div class="notification">
              <h2>${data.title}</h2>
              <p>${data.message}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `${data.title} - Sri Kanya Restaurant`,
      html
    };
  }

  private generateDailyReportTemplate(analyticsData: any): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Report - Sri Kanya Restaurant</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .metric { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #f97316; }
          .metric h3 { margin: 0 0 10px 0; color: #f97316; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Sri Kanya Family Restaurant</h1>
            <p>Daily Report - ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="content">
            <div class="metric">
              <h3>📊 Today's Summary</h3>
              <p><strong>Total Orders:</strong> ${analyticsData.todayOrders || 0}</p>
              <p><strong>Total Revenue:</strong> ₹${analyticsData.todayRevenue || 0}</p>
              <p><strong>Average Order Value:</strong> ₹${analyticsData.averageOrderValue || 0}</p>
            </div>
            
            <div class="metric">
              <h3>⭐ Customer Satisfaction</h3>
              <p><strong>Average Rating:</strong> ${analyticsData.customerSatisfaction || 0}/5</p>
              <p><strong>Total Reviews:</strong> ${analyticsData.customerReviewsCount || 0}</p>
            </div>
            
            <div class="metric">
              <h3>🔥 Popular Items</h3>
              ${(analyticsData.popularItems || []).slice(0, 5).map((item: any) => 
                `<p>• ${item.name} - ${item.count} orders (₹${item.revenue})</p>`
              ).join('')}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject: `Daily Report - ${new Date().toLocaleDateString()} - Sri Kanya Restaurant`,
      html
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
