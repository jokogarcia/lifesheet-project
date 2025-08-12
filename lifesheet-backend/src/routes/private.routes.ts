import express from 'express';
import CV, { ICV } from '../models/cv.model';
import Picture from '../models/picture.model';
import fs from 'fs'
import {constants} from '../constants';
import path from 'path';
const router = express.Router();
router.get('/cv-toprint/:id', async (req, res) => {
    const cvid = req.params.id;
    try {
        const cv = await CV.findOne({ _id: cvid, deletedAt: null });
        const pictureId = req.query.pictureId as string;
        if (!cv) {
            res.status(404).json({ message: 'CV not found' });
            return;
        }
        if (pictureId) {
            cv.personal_info.profilePictureUrl = new URL(`private/picture/${pictureId}`, constants.PRIVATE_API_URL).toString();
        }
        const printableCV = {
            "workExperienceTitle": "WORK EXPERIENCE",
            "educationTitle": "EDUCATION",
            "summaryTitle": "PROFESSIONAL SUMMARY",
            "skillsTitle": "TECHNICAL SKILLS",
            "languageSkillsTitle": "LANGUAGE SKILLS",
            name: cv.personal_info.fullName,
            title: cv.personal_info.title,
            //@ts-ignore
            contactInfo: cv.personal_info?.toObject ? cv.personal_info.toObject() : cv.personal_info,
            education: cv.education,
            workExperience: cv.work_experience,
            skills: cv.skills.map(s=>s.name),
            languageSkills: cv.language_skills,
            profilePictureUrl: cv.personal_info.profilePictureUrl,
            summary: cv.personal_info.summary,
        }
        res.json(printableCV);

    } catch (error) {
        console.error('Error generating CV PDF:', error);
        res.status(500).json({ message: 'Failed to generate CV PDF' });
    }
});
router.get('/picture/:id', async (req, res) => {
    const pictureId = req.params.id;
    try {
        const picture = await Picture.findOne({ _id: pictureId, deletedAt: null });
        if (!picture) {
            res.status(404).json({ message: 'Picture not found' });
            return;
        }
        const buffer = await fs.promises.readFile(picture.filepath);
        res.setHeader('Content-Type', picture.contentType);
        res.send(buffer);
    } catch (error) {
        console.error('Error fetching pictures:', error);
        res.status(500).json({ message: 'Failed to fetch picture' });
    }
});
router.use('/cv-printer', express.static(path.join(__dirname, '../cv-printer')));
export default router;