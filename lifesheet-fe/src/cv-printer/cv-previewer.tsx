
"use client"
import { useEffect } from "react";
/* eslint-disable react-refresh/only-export-components */
import moduleStyles from "./cv-previewer.module.css"
import type { CV, CVToPDFOptions } from "@/services/cvs-service";
interface CVDataWithTitle extends CV {
    summaryTitle?: string;
    skillsTitle?: string;
    workExperienceTitle?: string;
    educationTitle?: string;
    languageSkillsTitle?: string;
}
interface CVPreviewerProps {
    cvData: CVDataWithTitle
    options: CVToPDFOptions
    printMode: boolean
    onHtmlUpdate?:(html:string) => void
}
export function CVPreviewer({ cvData, options, printMode, onHtmlUpdate }: CVPreviewerProps) {
    useEffect(() => {
        if (onHtmlUpdate) {
            const container = document.querySelector(`.${moduleStyles.container}`);
            const html = container?.outerHTML || "";
            onHtmlUpdate(html);
        }
    }, [cvData, options, printMode, onHtmlUpdate]);

    const template = options.template || "single-column-1";
    const cssVars = getStyleOverrides(options);

    return <div className={moduleStyles.reset}>
        <div  id="rendered-cv-container" className={`${moduleStyles.rootContainer} ${printMode ? moduleStyles.printable : ""}`}
            style={cssVars}>
            {template.startsWith("two-column") && renderTwoColumns({ cvData, options, printMode })}
            {template.startsWith("single-column") && renderOneColumn({ cvData, options, printMode })}
        </div>
    </div>

}

function getStyleOverrides(options: CVToPDFOptions) {
    const cssVars: { [key: string]: string } = {};
    const { primaryColorOverride, secondaryColorOverride, textColorOverride, text2ColorOverride, backgroundColorOverride } = options;
    if (primaryColorOverride) cssVars["--primary-color"] = primaryColorOverride;
    if (secondaryColorOverride) cssVars["--secondary-color"] = secondaryColorOverride;
    if (textColorOverride) cssVars["--text-color"] = textColorOverride;
    if (text2ColorOverride) cssVars["--text2-color"] = text2ColorOverride;
    if (backgroundColorOverride) cssVars["--background-color"] = backgroundColorOverride;

    return cssVars;
}
export function renderTwoColumns({ cvData, options, printMode }: CVPreviewerProps) {

    return (<div
        className={`two-column container ${printMode? 'printable':''} ${moduleStyles.container} ${moduleStyles['two-column']} ${printMode ? moduleStyles.printable : ""}`}>
        <div className={`left-panel ${moduleStyles['left-panel']}`}>
            {cvData.personal_info.profilePictureUrl ?
                <div className={`profile-photo ${moduleStyles['profile-photo']}`}>
                    <img src={cvData.personal_info.profilePictureUrl} alt="Profile" />
                </div>
                : ''}
            <div className={`section ${moduleStyles.section}`}>
                <h2>{cvData.summaryTitle || "Summary"}</h2>
                <p>{cvData.personal_info.summary}</p>
            </div>
            <div className={`section ${moduleStyles.section}`}>
                <h2>{cvData.educationTitle || "Education"}</h2>
                {cvData.education.map((edu) => (
                    <div key={edu.id}>
                        <h3>{edu.degree}</h3>
                        <h4>{edu.institution}</h4>
                        <p>{edu.startDate} - {edu.endDate}<br></br>
                            {edu.location}</p>
                    </div>
                ))}
            </div>
            <div className={`section ${moduleStyles.section}`}>
                <h2>{cvData.languageSkillsTitle || "Language Skills"}</h2>
                <ul>
                    {cvData.language_skills.map(skill => (
                        <li key={skill.id}>{skill.language} - {skill.level}</li>
                    ))}
                </ul>
            </div>
        </div>
        <div className={`right-panel ${moduleStyles['right-panel']}`}>
            <div className={`${moduleStyles.header} header`}>
                <h1>{cvData.personal_info.fullName}</h1>
                <h2>{cvData.personal_info.title}</h2>
                <div className={`${moduleStyles['contact-info']} contact-info`}>
                    {cvData.personal_info.email && <p>Email: <a href={`mailto:${cvData.personal_info.email}`}>{cvData.personal_info.email}</a></p>}
                    {cvData.personal_info.phone && <p>Phone: <a href={`tel:${cvData.personal_info.phone}`}>{cvData.personal_info.phone}</a></p>}
                    {cvData.personal_info.location && <p>Location: <a href={`https://www.google.com/maps/search/?api=1&query=${cvData.personal_info.location}`}>{cvData.personal_info.location}</a></p>}
                    {cvData.personal_info.linkedIn && <p>LinkedIn: <a href={cvData.personal_info.linkedIn}>{cvData.personal_info.linkedIn}</a></p>}
                    {cvData.personal_info.github && <p>GitHub: <a href={cvData.personal_info.github}>{cvData.personal_info.github}</a></p>}
                </div>
            </div>
            <div className={`section ${moduleStyles.section}`}>
                <h2>{cvData.skillsTitle || "Skills"}</h2>
                <ul className={`skills-list ${moduleStyles['skills-list']}`}>
                    {cvData.skills.map(skill => (
                        <li key={skill.id}>{skill.name}</li>
                    ))}
                </ul>
            </div>
            <div className={`section breakable ${moduleStyles.section} ${moduleStyles.breakable}`}>
                <h2>{cvData.workExperienceTitle || "Work Experience"}</h2>
                {cvData.work_experience.map(job => (
                    <div className={`work-experience ${moduleStyles['work-experience']}`} key={job.id}>
                        <h3 className={`we-jobtitle ${moduleStyles['we-jobtitle']}`}>{job.position}</h3>
                        <span className={`we-company ${moduleStyles['we-company']}`}>{job.company}</span>

                        <span className={`we-dates ${moduleStyles['we-dates']}`}>{job.startDate} - {job.endDate}</span>
                        <h5 className={`we-location ${moduleStyles['we-location']}`}>📍 {job.location}</h5>
                        <p>{job.description}</p>
                        {job.achievements && (<ul>{job.achievements.map((a, i) => (
                            <li key={i}>{a}</li>
                        ))}</ul>)}
                    </div>
                ))}
            </div>
        </div>
    </div>)

}
export function renderOneColumn({ cvData, options, printMode }: CVPreviewerProps) {
    
    return (<div
        className={`container one-column ${printMode?'printable':''} ${moduleStyles.container} ${moduleStyles['one-column']} ${printMode ? moduleStyles.printable : ''}`}>
        
        <div className={`${moduleStyles.header} header`}>
            <div className={`${moduleStyles['profile-info']} profile-info`}>
                <h1>{cvData.personal_info.fullName}</h1>
                <h2 className={`job-title ${moduleStyles['job-title']}`}>{cvData.personal_info.title}</h2>
                <div className={`contact-info ${moduleStyles['contact-info']}`}>
                    {cvData.personal_info.email && options.includeEmail && <p>Email: <a href={`mailto:${cvData.personal_info.email}`}>{cvData.personal_info.email}</a></p>}
                    {cvData.personal_info.phone && options.includePhone && <p>Phone: <a href={`tel:${cvData.personal_info.phone}`}>{cvData.personal_info.phone}</a></p>}
                    {cvData.personal_info.location && options.includeAddress && <p>Location: <a href={`https://www.google.com/maps/search/?api=1&query=${cvData.personal_info.location}`}>{cvData.personal_info.location}</a></p>}
                    {cvData.personal_info.linkedIn &&  <p>LinkedIn: <a href={cvData.personal_info.linkedIn}>{cvData.personal_info.linkedIn}</a></p>}
                    {cvData.personal_info.github && <p>GitHub: <a href={cvData.personal_info.github}>{cvData.personal_info.github}</a></p>}
                </div>
            </div>
            {cvData.personal_info.profilePictureUrl &&
                <div className={`profile-photo square ${moduleStyles['profile-photo']} ${moduleStyles['square']}`}>
                    <img className={`profile-photo ${moduleStyles['profile-photo']}`} src={cvData.personal_info.profilePictureUrl} alt="Profile" />
                </div>}
        </div>
        <div className={`section ${moduleStyles.section}`}>
            <h2>{cvData.summaryTitle || "Summary"}</h2>
            <p>{cvData.personal_info.summary}</p>
        </div>


        <div className={`section ${moduleStyles.section}`}>
            <h2>{cvData.skillsTitle || "Skills"}</h2>
            <ul className={`${moduleStyles['skills-list']} skills-list`}>
                {cvData.skills.map(skill => (
                    <li key={skill.id}>{skill.name}</li>
                ))}
            </ul>
        </div>
        <div className={`section breakable ${moduleStyles.section} ${moduleStyles.breakable}`}>
            <h2>{cvData.workExperienceTitle || "Work Experience"}</h2>
            {cvData.work_experience.map(job => (
                <div className={`work-experience ${moduleStyles['work-experience']}`} key={job.id}>
                    <h3 className={`we-jobtitle ${moduleStyles['we-jobtitle']}`}>{job.position}</h3>
                    <span className={`we-company ${moduleStyles['we-company']}`}>{job.company}</span>

                    <span className={`we-dates ${moduleStyles['we-dates']}`}>{job.startDate} - {job.endDate}</span>
                    <h5 className={`we-location ${moduleStyles['we-location']}`}>📍 {job.location}</h5>
                    <p>{job.description}</p>
                    {job.achievements && (<ul>{job.achievements.map((a, i) => (
                        <li key={i}>{a}</li>
                    ))}</ul>)}
                </div>
            ))}
        </div>
        <div className={`section ${moduleStyles.section}`}>
            <h2>{cvData.educationTitle || "Education"}</h2>
            {cvData.education.map((edu) => (
                <div key={edu.id}>
                    <h3>{edu.degree}</h3>
                    <h4>{edu.institution}</h4>
                    <p>{edu.startDate} - {edu.endDate}<br></br>
                        {edu.location}</p>
                </div>
            ))}
        </div>
        <div className={`section ${moduleStyles.section}`}>
            <h2>{cvData.languageSkillsTitle || "Language Skills"}</h2>
            <ul>
                {cvData.language_skills.map(skill => (
                    <li key={skill.id}>{skill.language} - {skill.level}</li>
                ))}
            </ul>
        </div>

    </div>)

}