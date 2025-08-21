import express, { Request, Response } from 'express';
import { constants } from '../../../constants';
import { PDFService } from '../../../services/pdf-service';
import { JSDOM } from 'jsdom';
import PictureShare from '../../../models/picture-share.model';
const router = express.Router();
import fs from 'fs';
import Picture from '../../../models/picture.model';
router.post("/generate-pdf", async (req, res) => {
    const { html, imageId } = req.body as { html: string, imageId?: string };
    let fullPage = `<html><head>
    <link rel="stylesheet" href="${constants.API_URL}/private/cv-printer/styles.css">
    </head><body>${html}</body></html>`;
    if (imageId) {
        Picture.findById(imageId).then(picture => {
            if (picture) {
                fullPage = replaceImageSrc(fullPage, 'img.profile-photo', picture.filepath);
            } else {
                throw new Error('Image not found');
            }
        });
    }
    fs.writeFileSync('temp.html', fullPage);
    try {
        const pdfBuffer = await PDFService.htmlToPDF(fullPage);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Failed to generate PDF');
    }
})
//api/utils/picture-link
router.get('/picture-link/:linkId', async (req: Request, res: Response) => {
    try {
        const linkId = req.params['linkId'];
        const pictureShare = await PictureShare.findById(linkId).populate('pictureId');
        if (!pictureShare) {
            res.status(404).send('Picture share link not found');
            return;
        }
        if (pictureShare.expiresAt < new Date()) {
            res.status(410).send('Picture share link expired');
            return;
        }
        const picture = await Picture.findById(pictureShare.pictureId);
        if (!picture) {
            res.status(404).send('Picture not found');
            return;
        }
        const pictureData = await fs.promises.readFile(picture.filepath);
        res.setHeader('Content-Type', picture.contentType);
        res.send(pictureData);
    }
    catch (error) {
        console.error('Error fetching picture:', error);
        res.status(500).send('Failed to fetch picture');
    }
});

function replaceImageSrc(html: string, selector: string, newSrc: string): string {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const img = doc.querySelector(selector) as HTMLImageElement | null;
    if (img) img.setAttribute('src', newSrc);
    return dom.serialize(); // or doc.documentElement.outerHTML
}
export default router;