import {constants } from '../constants';
import { ICV } from '../models/cv.model';

export async function tailorCV(inputCV:ICV,jobDescription:string): Promise<{tailored_cv: ICV, tokens_used:number}> {
    const url = new URL('/tailor', constants.CV_TAILORING_SERVICE).toString();
    const cv=JSON.stringify(inputCV);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cv, job_description: jobDescription }),
    });

    if (!response.ok) {
        console.error('Failed to tailor CV:', await response.text());
        throw new Error('Failed to tailor CV');
    }

   return response.json()
}