# 🌟 Comet Browser JSON Testing Guide

## 🎯 **Overview**
This guide will help you use the provided JSON prompts to perform comprehensive end-to-end testing of your restaurant menu application using Comet browser.

## 📁 **Available JSON Files**

### 1. `comet-testing-prompt.json` - **Comprehensive Testing Suite**
- **Use Case**: Full professional testing with detailed scenarios
- **Features**: Complete test scenarios, performance benchmarks, error handling
- **Best For**: Thorough testing and quality assurance

### 2. `comet-testing-simple.json` - **Simplified Testing**
- **Use Case**: Quick testing with essential scenarios
- **Features**: Core functionality testing, basic performance checks
- **Best For**: Rapid testing and validation

## 🚀 **How to Use with Comet Browser**

### **Step 1: Prepare Your Environment**
```bash
# Ensure your development server is running
npm run dev
# Your app should be available at: http://localhost:3001
```

### **Step 2: Open Comet Browser**
1. Launch Comet browser
2. Open Developer Tools (`F12` or `Ctrl+Shift+I`)
3. Go to Console tab

### **Step 3: Load the JSON Prompt**

#### **Option A: Copy-Paste Method**
1. Open the JSON file in your code editor
2. Copy the entire content
3. In Comet browser console, paste and execute:
```javascript
// Load the comprehensive testing prompt
const testPrompt = {
  // Paste the JSON content here
};

// Initialize testing
window.testPrompt = testPrompt;
console.log('✅ Testing prompt loaded successfully!');
```

#### **Option B: File Import Method**
1. Save the JSON file in your project directory
2. In Comet browser console:
```javascript
// Load JSON file
fetch('./comet-testing-simple.json')
  .then(response => response.json())
  .then(data => {
    window.testPrompt = data;
    console.log('✅ Testing prompt loaded from file!');
  });
```

### **Step 4: Execute Tests**

#### **Run All Tests**
```javascript
// Execute all test scenarios
function runAllTests() {
  const prompt = window.testPrompt;
  console.log(`🚀 Starting ${prompt.testName}`);
  
  prompt.testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test Case ${index + 1}: ${testCase.name}`);
    testCase.steps.forEach((step, stepIndex) => {
      console.log(`  Step ${stepIndex + 1}: ${step.action}`);
      console.log(`  Expected: ${step.check}`);
    });
  });
}

runAllTests();
```

#### **Run Specific Test Case**
```javascript
// Run only customer experience tests
function runCustomerTests() {
  const prompt = window.testPrompt;
  const customerTest = prompt.testCases.find(tc => tc.name === 'Customer Menu Experience');
  
  if (customerTest) {
    console.log(`🧪 Running: ${customerTest.name}`);
    customerTest.steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step.action} → ${step.check}`);
    });
  }
}

runCustomerTests();
```

## 🎯 **Testing Scenarios**

### **Scenario 1: Customer Journey Testing**
```javascript
// Automated customer journey test
function testCustomerJourney() {
  console.log('🛒 Testing Customer Journey...');
  
  // Step 1: Open homepage
  window.location.href = 'http://localhost:3001';
  
  // Step 2: Wait for page load and check elements
  setTimeout(() => {
    const menuItems = document.querySelectorAll('[data-testid="menu-item"]');
    const categories = document.querySelectorAll('[data-testid="category-tab"]');
    
    console.log(`✅ Found ${menuItems.length} menu items`);
    console.log(`✅ Found ${categories.length} categories`);
    
    // Step 3: Test language switching
    const languageButtons = document.querySelectorAll('[data-testid="language-switch"]');
    if (languageButtons.length > 0) {
      console.log('✅ Language switcher found');
    }
    
  }, 3000);
}

testCustomerJourney();
```

### **Scenario 2: Admin Dashboard Testing**
```javascript
// Automated admin dashboard test
function testAdminDashboard() {
  console.log('👨‍💼 Testing Admin Dashboard...');
  
  // Step 1: Go to admin login
  window.location.href = 'http://localhost:3001/admin/login';
  
  setTimeout(() => {
    // Step 2: Check login form
    const loginForm = document.querySelector('form');
    if (loginForm) {
      console.log('✅ Login form found');
      
      // Step 3: Fill login credentials
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      
      if (emailInput && passwordInput) {
        emailInput.value = 'admin@srikanya.com';
        passwordInput.value = 'admin123';
        console.log('✅ Credentials filled');
      }
    }
  }, 2000);
}

testAdminDashboard();
```

### **Scenario 3: PWA Features Testing**
```javascript
// Test PWA features
function testPWAFeatures() {
  console.log('📱 Testing PWA Features...');
  
  // Check service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`✅ Service workers registered: ${registrations.length}`);
    });
  }
  
  // Check if app is installable
  if ('BeforeInstallPromptEvent' in window) {
    console.log('✅ App is installable');
  }
  
  // Check manifest
  const manifest = document.querySelector('link[rel="manifest"]');
  if (manifest) {
    console.log('✅ Web app manifest found');
  }
}

testPWAFeatures();
```

## 📊 **Performance Testing**

### **Load Time Testing**
```javascript
// Test page load performance
function testPerformance() {
  console.log('⚡ Testing Performance...');
  
  const startTime = performance.now();
  
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`📊 Page load time: ${loadTime.toFixed(2)}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ Page load time is acceptable (< 3s)');
    } else {
      console.log('⚠️ Page load time is slow (> 3s)');
    }
  });
}

testPerformance();
```

## 🔍 **Manual Testing Checklist**

### **Customer Experience**
- [ ] **Homepage Loading**: Page loads within 3 seconds
- [ ] **Language Switching**: Hindi, Telugu, English work
- [ ] **Menu Categories**: All categories display correctly
- [ ] **Add to Cart**: Items can be added to cart
- [ ] **Cart Functionality**: Cart updates correctly
- [ ] **Checkout Process**: Order can be placed successfully

### **Admin Dashboard**
- [ ] **Login**: Admin can login successfully
- [ ] **Menu Management**: Items can be added/edited/deleted
- [ ] **Image Upload**: Images can be uploaded
- [ ] **Order Management**: Orders appear in real-time
- [ ] **Analytics**: Analytics data displays correctly

### **PWA Features**
- [ ] **Installation**: App can be installed
- [ ] **Offline Mode**: App works without internet
- [ ] **Service Worker**: Service worker is registered
- [ ] **Responsive Design**: Works on all screen sizes

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Issue 1: JSON Not Loading**
```javascript
// Check if JSON is loaded
if (window.testPrompt) {
  console.log('✅ JSON prompt loaded');
} else {
  console.log('❌ JSON prompt not loaded');
}
```

#### **Issue 2: Tests Not Running**
```javascript
// Check if test functions are available
if (typeof testCustomerJourney === 'function') {
  console.log('✅ Test functions available');
} else {
  console.log('❌ Test functions not found');
}
```

#### **Issue 3: Page Not Loading**
```javascript
// Check if server is running
fetch('http://localhost:3001')
  .then(response => {
    if (response.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding');
    }
  })
  .catch(error => {
    console.log('❌ Server not accessible:', error);
  });
```

## 📝 **Test Reporting**

### **Generate Test Report**
```javascript
// Generate test report
function generateTestReport() {
  const report = {
    timestamp: new Date().toISOString(),
    browser: 'Comet Browser',
    url: window.location.href,
    tests: []
  };
  
  // Add test results
  window.testPrompt.testCases.forEach(testCase => {
    report.tests.push({
      name: testCase.name,
      status: 'completed',
      steps: testCase.steps.length
    });
  });
  
  console.log('📊 Test Report:', report);
  return report;
}

generateTestReport();
```

## 🎉 **Success Criteria**

Your testing is successful when:

✅ **All customer features work smoothly**
✅ **Admin dashboard is fully functional**
✅ **Image upload system works perfectly**
✅ **Real-time updates function properly**
✅ **PWA features work as expected**
✅ **Performance meets requirements**
✅ **No critical bugs found**

---

## 🚀 **Quick Start Commands**

### **Load and Run All Tests**
```javascript
// Copy this into Comet browser console
fetch('./comet-testing-simple.json')
  .then(response => response.json())
  .then(data => {
    window.testPrompt = data;
    console.log('✅ Testing prompt loaded!');
    runAllTests();
  });
```

### **Run Specific Test**
```javascript
// Run customer tests only
testCustomerJourney();
```

### **Check Performance**
```javascript
// Test performance
testPerformance();
```

---

**🎯 Happy Testing with Comet Browser!**
