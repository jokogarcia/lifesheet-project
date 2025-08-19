
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
function loadCss(path) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = path;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error('Failed to load CSS'));
        document.head.appendChild(link);
    });
}
/**
 * Renders the CV data into the HTML document.
 * @param {CV} cvdata 
 */
export function render(cvdata, printmode = true, template = "two-column-1", styleOverrides={}) {

    if (template.startsWith("two-column")) {
        renderTwoColumns(cvdata, printmode, `${template}.css`, styleOverrides)
            .then(() => console.log("rendered"))
            .catch((error) => {
                console.error("Error rendering CV:", error);
            });
    } else {
        renderSingleColumn(cvdata, printmode, `${template}.css`, styleOverrides)
            .then(() => console.log("rendered"))
            .catch((error) => {
                console.error("Error rendering CV:", error);
            });
    }
}
function computeStyleOverrides(styleOverrides){
    if(styleOverrides){
        if(styleOverrides.primaryColor)
            document.documentElement.style.setProperty('--primary-color', styleOverrides.primaryColor);
        if(styleOverrides.secondaryColor)
            document.documentElement.style.setProperty('--secondary-color', styleOverrides.secondaryColor);
        if(styleOverrides.backgroundColor)
            document.documentElement.style.setProperty('--background-color', styleOverrides.backgroundColor);
        if(styleOverrides.textColor)
            document.documentElement.style.setProperty('--text-color', styleOverrides.textColor);
        if(styleOverrides.textColor2)
            document.documentElement.style.setProperty('--text-color-2', styleOverrides.textColor2);
      
    }
}
async function renderTwoColumns(cvdata, printmode = true, cssfile = "two-column-1.css", styleOverrides = {}) {
    await loadCss(cssfile);

    computeStyleOverrides(styleOverrides);
    const body = document.querySelector('body');
    body.innerHTML = '';
    const container = document.createElement('div');
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
    if (cvdata.profilePictureUrl) leftColumn.appendChild(profilePicture);
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
    workExperienceSection.className = 'section breakable'; // Added breakable class for page breaks
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
    
    skillsSection.innerHTML = `
        <h2>${cvdata.skillsTitle}</h2>
        <ul class="skills-list">
            ${cvdata.skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
    `;
    
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
    
    languageSkillsSection.innerHTML = `
        <h2>${cvdata.languageSkillsTitle}</h2>
        <ul class="language-skills-list">
            ${cvdata.languageSkills.map(lang => `<li>${lang.language} - ${lang.level}</li>`).join('')}
        </ul>
    `;
    
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
    for (let workExpItem of workExperienceSection.children) {
        // page break logic removed
    }
    // Add a filler div to the left column to ensure it fills the page
    const fillerDiv = document.createElement('div');
    fillerDiv.className = 'filler';
    leftColumn.appendChild(fillerDiv);
    const fillerTop = fillerDiv.getBoundingClientRect().top;
    const fillerHeight = paperHeight - (fillerTop % paperHeight) - 40; // 50px for the bottom margin
    fillerDiv.style.height = fillerHeight + 'px';
    

}
export async function renderSingleColumn(cvdata, printmode = true, cssfile = "single-column-1.css") {
    await loadCss(cssfile);
    console.log("Loaded css file", cssfile);
    if(styleOverrides){
        if(styleOverrides.primaryColor)
            document.documentElement.style.setProperty('--primary-color', styleOverrides.primaryColor);
        if(styleOverrides.secondaryColor)
            document.documentElement.style.setProperty('--secondary-color', styleOverrides.secondaryColor);
        if(styleOverrides.backgroundColor)
            document.documentElement.style.setProperty('--background-color', styleOverrides.backgroundColor);
        if(styleOverrides.textColor)
            document.documentElement.style.setProperty('--text-color', styleOverrides.textColor);
        if(styleOverrides.textColor2)
            document.documentElement.style.setProperty('--text-color-2', styleOverrides.textColor2);
      
    }
    const body = document.querySelector('body');
    body.innerHTML = '';
    const container = document.createElement('div');
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


    const skillsSection = document.createElement('div');
    skillsSection.className = 'section';



    const headerSection = document.createElement('div');
    headerSection.className = 'header'
    container.appendChild(headerSection);
    const summarySection = document.createElement('div');
    summarySection.className = 'section';
    container.appendChild(summarySection);

    container.appendChild(skillsSection);
    const workExperienceSection = document.createElement('div');
    workExperienceSection.className = 'section breakable'; // Added breakable class for page breaks
    container.appendChild(workExperienceSection);
    const educationSection = document.createElement('div');
    educationSection.className = 'section';
    container.appendChild(educationSection);
    const languageSkillsSection = document.createElement('div');
    languageSkillsSection.className = 'section';
    container.appendChild(languageSkillsSection);
    headerSection.innerHTML = `
        
        <div class="profile-info">
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

        </div>
        <div class="profile-photo" ${!cvdata.profilePictureUrl ? 'hidden' : ''}>
        ${cvdata.profilePictureUrl ? `<img src="${cvdata.profilePictureUrl}" alt="Profile Picture" class="profile-photo">` : ''}
        </div>
    `;
    const paperHeight = getPaperSizePixels().height;
    summarySection.innerHTML = `
        <h2>${cvdata.summaryTitle}</h2>
        <p>${cvdata.summary}</p>
    `;
   
    skillsSection.innerHTML = `
        <h2>${cvdata.skillsTitle}</h2>
        <ul class="skills-list">
            ${cvdata.skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
    `;
    

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
    
    languageSkillsSection.innerHTML = `
        <h2>${cvdata.languageSkillsTitle}</h2>
        <ul class="language-skills-list">
            ${cvdata.languageSkills.map(lang => `<li>${lang.language} - ${lang.level}</li>`).join('')}
        </ul>
    `;
    

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
        return digits.replace(/(\d{1,4})(\d{1,4})?(\d{1,4})?/, function (_, a, b, c) {
            return [a, b, c].filter(Boolean).join(' ');
        });
    } else {
        return '';
    }
}




const urlParams = new URLSearchParams(window.location.search);
const jsonUrl = urlParams.get('cv') || './cv-2.json'; // Default to cv-2.json if no param
const printMode = urlParams.get('printmode') !== 'false'; // Check for print mode. Print mode sets the background to pure white and no padding or borders
const template = urlParams.get('template') || 'single-column-1'; // Default to single-column-1 if no param
const styleOverrides = {}
styleOverrides.primaryColor = urlParams.get('primary-color') || undefined; // No default
styleOverrides.secondaryColor = urlParams.get('secondary-color') || undefined; // No default
styleOverrides.backgroundColor = urlParams.get('background-color') || undefined; // No default
styleOverrides.textColor = urlParams.get('text-color') || undefined; // No default
styleOverrides.textColor2 = urlParams.get('text-color-2') || undefined; // No default



loadcv(jsonUrl).then(cvdata => {

    console.log("CV data loaded:", cvdata);
    try {
        render(cvdata, printMode, template, styleOverrides);
    } catch (error) {
        console.error('Error rendering CV:', error);
        document.body.innerHTML = '<h1>Error rendering CV</h1>';
    }
}).catch(error => {
    console.error('Error loading CV data:', error);
    document.body.innerHTML = '<h1>Error loading CV data</h1>';
});