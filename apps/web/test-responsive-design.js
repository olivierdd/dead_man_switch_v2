/**
 * Responsive Design Testing Script
 * Tests the application across different screen sizes as defined in task 2.2
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configurations for different screen sizes
const testConfigs = [
    {
        name: 'Mobile Small (320px)',
        width: 320,
        height: 568,
        breakpoint: 'xs'
    },
    {
        name: 'Mobile Medium (375px)',
        width: 375,
        height: 667,
        breakpoint: 'sm'
    },
    {
        name: 'Mobile Large (414px)',
        width: 414,
        height: 896,
        breakpoint: 'sm'
    },
    {
        name: 'Tablet Portrait (768px)',
        width: 768,
        height: 1024,
        breakpoint: 'md'
    },
    {
        name: 'Tablet Landscape (1024px)',
        width: 1024,
        height: 768,
        breakpoint: 'lg'
    },
    {
        name: 'Desktop Small (1280px)',
        width: 1280,
        height: 720,
        breakpoint: 'xl'
    },
    {
        name: 'Desktop Medium (1440px)',
        width: 1440,
        height: 900,
        breakpoint: '2xl'
    },
    {
        name: 'Desktop Large (1920px)',
        width: 1920,
        height: 1080,
        breakpoint: '2xl'
    }
];

// Pages to test
const pagesToTest = [
    { url: '/', name: 'Landing Page' },
    { url: '/how-it-works', name: 'How It Works' },
    { url: '/pricing', name: 'Pricing' },
    { url: '/security', name: 'Security' },
    { url: '/about', name: 'About' },
    { url: '/contact', name: 'Contact' },
    { url: '/auth/login', name: 'Login' },
    { url: '/auth/register', name: 'Register' }
];

class ResponsiveDesignTester {
    constructor() {
        this.browser = null;
        this.results = [];
        this.baseUrl = 'http://localhost:3000';
    }

    async init() {
        console.log('🚀 Starting Responsive Design Testing...');
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for CI/CD
            defaultViewport: null,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async testPage(page, config) {
        const testPage = await this.browser.newPage();

        try {
            // Set viewport
            await testPage.setViewport({
                width: config.width,
                height: config.height
            });

            // Navigate to page
            const fullUrl = `${this.baseUrl}${page.url}`;
            console.log(`  Testing ${page.name} at ${config.name} (${config.width}x${config.height})`);

            await testPage.goto(fullUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Test results object
            const testResult = {
                page: page.name,
                url: page.url,
                config: config,
                timestamp: new Date().toISOString(),
                tests: {}
            };

            // Test 1: Check if page loads without errors
            testResult.tests.pageLoads = await this.testPageLoads(testPage);

            // Test 2: Check navigation menu behavior
            testResult.tests.navigationMenu = await this.testNavigationMenu(testPage, config);

            // Test 3: Check glassmorphic cards spacing
            testResult.tests.glassmorphicCards = await this.testGlassmorphicCards(testPage, config);

            // Test 4: Check responsive grid layouts
            testResult.tests.responsiveGrids = await this.testResponsiveGrids(testPage, config);

            // Test 5: Check text readability and sizing
            testResult.tests.textReadability = await this.testTextReadability(testPage, config);

            // Test 6: Check button and interactive elements
            testResult.tests.interactiveElements = await this.testInteractiveElements(testPage, config);

            // Test 7: Check for horizontal scrolling (should not exist)
            testResult.tests.noHorizontalScroll = await this.testNoHorizontalScroll(testPage);

            // Test 8: Check particle system performance
            if (page.url === '/') {
                testResult.tests.particleSystem = await this.testParticleSystem(testPage, config);
            }

            // Take screenshot for visual verification
            const screenshotPath = `./test-screenshots/${config.name.replace(/[^a-zA-Z0-9]/g, '_')}_${page.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
            await testPage.screenshot({
                path: screenshotPath,
                fullPage: true
            });
            testResult.screenshot = screenshotPath;

            this.results.push(testResult);
            console.log(`  ✅ ${page.name} at ${config.name} - Tests completed`);

        } catch (error) {
            console.error(`  ❌ Error testing ${page.name} at ${config.name}:`, error.message);
            this.results.push({
                page: page.name,
                url: page.url,
                config: config,
                timestamp: new Date().toISOString(),
                error: error.message,
                tests: { pageLoads: false }
            });
        } finally {
            await testPage.close();
        }
    }

    async testPageLoads(page) {
        try {
            // Check for JavaScript errors
            const errors = await page.evaluate(() => {
                return window.errors || [];
            });

            // Check if main content is visible
            const mainContent = await page.$('main, .main-content, [role="main"]');
            const isMainVisible = mainContent ? await mainContent.isVisible() : false;

            return {
                success: errors.length === 0 && isMainVisible,
                errors: errors,
                mainContentVisible: isMainVisible
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testNavigationMenu(page, config) {
        try {
            const nav = await page.$('nav');
            if (!nav) return { success: false, error: 'Navigation not found' };

            const isNavVisible = await nav.isVisible();

            // Check if navigation collapses on mobile
            const isMobile = config.width < 768;
            let menuCollapsed = false;

            if (isMobile) {
                // Look for hamburger menu or collapsed navigation
                const hamburgerMenu = await page.$('[data-testid="hamburger-menu"], .hamburger, .menu-toggle');
                const hiddenNavItems = await page.$$eval('nav .hidden', elements => elements.length);
                menuCollapsed = hamburgerMenu !== null || hiddenNavItems > 0;
            } else {
                // On desktop, navigation should be fully visible
                const navItems = await page.$$eval('nav a, nav button', elements => elements.length);
                menuCollapsed = navItems < 3; // Should have multiple nav items visible
            }

            return {
                success: isNavVisible && (isMobile ? menuCollapsed : !menuCollapsed),
                isNavVisible,
                menuCollapsed,
                isMobile
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testGlassmorphicCards(page, config) {
        try {
            const cards = await page.$$('.glass-card');
            if (cards.length === 0) return { success: true, message: 'No glass cards found' };

            const cardTests = await Promise.all(cards.map(async (card, index) => {
                const boundingBox = await card.boundingBox();
                if (!boundingBox) return { index, success: false, error: 'Card not visible' };

                // Check if card has proper spacing
                const hasProperSpacing = boundingBox.width > 0 && boundingBox.height > 0;

                // Check if card is not overlapping with viewport edges
                const isWithinViewport = boundingBox.x >= 0 &&
                    boundingBox.x + boundingBox.width <= config.width;

                return {
                    index,
                    success: hasProperSpacing && isWithinViewport,
                    boundingBox,
                    hasProperSpacing,
                    isWithinViewport
                };
            }));

            const allCardsValid = cardTests.every(test => test.success);

            return {
                success: allCardsValid,
                cardCount: cards.length,
                cardTests
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testResponsiveGrids(page, config) {
        try {
            const grids = await page.$$('.grid');
            if (grids.length === 0) return { success: true, message: 'No grids found' };

            const gridTests = await Promise.all(grids.map(async (grid, index) => {
                const boundingBox = await grid.boundingBox();
                if (!boundingBox) return { index, success: false, error: 'Grid not visible' };

                // Check if grid items are properly arranged
                const gridItems = await grid.$$('.grid > *');
                const itemTests = await Promise.all(gridItems.map(async (item, itemIndex) => {
                    const itemBox = await item.boundingBox();
                    return {
                        itemIndex,
                        visible: itemBox !== null,
                        boundingBox: itemBox
                    };
                }));

                const allItemsVisible = itemTests.every(test => test.visible);
                const isWithinViewport = boundingBox.x >= 0 &&
                    boundingBox.x + boundingBox.width <= config.width;

                return {
                    index,
                    success: allItemsVisible && isWithinViewport,
                    itemCount: gridItems.length,
                    itemTests,
                    boundingBox
                };
            }));

            const allGridsValid = gridTests.every(test => test.success);

            return {
                success: allGridsValid,
                gridCount: grids.length,
                gridTests
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testTextReadability(page, config) {
        try {
            // Check if text is readable (not too small)
            const textElements = await page.$$('h1, h2, h3, p, span, a');
            const textTests = await Promise.all(textElements.slice(0, 10).map(async (element, index) => {
                const computedStyle = await page.evaluate((el) => {
                    const style = window.getComputedStyle(el);
                    return {
                        fontSize: style.fontSize,
                        color: style.color,
                        lineHeight: style.lineHeight
                    };
                }, element);

                const fontSize = parseFloat(computedStyle.fontSize);
                const isReadable = fontSize >= 12; // Minimum readable font size

                return {
                    index,
                    success: isReadable,
                    fontSize,
                    computedStyle
                };
            }));

            const allTextReadable = textTests.every(test => test.success);

            return {
                success: allTextReadable,
                textTests
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testInteractiveElements(page, config) {
        try {
            const buttons = await page.$$('button, [role="button"], .btn, .btn-gradient');
            const links = await page.$$('a[href]');

            const buttonTests = await Promise.all(buttons.map(async (button, index) => {
                const boundingBox = await button.boundingBox();
                if (!boundingBox) return { index, success: false, error: 'Button not visible' };

                // Check if button is large enough for touch (minimum 44px)
                const isTouchFriendly = boundingBox.width >= 44 && boundingBox.height >= 44;
                const isWithinViewport = boundingBox.x >= 0 &&
                    boundingBox.x + boundingBox.width <= config.width;

                return {
                    index,
                    success: isTouchFriendly && isWithinViewport,
                    boundingBox,
                    isTouchFriendly,
                    isWithinViewport
                };
            }));

            const allButtonsValid = buttonTests.every(test => test.success);

            return {
                success: allButtonsValid,
                buttonCount: buttons.length,
                linkCount: links.length,
                buttonTests
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testNoHorizontalScroll(page) {
        try {
            const hasHorizontalScroll = await page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth;
            });

            return {
                success: !hasHorizontalScroll,
                hasHorizontalScroll
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async testParticleSystem(page, config) {
        try {
            // Check if particle system is present
            const particleCanvas = await page.$('canvas');
            if (!particleCanvas) return { success: false, error: 'Particle canvas not found' };

            const isCanvasVisible = await particleCanvas.isVisible();
            const canvasBoundingBox = await particleCanvas.boundingBox();

            // Check if canvas is properly sized
            const isProperlySized = canvasBoundingBox &&
                canvasBoundingBox.width > 0 &&
                canvasBoundingBox.height > 0;

            return {
                success: isCanvasVisible && isProperlySized,
                isCanvasVisible,
                canvasBoundingBox,
                isProperlySized
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async runAllTests() {
        console.log('📱 Testing responsive design across all screen sizes...');

        // Create screenshots directory
        if (!fs.existsSync('./test-screenshots')) {
            fs.mkdirSync('./test-screenshots');
        }

        for (const config of testConfigs) {
            console.log(`\n🔍 Testing ${config.name} (${config.width}x${config.height})`);

            for (const page of pagesToTest) {
                await this.testPage(page, config);
            }
        }

        await this.generateReport();
    }

    async generateReport() {
        console.log('\n📊 Generating test report...');

        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generateSummary(),
            results: this.results
        };

        // Save detailed report
        fs.writeFileSync('./responsive-design-test-report.json', JSON.stringify(report, null, 2));

        // Generate markdown report
        const markdownReport = this.generateMarkdownReport(report);
        fs.writeFileSync('./responsive-design-test-report.md', markdownReport);

        console.log('✅ Test report generated: responsive-design-test-report.md');
        console.log('📊 Summary:', report.summary);
    }

    generateSummary() {
        const totalTests = this.results.length;
        const successfulTests = this.results.filter(result =>
            !result.error && Object.values(result.tests).every(test =>
                typeof test === 'object' && test.success !== false
            )
        ).length;

        const failedTests = totalTests - successfulTests;
        const successRate = totalTests > 0 ? (successfulTests / totalTests * 100).toFixed(1) : 0;

        return {
            totalTests,
            successfulTests,
            failedTests,
            successRate: `${successRate}%`
        };
    }

    generateMarkdownReport(report) {
        let markdown = `# Responsive Design Test Report\n\n`;
        markdown += `**Generated:** ${report.timestamp}\n\n`;
        markdown += `## Summary\n\n`;
        markdown += `- **Total Tests:** ${report.summary.totalTests}\n`;
        markdown += `- **Successful:** ${report.summary.successfulTests}\n`;
        markdown += `- **Failed:** ${report.summary.failedTests}\n`;
        markdown += `- **Success Rate:** ${report.summary.successRate}\n\n`;

        markdown += `## Test Results by Screen Size\n\n`;

        // Group results by screen size
        const resultsBySize = {};
        report.results.forEach(result => {
            const sizeKey = result.config.name;
            if (!resultsBySize[sizeKey]) {
                resultsBySize[sizeKey] = [];
            }
            resultsBySize[sizeKey].push(result);
        });

        Object.entries(resultsBySize).forEach(([sizeName, results]) => {
            markdown += `### ${sizeName}\n\n`;

            results.forEach(result => {
                const status = result.error ? '❌' : '✅';
                markdown += `- ${status} **${result.page}**\n`;

                if (result.error) {
                    markdown += `  - Error: ${result.error}\n`;
                } else {
                    Object.entries(result.tests).forEach(([testName, testResult]) => {
                        const testStatus = testResult.success ? '✅' : '❌';
                        markdown += `  - ${testStatus} ${testName}\n`;
                    });
                }
                markdown += `\n`;
            });
        });

        return markdown;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the tests
async function runResponsiveDesignTests() {
    const tester = new ResponsiveDesignTester();

    try {
        await tester.init();
        await tester.runAllTests();
    } catch (error) {
        console.error('❌ Test execution failed:', error);
    } finally {
        await tester.cleanup();
    }
}

// Export for use in other scripts
module.exports = { ResponsiveDesignTester, runResponsiveDesignTests };

// Run if called directly
if (require.main === module) {
    runResponsiveDesignTests();
}
