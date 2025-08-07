# 🍽️ Sri Kanya Family Restaurant - Digital Menu System

A modern, real-time restaurant menu application with advanced analytics, email notifications, and PWA capabilities.

## 🎯 **Latest Features (v3.1)**

### **🖼️ Image Upload System - Professional Menu Management**
- **Drag & Drop Upload**: Intuitive image upload interface
- **Auto-Optimization**: Images automatically resized to 400x300px
- **Cloud Storage**: Images stored on Cloudinary CDN for fast loading
- **File Validation**: Supports JPEG, PNG, WebP up to 5MB
- **Instant Preview**: See uploaded images immediately
- **Easy Management**: Add/remove images with one click

### **📊 Real Analytics Data - Better Business Insights**
- **Live Data Processing**: Real-time analytics from MongoDB
- **Comprehensive Metrics**: Revenue, orders, customer satisfaction
- **Peak Hours Analysis**: Identify busiest times
- **Popular Items Tracking**: See what customers love
- **Customer Analytics**: Repeat customers, top spenders
- **Category Performance**: Track category-wise success

### **📧 Email Notifications - Improved Customer Communication**
- **Order Confirmations**: Professional email templates
- **Kitchen Notifications**: Instant alerts for new orders
- **Admin Reports**: Daily business summaries
- **Custom Templates**: Beautiful, branded emails
- **Auto-Triggers**: Emails sent automatically on events

### **📱 PWA Enhancement - Better Mobile Experience**
- **Offline Functionality**: Works without internet
- **App-like Experience**: Install as mobile app
- **Background Sync**: Orders sync when online
- **Push Notifications**: Real-time updates
- **Smart Caching**: Fast loading and updates

## 🚀 **Key Features**

### **Real-time Order Management**
- Live order tracking and status updates
- Real-time notifications for new orders
- Order history and analytics
- Customer feedback system

### **Multi-language Support**
- English, Hindi, and Telugu translations
- Automatic transliteration for menu items
- Localized user interface

### **Advanced Admin Dashboard**
- Real-time analytics and reporting
- Order management and status updates
- Customer feedback management
- Menu item management
- System settings and configuration

### **Mobile-First Design**
- Responsive design for all devices
- PWA capabilities for app-like experience
- Offline functionality
- Touch-optimized interface

## 🛠️ **Technology Stack**

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: MongoDB with Mongoose
- **Real-time**: Server-Sent Events (SSE)
- **PWA**: Service Workers, Web App Manifest
- **Email**: Nodemailer with HTML templates
- **Deployment**: Render.com

## 📊 **Analytics Features**

### **Sales Analytics**
- Total revenue and order tracking
- Average order value calculations
- Daily and monthly revenue trends
- Peak hours analysis

### **Customer Analytics**
- Customer satisfaction ratings
- Repeat customer tracking
- Top customer identification
- Customer behavior insights

### **Menu Analytics**
- Popular items tracking
- Category performance analysis
- Item performance metrics
- Revenue by item analysis

## 📧 **Email Notification System**

### **Order Notifications**
- **Customer Confirmation**: Professional order confirmation emails
- **Kitchen Alerts**: Real-time kitchen notifications
- **Admin Updates**: System notifications for new orders

### **System Notifications**
- **Daily Reports**: Automated business reports
- **System Alerts**: Important system notifications
- **Custom Notifications**: Configurable notification system

### **Email Templates**
- Beautiful, branded HTML templates
- Mobile-responsive design
- Professional styling and layout
- Customizable content

## 📱 **PWA Features**

### **Offline Capabilities**
- Complete offline functionality
- Intelligent caching strategies
- Background data synchronization
- Offline order queuing

### **App-like Experience**
- Install prompts and shortcuts
- Native app navigation
- Full-screen experience
- Home screen installation

### **Performance Optimization**
- Fast loading times
- Efficient caching
- Background sync
- Optimized images

## 🔧 **Installation & Setup**

### **Prerequisites**
- Node.js 18+ 
- MongoDB Atlas account
- Email service (Gmail, SendGrid, etc.)

### **Environment Variables**
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/srikanya-restaurant

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Sri Kanya Restaurant <your-email@gmail.com>

# Admin Configuration
ADMIN_PASSWORD=your-admin-password
ADMIN_EMAIL=admin@srikanya.com
KITCHEN_EMAIL=kitchen@srikanya.com

# Webhook Configuration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/restaurant-orders
```

### **Installation Steps**
1. **Clone the repository**
   ```bash
   git clone https://github.com/sivachandra422/Restaurant.git
   cd Restaurant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📈 **Analytics Dashboard**

### **Real-time Metrics**
- Live order tracking
- Revenue monitoring
- Customer satisfaction
- Popular items

### **Business Intelligence**
- Sales trends analysis
- Customer behavior insights
- Menu performance metrics
- Operational efficiency

### **Reporting**
- Daily, weekly, monthly reports
- Export functionality
- Custom date ranges
- Comparative analytics

## 🎨 **UI/UX Features**

### **Modern Design**
- Clean, professional interface
- Mobile-first responsive design
- Intuitive navigation
- Accessibility compliant

### **User Experience**
- Fast loading times
- Smooth animations
- Touch-optimized interface
- Offline functionality

### **Customization**
- Branded color schemes
- Customizable themes
- Flexible layout options
- Localized content

## 🔒 **Security Features**

### **Authentication**
- Secure admin login
- JWT token authentication
- Session management
- Password protection

### **Data Protection**
- Encrypted data transmission
- Secure API endpoints
- Input validation
- XSS protection

## 📱 **Mobile Experience**

### **PWA Capabilities**
- Installable app
- Offline functionality
- Push notifications
- Background sync

### **Mobile Optimization**
- Touch-friendly interface
- Responsive design
- Fast loading
- Native app feel

## 🚀 **Deployment**

### **Render.com Deployment**
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically
4. Monitor performance

### **Production Optimization**
- Image optimization
- Code splitting
- Caching strategies
- Performance monitoring

## 📊 **Performance Metrics**

### **Loading Speed**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

### **PWA Score**
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For support and questions:
- Email: support@srikanya.com
- Phone: +91-9876543210
- Website: https://srikanya.com

## 🎯 **Roadmap**

### **Phase 4: Advanced Features**
- [ ] Payment gateway integration
- [ ] Inventory management
- [ ] AI-powered recommendations
- [ ] Advanced reporting

### **Phase 5: Enterprise Features**
- [ ] Multi-location support
- [ ] Advanced analytics
- [ ] Customer loyalty program
- [ ] Integration APIs

---

**Built with ❤️ for Sri Kanya Family Restaurant**
