import { ICV } from "../models/cv.model";
import { JSDOM } from 'jsdom';

interface PaperSize {
    width: number;
    height: number;
}
    



/**
 * Renders the CV data into an HTML document.
 * @param cvdata - The CV data to render
 * @param printmode - Whether to render in print mode
 * @return The serialized HTML string of the rendered CV
 */
export function renderAsHtml(cvdata: ICV, printmode: boolean = true, paperSize: PaperSize = { width: 210, height: 297 }): string {
    const dom = new JSDOM(`<!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <style>body{font-family:'Roboto', sans-serif;line-height:1.2;margin:0;padding:20px;background-color:#eee;display:flex;justify-content:center;align-items:center;min-height:100vh}body.printable{background-color:#fff;padding:0}.container{display:flex;width:900px;background-color:#fff;box-shadow:0 0 10px rgba(0, 0, 0, 0.1);border-radius:8px;overflow:hidden}.container.printable{width:100%;height:100%;box-shadow:none;border-radius:0;margin:0;padding:0}.left-panel{width:35%;background-color:#f0f8ff;padding:30px 10px;color:#333;display:flex;flex-direction:column;align-items:center}.profile-photo{width:150px;height:150px;border-radius:50%;overflow:hidden;margin-bottom:25px;border:3px solid #add8e6}.profile-photo img{width:100%;height:100%;object-fit:cover}.right-panel{width:65%;padding:30px;color:#333}.header{margin-bottom:30px;border-bottom:1px solid #eee;padding-bottom:20px}.header h1{font-size:2.2em;margin-bottom:5px;color:#0056b3;text-transform:uppercase}.header .job-title{font-size:1.2em;color:#555;margin-bottom:15px;font-weight:500}.header p{margin:3px 0;font-size:0.85em;color:#666}.section{margin-bottom:25px;width:100%}.section div.skill{margin-right:1em;margin-top:1px;float:left;background-color:#0056b3;color:#fff;border-radius:12px;padding:0 5px}.section h2{font-size:1.3em;color:#0056b3;border-bottom:2px solid #add8e6;margin-bottom:10px;text-transform:uppercase}.left-panel .section h2{border-bottom:2px solid #9acd32}.section h3{font-size:1.1em;margin-bottom:5px;color:#444}.section p{font-size:0.85em;margin-bottom:3px}a{color:black;text-decoration:none}.section ol,.section ul{list-style-type:none;padding:0;margin:0}ul.skills-list{display:flex;flex-wrap:wrap}.section ul li{margin-bottom:5px;position:relative;padding-left:20px;font-size:0.85em}.section ul li::before{content:'•';color:#0056b3;position:absolute;left:0}.section ol li{margin-bottom:5px;font-size:0.85em}.section h4{margin-top:3px;margin-bottom:3px}.skills-grid{display:flex;gap:30px}.skills-grid ul{flex:1}.left-panel .section p{font-size:0.85em}.left-panel .section h3{color:#0056b3;font-weight:500}ul.skills-list{list-style-type:none;padding:0;margin:0}ul.skills-list li{margin-bottom:5px;font-size:0.75em;float:left;margin-right:5px;padding:0 5px;background-color:#0056b3;color:#fff;border-radius:12px;list-style:none}section{width:100%}.we-jobtitle{margin:0}.we-company{margin-top:5px;font-weight:bold;font-style:italic}.we-dates{float:right}.we-location{margin:0.5em 0;font-weight:normal}div.work-experience{padding-bottom:10px;border-bottom:1px solid #eee;margin-bottom:10px;h3{margin:0;font-size:1em;color:#0056b3}}
            </style>
        </head>
        <body></body>
        </html>`);
    const paperSize_mm: PaperSize = paperSize;

    function getPaperSizePixels(): PaperSize {
        const dpi: number = 96; // Assuming a screen DPI of 96
        return {
            width: paperSize_mm.width * dpi / 25.4, // Convert mm to pixels
            height: paperSize_mm.height * dpi / 25.4 // Convert mm to pixels
        };
    }
    const document = dom.window.document;
    const body: HTMLElement = document.querySelector('body')!;
    body.innerHTML = '';
    const container: HTMLDivElement = document.createElement('div');
    container.className = 'container';

    if (printmode) {
        container.classList.add('printable');
        body.classList.add('printable');
    } else {
        container.classList.remove('printable');
        body.classList.remove('printable');
    }
    container.style.width = getPaperSizePixels().width + 'px';
    body.appendChild(container);

    const leftColumn: HTMLDivElement = document.createElement('div');
    leftColumn.className = 'left-panel';
    const rightColumn: HTMLDivElement = document.createElement('div');
    rightColumn.className = 'right-panel';
    container.appendChild(leftColumn);
    container.appendChild(rightColumn);

    if (!!cvdata.personal_info.profilePictureUrl) {
        const profilePicture: HTMLImageElement = document.createElement('img');
        profilePicture.src = cvdata.personal_info.profilePictureUrl;
        profilePicture.alt = 'Profile Picture';
        profilePicture.className = 'profile-photo';
        leftColumn.appendChild(profilePicture);
    }
    const summarySection: HTMLDivElement = document.createElement('div');
    summarySection.className = 'section';
    leftColumn.appendChild(summarySection);

    const skillsSection: HTMLDivElement = document.createElement('div');
    skillsSection.className = 'section';

    const educationSection: HTMLDivElement = document.createElement('div');
    educationSection.className = 'section';
    leftColumn.appendChild(educationSection);

    const languageSkillsSection: HTMLDivElement = document.createElement('div');
    languageSkillsSection.className = 'section';
    leftColumn.appendChild(languageSkillsSection);

    const headerSection: HTMLDivElement = document.createElement('div');
    headerSection.className = 'header';
    rightColumn.appendChild(headerSection);
    rightColumn.appendChild(skillsSection);

    const workExperienceSection: HTMLDivElement = document.createElement('div');
    workExperienceSection.className = 'section';
    rightColumn.appendChild(workExperienceSection);

    headerSection.innerHTML = `
        <h1>${cvdata.personal_info.fullName}</h1>
        <h2 class="job-title">${cvdata.personal_info.title || ''}</h2>
        <div class="contact-info">
            ${cvdata.personal_info.email ? `<p><li class="fa fa-envelope"></li>: <a href='mailto:${cvdata.personal_info.email}'>${cvdata.personal_info.email}</a></p>` : ''}
            ${cvdata.personal_info.phone ? `<p><li class="fa fa-phone"></li>: <a href='tel:${cvdata.personal_info.phone}'>${phoneNumberFormatter(cvdata.personal_info.phone)}</a></p>` : ''}
            ${cvdata.personal_info.location ? `<p><li class="fa fa-map-marker"></li>: <span style='color:black'>${cvdata.personal_info.location}</span></p>` : ''}
            ${cvdata.personal_info.linkedIn ? `<p><li class="fa fa-linkedin"></li>: <a href="https://${cvdata.personal_info.linkedIn}">${cvdata.personal_info.linkedIn}</a></p>` : ''}
            ${cvdata.personal_info.github ? `<p><li class="fa fa-github"></li>: <a href="https://${cvdata.personal_info.github}">${cvdata.personal_info.github}</a></p>` : ''}
            ${cvdata.personal_info.website ? `<p><li class="fa fa-globe"></li>: <a href="https://${cvdata.personal_info.website}">${cvdata.personal_info.website}</a></p>` : ''}
        </div>
    `;

    const paperHeight: number = getPaperSizePixels().height;
    summarySection.innerHTML = `
        <h2>Summary</h2>
        <p>${cvdata.personal_info.summary || ''}</p>
    `;
    if (overflowsPage(summarySection, paperHeight)) {
        addPageBreak(summarySection, paperHeight);
    }

    skillsSection.innerHTML = `
        <h2>Skills</h2>
        <ul class="skills-list">
            ${cvdata.skills.map(skill => `<li>${skill.name}</li>`).join('')}
        </ul>
    `;
    if (overflowsPage(skillsSection, paperHeight)) {
        addPageBreak(skillsSection, paperHeight);
    }

    educationSection.innerHTML = `
        <h2>Education</h2>
        
            ${cvdata.education.map(edu => `
                <div>
                    <h3>${edu.degree}</h3>
                    <h4>${edu.institution}</h4>
                    <p>(${edu.startDate} - ${edu.endDate})<br>
                    <span>${edu.location}</span></p>
                    <p>${edu.field}</p>
                </div>
            `).join('')}
        
    `;
    if (overflowsPage(educationSection, paperHeight)) {
        addPageBreak(educationSection, paperHeight);
    }

    languageSkillsSection.innerHTML = `
        <h2>Language Skills</h2>
        <ul class="language-skills-list">
            ${cvdata.language_skills?.map(lang => `<li>${lang.language} - ${lang.level}</li>`).join('')}
        </ul>
    `;
    if (overflowsPage(languageSkillsSection, paperHeight)) {
        addPageBreak(languageSkillsSection, paperHeight);
    }

    workExperienceSection.innerHTML = `
        <h2>Work Experience</h2>

            ${cvdata.work_experience.map(exp => `
                <div class="work-experience">
                    <h3 class ="we-jobtitle">${exp.position}</h3>
                    <span class ="we-company">${exp.company}</span>
                    <span class="we-dates">(${exp.startDate} - ${exp.endDate})</span>
                    <h5 class="we-location"><li class="fa fa-map-marker"></li>${exp.location}</h5>
                    <p>${exp.description}
                    ${exp.achievements ? `<ul>${exp.achievements.map(ach => `<li>${ach}</li>`).join('\n')}</ul>` : ''}
                    </p>
                </div>
            `).join('')}
        
    `;

    for (let workExpItem of workExperienceSection.children as HTMLCollectionOf<HTMLElement>) {
        if (overflowsPage(workExpItem, paperHeight)) {
            addPageBreak(workExpItem, paperHeight);
        }
    }

    // Add a filler div to the left column to ensure it fills the page
    const fillerDiv: HTMLDivElement = document.createElement('div');
    fillerDiv.className = 'filler';
    leftColumn.appendChild(fillerDiv);
    const fillerTop: number = fillerDiv.getBoundingClientRect().top;
    const fillerHeight: number = paperHeight - (fillerTop % paperHeight) - 40; // 50px for the bottom margin
    fillerDiv.style.height = fillerHeight + 'px';

    return dom.serialize();
}

/**
 * Checks if an element overflows a page based on its height.
 * @param element - The element to check.
 * @param pageHeight - The height of the page in pixels.
 * @returns True if the element overflows the page, false otherwise.
 */
function overflowsPage(element: HTMLElement, pageHeight: number): boolean {
    const rect: DOMRect = element.getBoundingClientRect();
    const pageTop: number = Math.ceil(rect.top / pageHeight);
    const pageBottom: number = Math.ceil((rect.top + rect.height) / pageHeight);
    return pageTop != pageBottom;
}

/**
 * Adds the padding on top of an element to ensure it starts on a new page.
 * @param element - The element to add page break before
 * @param pageHeight - The height of the page in pixels
 */
function addPageBreak(element: HTMLElement, pageHeight: number): void {
    if (element.previousElementSibling && element.previousElementSibling.classList.contains('page-break')) {
        return;
    }
    const elementTop: number = element.getBoundingClientRect().top;
    const rest: number = pageHeight - (elementTop % pageHeight);
    const pageBreak: HTMLDivElement = document.createElement('div');
    pageBreak.className = 'page-break';
    pageBreak.style.height = rest + 'px';
    pageBreak.style.backgroundColor = 'transparent';
    element.style.paddingTop = 50 + 'px'; // Adjust the margin of the element
    element.style.marginTop = 0 + 'px'; // Adjust the margin of the element
    element.parentNode!.insertBefore(pageBreak, element);
}

function phoneNumberFormatter(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits: string = phoneNumber.replace(/\D/g, '');

    // International format (e.g., +49 for Germany, +1 for US)
    if (digits.startsWith('49') && digits.length > 10) {
        // German number: +49 1573 906833
        return '+49 ' + digits.slice(2, 6) + ' ' + digits.slice(6);
    } else if (digits.startsWith('1') && digits.length === 11) {
        // US number: +1 (555) 123-4567
        return '+1 (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7);
    } else if (digits.length === 10) {
        // Local number: (555) 123-4567
        return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
    } else if (digits.length > 0) {
        // Fallback: group by 3s and 4s
        return digits.replace(/(\d{1,4})(\d{1,4})?(\d{1,4})?/, function (_, a, b, c) {
            return [a, b, c].filter(Boolean).join(' ');
        });
    } else {
        return '';
    }
}
