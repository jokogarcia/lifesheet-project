import puppeteer, { Browser, Page } from 'puppeteer';
import { ApiError } from '../middleware/errorHandler';
import { constants } from '../constants'; // Import constants for API URL
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
    static async cvToPDF(cvId:string, pictureId?:string){
        
        try {
            const browser = await this.getBrowser();
            const page = await browser.newPage();
            let jsonurl = new URL(`private/cv-toprint/${cvId}`, constants.PRIVATE_API_URL).toString();
            if(pictureId) jsonurl += `?pictureId=${pictureId}`;
            const fullurl = new URL(`private/cv-printer/index.html?cv=${encodeURIComponent(jsonurl)}`, constants.PRIVATE_API_URL).toString();
            console.log('Navigating to:', fullurl);
            await page.goto(fullurl, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: false,
                printBackground: true,
                margin: {
                    top: '0in',
                    right: '0in',
                    bottom: '0in',
                    left: '0in'
                },
                preferCSSPageSize: false
            });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('Error generating CV PDF:', error);
            throw new ApiError(500, 'Failed to generate CV PDF');
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