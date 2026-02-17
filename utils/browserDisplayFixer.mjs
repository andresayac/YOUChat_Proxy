/**
 * @param {Object} page - Puppeteer
 * @param {Object} options - Configuration options
 * @param {number} options.width - Viewport width
 * @param {number} options.height - Viewport height
 * @param {number} options.deviceScaleFactor - Device scale factor
 * @param {boolean} options.isMobile - Simulate mobile device
 * @param {boolean} options.hasTouch - Touch support
 * @param {boolean} options.isLandscape - Landscape orientation
 * @returns {Promise<void>}
 */
export async function fixBrowserDisplay(page, options = {}) {
    if (!page) {
        console.error('Page object is null, unable to fix display');
        return;
    }

    const defaultOptions = {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: true
    };

    const settings = { ...defaultOptions, ...options };

    try {
        // Set viewport size and device scale factor
        await page.setViewport({
            width: settings.width,
            height: settings.height,
            deviceScaleFactor: settings.deviceScaleFactor,
            isMobile: settings.isMobile,
            hasTouch: settings.hasTouch,
            isLandscape: settings.isLandscape
        });

        // Try to adjust window size
        const session = await page.target().createCDPSession();
        await session.send('Emulation.setDeviceMetricsOverride', {
            width: settings.width,
            height: settings.height,
            deviceScaleFactor: settings.deviceScaleFactor,
            mobile: settings.isMobile,
            screenWidth: settings.width,
            screenHeight: settings.height
        });

        // Reset page zoom
        await page.evaluate(() => {
            document.body.style.zoom = '100%';
            document.body.style.transform = 'scale(1)';
            document.body.style.transformOrigin = '0 0';

            // Try to fix possible CSS issues
            const styleElement = document.createElement('style');
            styleElement.textContent = `
                html, body {
                    width: 100% !important;
                    height: 100% !important;
                    overflow: auto !important;
                }

                .container, .main, #app, #root {
                    max-width: 100% !important;
                    width: auto !important;
                }
            `;
            document.head.appendChild(styleElement);

            window.dispatchEvent(new Event('resize'));
        });

    } catch (error) {
        console.error('Error fixing browser display:', error);
    }
}

/**
 * Adjust CSS scaling
 * @param {Object} page - Puppeteer
 * @param {number} scale - Scaling factor
 * @returns {Promise<void>}
 */
export async function adjustCssScaling(page, scale = 1) {
    if (!page) return;

    try {
        await page.evaluate((scale) => {
            const styleElem = document.createElement('style');
            styleElem.id = 'puppeteer-display-fix';
            styleElem.textContent = `
                html {
                    transform: scale(${scale});
                    transform-origin: top left;
                    width: ${100 / scale}% !important;
                    height: ${100 / scale}% !important;
                }
            `;
            document.head.appendChild(styleElem);

            // Recalculate layout
            window.dispatchEvent(new Event('resize'));
        }, scale);
    } catch (error) {
        console.error('Error adjusting CSS scaling:', error);
    }
}

/**
 * Fix High DPI display
 * @param {Object} page - Puppeteer
 * @returns {Promise<void>}
 */
export async function fixHighDpiDisplay(page) {
    if (!page) return;

    try {
        // Detect device pixel ratio
        const devicePixelRatio = await page.evaluate(() => window.devicePixelRatio);

        if (devicePixelRatio > 1) {
            await page.setViewport({
                width: 1280,
                height: 800,
                deviceScaleFactor: devicePixelRatio
            });

            await page.evaluate((dpr) => {
                const meta = document.createElement('meta');
                meta.setAttribute('name', 'viewport');
                meta.setAttribute('content', `initial-scale=1, minimum-scale=1, maximum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi, user-scalable=no`);
                document.head.appendChild(meta);
            }, devicePixelRatio);
        }
    } catch (error) {
        console.error('Error fixing High DPI display:', error);
    }
}

/**
 * Full browser display optimization
 * @param {Object} page - Puppeteer
 * @param {Object} options - Configuration
 * @returns {Promise<void>}
 */
export async function optimizeBrowserDisplay(page, options = {}) {
    const defaultOptions = {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        cssScale: null,
        fixHighDpi: true,
        forceResize: true
    };

    const config = { ...defaultOptions, ...options };

    try {
        // Basic display fix
        await fixBrowserDisplay(page, {
            width: config.width,
            height: config.height,
            deviceScaleFactor: config.deviceScaleFactor
        });

        // Fix High DPI display
        if (config.fixHighDpi) {
            await fixHighDpiDisplay(page);
        }

        if (config.cssScale !== null) {
            await adjustCssScaling(page, config.cssScale);
        }

        // Force window resize if requested
        if (config.forceResize && !config.isHeadless) {
            try {
                const client = await page.target().createCDPSession();
                await client.send('Browser.getWindowForTarget');
                await client.send('Browser.setWindowBounds', {
                    windowId: 1,
                    bounds: {
                        width: config.width,
                        height: config.height
                    }
                });
            } catch (resizeError) {
                // console.log('Unable to adjust window size:', resizeError.message);

                try {
                    await page.evaluate((width, height) => {
                        window.resizeTo(width, height);
                    }, config.width, config.height);
                } catch (altError) {
                    console.log('Failed:', altError.message);
                }
            }
        }

    } catch (error) {
        console.error('Browser display optimization failed:', error);
    }
}