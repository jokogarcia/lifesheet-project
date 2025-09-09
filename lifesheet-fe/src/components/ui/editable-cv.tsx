import type { CV } from "@/services/cvs-service";
import { useState, useEffect } from "react";

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CardContent, CardHeader, Card } from './card';
import { Button } from "./button";
import { ChevronDown } from "lucide-react";

interface EditableSectionCardProps {
    title: string;
    children: React.ReactNode;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onIncludeChange: (state: boolean) => void;
    onEdit: () => void;
    menuOptions?: { name: string, action: () => void }[];
}

function EditableSectionCard({ title, children, onMoveUp, onMoveDown, onEdit, menuOptions, onIncludeChange }: EditableSectionCardProps) {
    const [hidden, setIsHidden] = useState(true);
    const [include, setOnInclude] = useState(true);
    return <Card className="border rounded-lg p-2 group hover:shadow-lg transition-shadow duration-300">
        <CardHeader className='p-6 pb-0'>
            <div className="flex flex-row-reverse justify-between items-center mb-2">
                <div className="flex space-x-1">
                    <Button variant="outline" size="icon" onClick={onMoveUp} title="Move Up">↑</Button>
                    <Button variant="outline" size="icon" onClick={onMoveDown} title="Move Down">↓</Button>
                    <Button variant="outline" size="icon" onClick={onEdit} title="Edit">✎</Button>
                    <Button variant="outline" size="icon" onClick={() => { setIsHidden(prev => !prev) }} title="Show/Hide"><ChevronDown style={{ rotate: hidden ? "0deg" : "180deg" }} /></Button>
                    {menuOptions && menuOptions.length > 0 && (
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <Button variant="outline" size="icon" title="More options">⋮</Button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content className="bg-white rounded-md shadow-lg p-2 min-w-[150px]" sideOffset={5}>
                                    {menuOptions.map((option, index) => (
                                        <DropdownMenu.Item
                                            key={index}
                                            onClick={option.action}
                                            className="text-sm px-2 py-1.5 outline-none cursor-pointer rounded hover:bg-slate-100 focus:bg-slate-100"
                                        >
                                            {option.name}
                                        </DropdownMenu.Item>
                                    ))}
                                    <DropdownMenu.Arrow className="fill-white" />
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    )}
                </div>
                <div className="flex space-x-2 align-middle"><input type="checkbox" checked={include} onChange={() => setOnInclude(prev => {
                    onIncludeChange(!prev);
                    return !prev;
                })} />
                    <h3 className="font-semibold">{title}</h3></div>
            </div>
        </CardHeader>
        <CardContent>{!hidden && children}</CardContent>
    </Card>;
}
export function EditableCV({ cv, reRender }: { cv: CV, reRender: () => void }) {
    const [sections, setSections] = useState<string[]>(cv.tailored?.sectionOrder || []);
    useEffect(() => {
        if (cv.tailored?.sectionOrder) {
            setSections(cv.tailored.sectionOrder);
        }
    }, [cv.tailored?.sectionOrder]);
    useEffect(() => {
        if (cv.tailored) {
            cv.tailored.sectionOrder = sections;
            reRender();
        }
    }, [sections, cv.tailored]);
    const moveSectionUp = (section: string) => {
        if (!sections) return;
        const index = sections.indexOf(section);
        if (index > 0) {
            setSections(prev => {
                const newOrder = [...prev];
                [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                return newOrder;
            });
        }
    }
    const moveSectionDown = (section: string) => {
        if (!sections) return;
        const index = sections.indexOf(section);
        if (index < sections.length - 1) {
            setSections(prev => {
                const newOrder = [...prev];
                [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
                return newOrder;
            });
        }
    }
    const onHideSection = (_section: string, state: boolean) => {
        console.log("Hiding section:", _section, "State:", state);
        if (!cv.tailored) return;
        if (!cv.tailored.hiddenSections) {
            cv.tailored.hiddenSections = new Set<string>();
        }
        if (state) {
            cv.tailored.hiddenSections.delete(_section);
        } else {
            cv.tailored.hiddenSections.add(_section);
        }
        // Force re-render
        reRender();
    }

    const editSection = (_section: string) => {
        // Implementation will be added later
    }
    if (!cv) {
        return <></>
    }
    return <div className="space-y-4 text-left text-sm">
        {sections.length === 0 && <p className="text-muted-foreground">No sections to display. Add sections from the toolbar above.</p>}
        {sections.map((section) => {
            console.log('Rendering section:', section);
            switch (section) {
                case 'cover-letter':
                    if (cv.tailored?.coverLetter) {
                        return (
                            <EditableSectionCard title="Cover Letter" onMoveUp={() => { moveSectionUp('cover-letter') }} onMoveDown={() => { moveSectionDown('cover-letter') }} onIncludeChange={s => { onHideSection('cover-letter', s) }} onEdit={() => { editSection('cover-letter') }}>
                                <div> {cv.tailored.coverLetter}</div>
                            </EditableSectionCard>
                        );
                    }
                    break;
                case 'personalInfo':
                    return (
                        <EditableSectionCard title="Personal Info" onMoveUp={() => { moveSectionUp('personalInfo') }} onMoveDown={() => { moveSectionDown('personalInfo') }} onIncludeChange={s => { onHideSection('personalInfo', s) }} onEdit={() => { editSection('personalInfo') }}>
                            <ul className="flex flex-wrap gap-2 list-disc list-inside">
                                <li><strong>Full name: </strong><span>{cv.personal_info.fullName}</span></li>
                                <li><strong>Title: </strong><span>{cv.personal_info.title}</span></li>
                                <li><strong>Email: </strong><span>{cv.personal_info.email}</span></li>
                                <li><strong>Phone: </strong><span>{cv.personal_info.phone}</span></li>
                                <li><strong>Location: </strong><span>{cv.personal_info.location}</span></li>
                                <li><strong>LinkedIn: </strong><span>{cv.personal_info.linkedIn}</span></li>
                                <li><strong>Website: </strong><span>{cv.personal_info.website}</span></li>
                                <li><strong>GitHub: </strong><span>{cv.personal_info.github}</span></li>
                            </ul>
                        </EditableSectionCard>
                    );
                case 'summary':
                    return (
                        <EditableSectionCard title="Summary" onMoveUp={() => { moveSectionUp('summary') }} onMoveDown={() => { moveSectionDown('summary') }} onIncludeChange={s => { onHideSection('summary', s) }} onEdit={() => { editSection('summary') }}>
                            <div>{cv.personal_info.summary}</div>
                        </EditableSectionCard>
                    );
                case 'skills':
                    return (<EditableSectionCard title="Skills" onMoveUp={() => { moveSectionUp('skills') }} onMoveDown={() => { moveSectionDown('skills') }} onIncludeChange={s => { onHideSection('skills', s) }} onEdit={() => { editSection('skills') }}>
                        <ul className="list-disc list-inside flex flex-wrap gap-2">
                            {cv.skills.map(skill => (
                                <li key={skill.id}>{skill.name}</li>
                            ))}
                        </ul>
                    </EditableSectionCard>);
                case 'workExperience':
                    return (<EditableSectionCard title="Work Experience"
                        onMoveUp={() => { moveSectionUp('workExperience') }}
                        onMoveDown={() => { moveSectionDown('workExperience') }}
                        onIncludeChange={s => { onHideSection('workExperience', s) }}
                        onEdit={() => { editSection('workExperience') }}
                        menuOptions={[{ name: 'Newest first', action: () => { } }, { name: 'Oldest first', action: () => { } }]}
                    >
                        {cv.work_experience.map(work => (
                            <div key={work.id} className="mb-2">
                                <h4 className="font-semibold">{work.position} at {work.company}</h4>
                                <p className="text-sm text-muted-foreground">{work.startDate} - {work.current ? 'Present' : work.endDate}</p>
                                <p>{work.description}</p>
                                {work.achievements && work.achievements.length > 0 && (
                                    <ul className="list-disc list-inside">
                                        {work.achievements.map((ach, idx) => (
                                            <li key={idx}>{ach}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </EditableSectionCard>);
                case 'education':
                    return (<EditableSectionCard title="Education" onMoveUp={() => { moveSectionUp('education') }} onMoveDown={() => { moveSectionDown('education') }} onIncludeChange={s => { onHideSection('education', s) }} onEdit={() => { editSection('education') }}>
                        {cv.education.map(edu => (
                            <div key={edu.id} className="mb-2">
                                <h4 className="font-semibold">{edu.degree} in {edu.field}</h4>
                                <p className="text-sm text-muted-foreground">{edu.institution} | {edu.startDate} - {edu.endDate}</p>
                                <p>GPA: {edu.gpa}</p>
                            </div>
                        ))}
                    </EditableSectionCard>);
                case 'languages':
                    return (<EditableSectionCard title="Languages" onMoveUp={() => { moveSectionUp('languages') }} onMoveDown={() => { moveSectionDown('languages') }} onIncludeChange={s => { onHideSection('languages', s) }} onEdit={() => { editSection('languages') }}>
                        <ul className="list-disc list-inside flex flex-wrap gap-2">{cv.language_skills.map(lang => (
                            <li key={lang.id} className="font-semibold">{lang.language} <span className='font-normal'>{lang.level}</span></li>
                        ))}
                        </ul>
                    </EditableSectionCard>);
            }
        })}
    </div>;
}