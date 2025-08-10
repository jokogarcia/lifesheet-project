import puppeteer, { Browser, Page } from 'puppeteer';
import { ApiError } from '../middleware/errorHandler';

export class PDFService {
    private static browser: Browser | null = null;

    /**
     * Get or create a browser instance (singleton pattern for performance)
     */
    private static async getBrowser(): Promise<Browser> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--font-render-hinting=none',
                ]
            });
        }
        return this.browser;
    }

    /**
     * Convert HTML to PDF
     */
    static async htmlToPDF(html: string, options?: {
        format?: 'A4' | 'Letter' | 'Legal';
        margin?: { top: string; right: string; bottom: string; left: string; };
        landscape?: boolean;
    }): Promise<Buffer> {
        let page: Page | null = null;
        try {
            const browser = await this.getBrowser();
            page = await browser.newPage();
            
            await page.setContent(html, { 
                waitUntil: ['domcontentloaded', 'networkidle0'],
                timeout: 30000 
            });

            const pdfBuffer = await page.pdf({
                format: options?.format || 'A4',
                landscape: options?.landscape || false,
                printBackground: true,
                margin: options?.margin || {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                preferCSSPageSize: false
            });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new ApiError(500, 'Failed to generate PDF');
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    /**
     * Close the browser instance (call on app shutdown)
     */
    static async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}