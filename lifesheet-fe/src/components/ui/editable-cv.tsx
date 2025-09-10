import type { CV } from "@/services/cvs-service";
import { useState, useEffect } from "react";

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CardContent, CardHeader, Card } from './card';
import { Button } from "./button";
import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, ChevronDown, Pencil } from "lucide-react";
import PictureSelector from "../export/picture-selector";
import userService from "@/services/user-service";
import { useNavigate } from "react-router-dom";

interface EditableSectionCardProps {
    title: string;
    children: React.ReactNode;
    toolBarOptions: { name: string, icon: React.ReactNode, action: () => void }[];
    menuOptions?: { name: string, action: () => void }[];
    onIncludeChange: (state: boolean) => void;
    disableInclude?: boolean;

}
function standardize_color(str: string | undefined) {
    if (!str) return undefined;
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return str;
    ctx.fillStyle = str;
    return ctx.fillStyle;
}

function EditableSectionCard({ title, children, toolBarOptions, menuOptions, onIncludeChange, disableInclude }: EditableSectionCardProps) {
    const [hidden, setIsHidden] = useState(true);
    const [include, setOnInclude] = useState(true);
    return <Card className="border rounded-lg p-2 group hover:shadow-lg transition-shadow duration-300">
        <CardHeader className='p-6 pb-0'>
            <div className="flex flex-row-reverse justify-between items-center mb-2">
                <div className="flex space-x-1">
                    {toolBarOptions.map(option => (

                        option.name && <Button key={option.name} variant="outline" size="icon" onClick={option.action} title={option.name}>
                            {option.icon}
                        </Button>
                    ))}
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
                <div className="flex space-x-2 align-middle"><input type="checkbox" checked={include} disabled={disableInclude} onChange={() => setOnInclude(prev => {
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
    const navigate = useNavigate();
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
    function toggleLeftColumn(section: string) {
        if (!cv.tailored) return;
        if (!cv.tailored.leftColumnSections) {
            cv.tailored.leftColumnSections = new Set<string>();
        }
        if (cv.tailored.leftColumnSections.has(section)) {
            cv.tailored.leftColumnSections.delete(section);
        } else {
            cv.tailored.leftColumnSections.add(section);
        }
        reRender();
    }
    function isInLeftColumn(section: string): boolean {
        if (!cv.tailored || !cv.tailored.leftColumnSections) return false;
        return cv.tailored.leftColumnSections.has(section);
    }
    function moveCoverLetter(to: 'top' | 'bottom') {
        const toTop = to === 'top';
        if (!cv.tailored) return;
        cv.tailored.coverLetterOnTop = toTop;
        const s = [...sections];
        const clIndex = s.indexOf('cover-letter');
        if (clIndex === -1) return;
        s.splice(clIndex, 1);
        if (toTop) {
            s.unshift('cover-letter');
        } else {
            s.push('cover-letter');
        }
        setSections([...s]);
    }
    async function handlePictureSelected(pictureId: string | undefined): Promise<void> {
        //setPdfOptions({ pictureId, ...pdfOptions });

        if (cv) {
            const shareUrl = pictureId ? await userService.getPictureShareLink(pictureId) : '';
            cv.personal_info.profilePictureUrl = shareUrl;
            reRender();

        }
    }
    function ColumnToggleButton(sectionName: string) {
        if (cv.tailored?.pdfOptions?.template !== 'two-column-1') {
            return { name: "", icon: <></>, action: () => { } }
        }
        return { name: isInLeftColumn(sectionName) ? "Use Right Column" : "Use Left Column", icon: isInLeftColumn(sectionName) ? <LeftColumnIcon /> : <RightColumnIcon />, action: () => { toggleLeftColumn(sectionName) } };
    }
    return <div className="space-y-4 text-left text-sm">
        {/* Template */}
        <div className="p-4 border rounded-lg ">
            <Button variant="outline" size="icon" onClick={() => {
                navigate(`/cv-data?cvId=${cv._id}`);
            }} title="Edit CV details"><Pencil /></Button>
            <div className="flex flex-row space-x-2">
                <p className="font-semibold mr-4">Template</p>
                <label className="flex items-center space-x-2 flex-row">
                    <input type="radio" name="template" value="single-column-1" checked={cv.tailored?.pdfOptions?.template === 'single-column-1'} onChange={() => {
                        if (!cv.tailored) return;
                        cv.tailored.pdfOptions = { ...cv.tailored.pdfOptions, template: 'single-column-1' };
                        reRender();
                    }} />
                    <span>Single Column</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="radio" name="template" value="two-column-1" checked={cv.tailored?.pdfOptions?.template === 'two-column-1'} onChange={() => {
                        if (!cv.tailored) return;
                        cv.tailored.pdfOptions = { ...cv.tailored.pdfOptions, template: 'two-column-1' };
                        reRender();
                    }} />
                    <span>Two Column</span>
                </label>
            </div>
            <div className="flex flex-row space-x-2">
                <p className="font-semibold mr-4">Colors:</p>
                <input
                    type="color"
                    value={standardize_color(cv.tailored?.pdfOptions?.primaryColorOverride)}
                    onChange={e => {
                        cv.tailored && (cv.tailored.pdfOptions = { ...cv.tailored.pdfOptions, primaryColorOverride: e.target.value })
                        reRender();
                    }}
                    className="h-6 w-6 p-1"
                />
                <span className="ml-2">Primary</span>
                <input
                    type="color"
                    value={standardize_color(cv.tailored?.pdfOptions?.secondaryColorOverride)}
                    onChange={e => {
                        cv.tailored && (cv.tailored.pdfOptions = { ...cv.tailored.pdfOptions, secondaryColorOverride: e.target.value })
                        reRender();
                    }}
                    className="h-6 w-6 p-1"
                />
                <span className="ml-2">Secondary</span>
                <input
                    type="color"
                    value={standardize_color(cv.tailored?.pdfOptions?.textColorOverride)}
                    onChange={e => {
                        cv.tailored && (cv.tailored.pdfOptions = { ...cv.tailored.pdfOptions, textColorOverride: e.target.value })
                        reRender();
                    }}
                    className="h-6 w-6 p-1"
                />
                <span className="ml-2">Main Text</span>

            </div>
            <PictureSelector onPictureSelected={handlePictureSelected} />

        </div>
        {sections.length === 0 && <p className="text-muted-foreground">No sections to display. Add sections from the toolbar above.</p>}
        {sections.map((section) => {
            console.log('Rendering section:', section);
            switch (section) {
                case 'cover-letter':
                    if (cv.tailored?.coverLetter) {
                        return (
                            <EditableSectionCard title="Cover Letter" onIncludeChange={s => { onHideSection('cover-letter', s) }} toolBarOptions={[
                                { name: 'Edit', icon: <Pencil />, action: () => editSection('cover-letter') },
                                { name: 'Move to top', icon: <ArrowUpToLine />, action: () => { moveCoverLetter("top") } },
                                { name: 'Move to bottom', icon: <ArrowDownToLine />, action: () => { moveCoverLetter("bottom") } },
                            ]}>
                                <div> {cv.tailored.coverLetter}</div>
                            </EditableSectionCard>
                        );
                    }
                    break;
                case 'personalInfo':
                    return (
                        <EditableSectionCard title="Personal Info" onIncludeChange={s => { onHideSection('personalInfo', s) }} disableInclude={true} toolBarOptions={[
                            ColumnToggleButton('personalInfo'),
                            { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('personalInfo') } },
                            { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('personalInfo') } },

                        ]}>
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
                        <EditableSectionCard title="Summary" onIncludeChange={s => { onHideSection('summary', s) }} toolBarOptions={[
                            ColumnToggleButton('summary'),
                            { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('summary') } },
                            { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('summary') } },
                        ]}>
                            <div>{cv.personal_info.summary}</div>
                        </EditableSectionCard>
                    );
                case 'skills':
                    return (<EditableSectionCard title="Skills" onIncludeChange={s => { onHideSection('skills', s) }} toolBarOptions={[
                        ColumnToggleButton('skills'),
                        { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('skills') } },
                        { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('skills') } },
                    ]}>
                        <ul className="list-disc list-inside flex flex-wrap gap-2">
                            {cv.skills.map(skill => (
                                <li key={skill.id}>{skill.name}</li>
                            ))}
                        </ul>
                    </EditableSectionCard>);
                case 'workExperience':
                    return (<EditableSectionCard title="Work Experience"

                        onIncludeChange={s => { onHideSection('workExperience', s) }}

                        menuOptions={[{ name: 'Newest first', action: () => { } }, { name: 'Oldest first', action: () => { } }]}
                        toolBarOptions={[
                            ColumnToggleButton('workExperience'),
                            { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('workExperience') } },
                            { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('workExperience') } }
                        ]}>
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
                    return (<EditableSectionCard title="Education" onIncludeChange={s => { onHideSection('education', s) }} toolBarOptions={[
                        ColumnToggleButton('education'),
                        { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('education') } },
                        { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('education') } },
                    ]}>
                        {cv.education.map(edu => (
                            <div key={edu.id} className="mb-2">
                                <h4 className="font-semibold">{edu.degree} in {edu.field}</h4>
                                <p className="text-sm text-muted-foreground">{edu.institution} | {edu.startDate} - {edu.endDate}</p>
                                <p>GPA: {edu.gpa}</p>
                            </div>
                        ))}
                    </EditableSectionCard>);
                case 'languages':
                    return (<EditableSectionCard title="Languages" onIncludeChange={s => { onHideSection('languages', s) }} toolBarOptions={[
                        ColumnToggleButton('languages'),
                        { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('languages') } },
                        { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('languages') } },
                    ]}>
                        <ul className="list-disc list-inside flex flex-wrap gap-2">{cv.language_skills.map(lang => (
                            <li key={lang.id} className="font-semibold">{lang.language} <span className='font-normal'>{lang.level}</span></li>
                        ))}
                        </ul>
                    </EditableSectionCard>);
            }
        })}
    </div>;
}

function LeftColumnIcon() {
    return <img src="/left-column.svg" alt="Left Column Icon" className="h-5 w-5" />;
}
function RightColumnIcon() {
    return <img src="/right-column.svg" alt="Right Column Icon" className="h-5 w-5" />;
} 