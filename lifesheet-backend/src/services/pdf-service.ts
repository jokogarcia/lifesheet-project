import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';
import { ApiError } from '../middleware/errorHandler';
import { constants } from '../constants'; // Import constants for API URL

const LOGS_DIR = path.join(process.cwd(), 'logs');
interface CVToPDFOptions {
  pictureId?: string;
  template?: string;
  primaryColorOverride?: string;
  secondaryColorOverride?: string;
  textColorOverride?: string;
  text2ColorOverride?: string;
  backgroundColorOverride?: string;
}
export class PDFService {
  private static browser: Browser | null = null;

  /**
   * Attach console and request-failure listeners to a page and stream all
   * output to a timestamped plaintext log file under the `logs/` directory.
   * Returns a cleanup function that closes the write stream.
   */
  private static attachPageLogger(page: Page): () => void {
    try {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
    } catch {
      // directory already exists or creation failed; proceed regardless
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logPath = path.join(LOGS_DIR, `${timestamp}.log`);
    const stream = fs.createWriteStream(logPath, { flags: 'w' });
    stream.on('error', err => console.error('[PDFService] Log write error:', err));

    const writeLine = (line: string) => stream.write(`[${new Date().toISOString()}] ${line}\n`);

    page.on('console', msg => {
      writeLine(`[console:${msg.type()}] ${msg.text()}`);
    });
    page.on('requestfailed', request => {
      writeLine(`[request-failed] ${request.url()} - ${request.failure()?.errorText ?? ''}`);
    });
    page.on('pageerror', err => {
      writeLine(`[page-error] ${err.message}`);
    });

    return () => stream.end();
  }

  /**
   * Get or create a browser instance (singleton pattern for performance)
   */
  private static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        browser: 'firefox',
        executablePath: '/usr/bin/firefox',
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--font-render-hinting=none',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Convert HTML to PDF
   */
  static async htmlToPDF(
    html: string,
    options?: {
      format?: 'A4' | 'Letter' | 'Legal';
      margin?: { top: string; right: string; bottom: string; left: string };
      landscape?: boolean;
    }
  ): Promise<Buffer> {
    let page: Page | null = null;
    let closeLogger: (() => void) | null = null;
    try {
      const browser = await this.getBrowser();

      page = await browser.newPage();

      closeLogger = PDFService.attachPageLogger(page);

      await page.setContent(html, {
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000,
      });
      // Explicit image loading check

      await page.waitForFunction(
        () => {
          const images = Array.from(document.querySelectorAll('img'));
          return images.every(img => img.complete);
        },
        { timeout: 10000 }
      );

      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        landscape: options?.landscape || false,
        printBackground: true,
        margin: options?.margin || {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
        },
        preferCSSPageSize: false,
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new ApiError(500, 'Failed to generate PDF');
    } finally {
      if (page) {
        await page.close();
      }
      if (closeLogger) closeLogger();
    }
  }

  static async cvToPDF(cvId: string, options?: CVToPDFOptions) {
    const {
      pictureId,
      template,
      primaryColorOverride,
      secondaryColorOverride,
      textColorOverride,
      text2ColorOverride,
      backgroundColorOverride,
    } = options || {};

    let page: Page | null = null;
    let closeLogger: (() => void) | null = null;
    try {
      const browser = await this.getBrowser();
      page = await browser.newPage();
      closeLogger = PDFService.attachPageLogger(page);
      let jsonurl = new URL(`private/cv-toprint/${cvId}`, constants.PRIVATE_API_URL).toString();
      if (pictureId) jsonurl += `?pictureId=${pictureId}`;
      const fullurl = new URL(
        `private/cv-printer/index.html?cv=${encodeURIComponent(jsonurl)}`,
        constants.PRIVATE_API_URL
      );
      if (template) fullurl.searchParams.append('template', template);
      if (primaryColorOverride) fullurl.searchParams.append('primaryColor', primaryColorOverride);
      if (secondaryColorOverride)
        fullurl.searchParams.append('secondaryColor', secondaryColorOverride);
      if (textColorOverride) fullurl.searchParams.append('textColor', textColorOverride);
      if (text2ColorOverride) fullurl.searchParams.append('text2Color', text2ColorOverride);
      if (backgroundColorOverride)
        fullurl.searchParams.append('backgroundColor', backgroundColorOverride);
      console.log('Navigating to:', fullurl);
      await page.goto(fullurl.toString(), { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: {
          top: '0in',
          right: '0in',
          bottom: '0in',
          left: '0in',
        },
        preferCSSPageSize: false,
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating CV PDF:', error);
      throw new ApiError(500, 'Failed to generate CV PDF');
    } finally {
      if (page) {
        await page.close();
      }
      if (closeLogger) closeLogger();
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
