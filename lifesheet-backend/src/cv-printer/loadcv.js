
/**
 * @typedef {Object} CV
 * @property {string} name
 * @property {string} title
 * @property {string} workExperienceTitle
 * @property {string} educationTitle
 * @property {string} summaryTitle
 * @property {string} skillsTitle
 * @property {string} languageSkillsTitle
 * @property {string} summary
 * @property {string} profilePictureUrl
 * @property {Object} contactInfo
 * @property {string} contactInfo.email
 * @property {string} contactInfo.phone
 * @property {string} contactInfo.address
 * @property {string} contactInfo.dateOfBirth
 * @property {string} contactInfo.linkedin
 * @property {string} contactInfo.github
 * @property {string} contactInfo.website
 * @property {Array<Education>} education
 * @property {Array<WorkExperience>} workExperience
 * @property {Array<string>} skills
 * @property {Array<LanguageSkill>} languageSkills
 */

/**
 * @typedef {Object} Education
 * @property {string} institution
 * @property {string} degree
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} description
 * @property {string} location
 */

/**
 * @typedef {Object} WorkExperience
 * @property {string} company
 * @property {string} position
 * @property {string} startDate
 * @property {string} endDate
 * @property {Array<string>} [achievements]
 * @property {string} description
 */

/**
 * @typedef {Object} LanguageSkill
 * @property {string} language
 * @property {string} level
 */
const paperSize_mm = { width: 210, height: 297 }; // A4 size in mm
function getPaperSizePixels() {
    const dpi = 96; // Assuming a screen DPI of 96
    return {
        width: paperSize_mm.width * dpi / 25.4, // Convert mm to pixels
        height: paperSize_mm.height * dpi / 25.4 // Convert mm to pixels
    };
}
/**
 * Loads the CV data from a JSON file.
 * @param {string} [url='cv-1.json'] - The URL of the CV JSON file.
 * @returns {Promise<CV>} A promise that resolves to the CV data.
 */
export async function loadcv(url) {
    const cvresponse = await fetch(url);
    if (!cvresponse.ok) {
        throw new Error('Network response was not ok: ' + cvresponse.statusText);
    }
    const cvdata = await cvresponse.json();
    return cvdata;
}
/**
 * Renders the CV data into the HTML document.
 * @param {CV} cvdata 
 */
export function render(cvdata, printmode = true){
    const body = document.querySelector('body');
    body.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'container';
    
    if(printmode){
        container.classList.add('printable');
        body.classList.add('printable');
    }else{
        container.classList.remove('printable');
        body.classList.remove('printable');
        
    }
    container.style.width = getPaperSizePixels().width + 'px';
    body.appendChild(container);
    const leftColumn = document.createElement('div');
    leftColumn.className = 'left-panel';
    const rightColumn = document.createElement('div');
    rightColumn.className = 'right-panel';
    container.appendChild(leftColumn);
    container.appendChild(rightColumn);
    const profilePicture = document.createElement('img');
    profilePicture.src = cvdata.profilePictureUrl;
    profilePicture.alt = 'Profile Picture';
    profilePicture.className = 'profile-photo';
    if(cvdata.profilePictureUrl) leftColumn.appendChild(profilePicture);
    const summarySection = document.createElement('div');
    summarySection.className = 'section';
    leftColumn.appendChild(summarySection);
    const skillsSection = document.createElement('div');
    skillsSection.className = 'section';
    
    const educationSection = document.createElement('div');
    educationSection.className = 'section';
    leftColumn.appendChild(educationSection);
    const languageSkillsSection = document.createElement('div');
    languageSkillsSection.className = 'section';
    leftColumn.appendChild(languageSkillsSection);

    const headerSection = document.createElement('div');
    headerSection.className = 'header';
    rightColumn.appendChild(headerSection);
    rightColumn.appendChild(skillsSection);
    const workExperienceSection = document.createElement('div');
    workExperienceSection.className = 'section';
    rightColumn.appendChild(workExperienceSection);

    headerSection.innerHTML = `
        <h1>${cvdata.name}</h1>
        <h2 class="job-title">${cvdata.title}</h2>
        <div class="contact-info">
            ${cvdata.contactInfo.email ? `<p>Email: <a href='mailto:${cvdata.contactInfo.email}'>${cvdata.contactInfo.email}</a></p>` : ''}
            ${cvdata.contactInfo.phone ? `<p>Cellphone: <a href='tel:${cvdata.contactInfo.phone}'>${phoneNumberFormatter(cvdata.contactInfo.phone)}</a></p>` : ''}
            ${cvdata.contactInfo.address ? `<p>Address: <span style='color:black'>${cvdata.contactInfo.address}</span></p>` : ''}
            ${cvdata.contactInfo.linkedin ? `<p>LinkedIn: <a href="https://${cvdata.contactInfo.linkedin}">${cvdata.contactInfo.linkedin}</a></p>` : ''}
            ${cvdata.contactInfo.github ? `<p>GitHub: <a href="https://${cvdata.contactInfo.github}">${cvdata.contactInfo.github}</a></p>` : ''}
            ${cvdata.contactInfo.website ? `<p>Website: <a href="https://${cvdata.contactInfo.website}">${cvdata.contactInfo.website}</a></p>` : ''}
        </div>
    `;
    const paperHeight = getPaperSizePixels().height;
    summarySection.innerHTML = `
        <h2>${cvdata.summaryTitle}</h2>
        <p>${cvdata.summary}</p>
    `;
    if(overflowsPage(summarySection, paperHeight)){
        addPageBreak(summarySection, paperHeight);
    }
    skillsSection.innerHTML = `
        <h2>${cvdata.skillsTitle}</h2>
        <ul class="skills-list">
            ${cvdata.skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
    `;
    if(overflowsPage(skillsSection, paperHeight)){
        addPageBreak(skillsSection, paperHeight);
    }
    educationSection.innerHTML = `
        <h2>${cvdata.educationTitle}</h2>
        
            ${cvdata.education.map(edu => `
                <div>
                    <h3>${edu.degree}</h3>
                    <h4>${edu.institution}</h4>
                    <p>(${edu.startDate} - ${edu.endDate})<br>
                    <span>${edu.location}</span></p>
                    ${edu.description ? `<p>${edu.description}</p>` : ''}
                </div>
            `).join('')}
        
    `;
    if(overflowsPage(educationSection, paperHeight)){
        addPageBreak(educationSection, paperHeight);
    }
    languageSkillsSection.innerHTML = `
        <h2>${cvdata.languageSkillsTitle}</h2>
        <ul class="language-skills-list">
            ${cvdata.languageSkills.map(lang => `<li>${lang.language} - ${lang.level}</li>`).join('')}
        </ul>
    `;
    if(overflowsPage(languageSkillsSection, paperHeight)){
        addPageBreak(languageSkillsSection, paperHeight);
    }
    workExperienceSection.innerHTML = `
        <h2>${cvdata.workExperienceTitle}</h2>

            ${cvdata.workExperience.map(exp => `
                <div class="work-experience">
                    <h3 class ="we-jobtitle">${exp.position}</h3>
                    <span class ="we-company">${exp.company}</span>
                    <span class="we-dates">(${exp.startDate} - ${exp.endDate})</span>
                    <h5 class="we-location">📍 ${exp.location}</h5>
                    <p>${exp.description}
                    ${exp.achievements ? `<ul>${exp.achievements.map(ach => `<li>${ach}</li>`).join('\n')}</ul>` : ''}
                    </p>
                </div>
            `).join('')}
        
    `;
    for (let workExpItem of workExperienceSection.children){
        if (overflowsPage(workExpItem, paperHeight)){
            addPageBreak(workExpItem, paperHeight);
        }
    }
    // Add a filler div to the left column to ensure it fills the page
    const fillerDiv = document.createElement('div');
    fillerDiv.className = 'filler';
    leftColumn.appendChild(fillerDiv);
    const fillerTop = fillerDiv.getBoundingClientRect().top;
    const fillerHeight = paperHeight - (fillerTop % paperHeight) - 40; // 50px for the bottom margin
    fillerDiv.style.height = fillerHeight + 'px';


}


/**
 * Checks if an element overflows a page based on its height.
 * @param {HTMLElement} element - The element to check.
 * @param {number} pageHeight - The height of the page in pixels.
 * @returns {boolean} True if the element overflows the page, false otherwise.
 */
function overflowsPage(element, pageHeight) {
    const rect = element.getBoundingClientRect();
    const pageTop = Math.ceil(rect.top / pageHeight) ;
    const pageBottom = Math.ceil((rect.top+ rect.height) / pageHeight);
    return pageTop != pageBottom
}

/**
 * Adds the padding on top of an element to ensure it starts on a new page.
 * @param {HTMLElement} element 
 * @param {number} pageHeight 
 */
function addPageBreak(element, pageHeight) {
    if (element.previousElementSibling && element.previousElementSibling.classList.contains('page-break')) {
        return;
    }
    const elementTop = element.getBoundingClientRect().top;
    const rest =  pageHeight - (elementTop % pageHeight);
    const pageBreak = document.createElement('div');
    pageBreak.className = 'page-break';
    pageBreak.style.height = rest + 'px';
    pageBreak.style.backgroundColor = 'transparent';
    element.style.paddingTop = 50 + 'px'; // Adjust the margin of the element
    element.style.marginTop = 0 + 'px'; // Adjust the margin of the element
    element.parentNode.insertBefore(pageBreak, element);
}
function phoneNumberFormatter(phoneNumber) {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

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
        return digits.replace(/(\d{1,4})(\d{1,4})?(\d{1,4})?/, function(_, a, b, c) {
            return [a, b, c].filter(Boolean).join(' ');
        });
    } else {
        return '';
    }
}


