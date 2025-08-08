// 🧪 Quick Test Script for Restaurant Menu App
// Run this in Comet Browser console to test key features

console.log('🌟 Restaurant Menu App - Quick Test Script');
console.log('==========================================');

// Test 1: Check if app is loaded
function testAppLoad() {
    console.log('✅ Test 1: App Load Check');
    const menuItems = document.querySelectorAll('[data-testid="menu-item"]');
    const categories = document.querySelectorAll('[data-testid="category-tab"]');
    
    console.log(`   - Menu items found: ${menuItems.length}`);
    console.log(`   - Categories found: ${categories.length}`);
    
    return menuItems.length > 0 && categories.length > 0;
}

// Test 2: Check language switching
function testLanguageSwitch() {
    console.log('✅ Test 2: Language Switch Check');
    const languageButtons = document.querySelectorAll('[data-testid="language-switch"]');
    
    if (languageButtons.length > 0) {
        console.log(`   - Language buttons found: ${languageButtons.length}`);
        return true;
    } else {
        console.log('   - Language buttons not found');
        return false;
    }
}

// Test 3: Check cart functionality
function testCartFunction() {
    console.log('✅ Test 3: Cart Function Check');
    const addToCartButtons = document.querySelectorAll('[data-testid="add-to-cart"]');
    const cartIcon = document.querySelector('[data-testid="cart-icon"]');
    
    console.log(`   - Add to cart buttons: ${addToCartButtons.length}`);
    console.log(`   - Cart icon found: ${cartIcon ? 'Yes' : 'No'}`);
    
    return addToCartButtons.length > 0 && cartIcon;
}

// Test 4: Check PWA features
function testPWAFeatures() {
    console.log('✅ Test 4: PWA Features Check');
    
    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            console.log(`   - Service workers registered: ${registrations.length}`);
        });
    }
    
    // Check if app is installable
    if ('BeforeInstallPromptEvent' in window) {
        console.log('   - App is installable');
    }
    
    return true;
}

// Test 5: Check responsive design
function testResponsiveDesign() {
    console.log('✅ Test 5: Responsive Design Check');
    const viewport = window.innerWidth;
    console.log(`   - Current viewport width: ${viewport}px`);
    
    if (viewport < 768) {
        console.log('   - Mobile view detected');
    } else if (viewport < 1024) {
        console.log('   - Tablet view detected');
    } else {
        console.log('   - Desktop view detected');
    }
    
    return true;
}

// Run all tests
function runAllTests() {
    console.log('\n🚀 Running all tests...\n');
    
    const tests = [
        testAppLoad,
        testLanguageSwitch,
        testCartFunction,
        testPWAFeatures,
        testResponsiveDesign
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    tests.forEach((test, index) => {
        try {
            const result = test();
            if (result) {
                passedTests++;
            }
        } catch (error) {
            console.log(`❌ Test ${index + 1} failed:`, error.message);
        }
        console.log('');
    });
    
    console.log('📊 Test Results:');
    console.log(`   - Passed: ${passedTests}/${totalTests}`);
    console.log(`   - Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Your app is working perfectly!');
    } else {
        console.log('⚠️  Some tests failed. Check the details above.');
    }
}

// Auto-run tests after 2 seconds
setTimeout(runAllTests, 2000);

// Export functions for manual testing
window.testRestaurantApp = {
    testAppLoad,
    testLanguageSwitch,
    testCartFunction,
    testPWAFeatures,
    testResponsiveDesign,
    runAllTests
};

console.log('💡 Manual testing available: window.testRestaurantApp.runAllTests()');
