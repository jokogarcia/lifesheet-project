import { defaultSectionOrder, type CV } from "@/services/cvs-service";
import { useEffect, useRef, useState } from "react";

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CardContent, CardHeader, Card } from './card';
import { Button } from "./button";
import { ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, ChevronDown, Pencil } from "lucide-react";
import PictureSelector from "./picture-selector";
import * as userService from "@/services/user-service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth-hook";

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
const defaultColorList = ['cadetblue', 'darkgreen', 'darkblue', 'darkred', 'darkorange'];

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
function getSections(cv: CV): string[] {

    let sections

    if (!cv.tailored || !cv.tailored?.sectionOrder) {
        sections = defaultSectionOrder;
    } else {
        sections = cv.tailored.sectionOrder;
    }
    const i = sections.indexOf('cover-letter');
    if (i == -1) {
        return sections;
    }
    if (cv.tailored?.coverLetterOnTop && i != 0) {
        sections.splice(i, 1);
        sections.unshift('cover-letter');
    } else {
        if (i != sections.length - 1) {
            sections.splice(i, 1);
            sections.push('cover-letter');
        }
    }
    return sections;
}
export function EditableCV({ cv, setCV }: { cv: CV, setCV: (cv: CV) => void }) {
    const navigate = useNavigate();
    const sections = getSections(cv);
    const { getAccessTokenSilently } = useAuth();

    const reRender = () => { setCV({ ...cv }) };
    const setSections = (newOrder: string[]) => {
        if (!cv.tailored) return;
        setCV({ ...cv, tailored: { ...cv.tailored, sectionOrder: newOrder } });
    };

    useEffect(() => {
        const populateSignatureUrl = async () => {
            if (!cv.signature || cv.signature.imageUrl) return;
            const t = await getAccessTokenSilently();
            const shareUrl = await userService.getPictureShareLink(cv.signature.imageId, t);
            setCV({ ...cv, signature: { ...cv.signature, imageUrl: shareUrl } })
        }
        populateSignatureUrl().catch(
            e => console.error("Error populating signature URL", e)
        ).then(() => console.log("populated url for singature"))

    }, [cv.signature])

    const moveSectionUp = (section: string) => {
        if (!sections) return;
        const index = sections.indexOf(section);
        if (index > 0) {
            const newOrder = [...sections];
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
            setSections(newOrder);
        }
    }
    const moveSectionDown = (section: string) => {
        if (!sections) return;
        const index = sections.indexOf(section);
        if (index < sections.length - 1) {
            const newOrder = [...sections];
            [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
            setSections(newOrder);
        }
    }
    const onHideSection = (_section: string, state: boolean) => {

        if (!cv.tailored) return;
        if (!cv.tailored.hiddenSections) {
            cv.tailored.hiddenSections = [];
        }
        if (state) {
            //remove from hidden
            const index = cv.tailored.hiddenSections.indexOf(_section);
            if (index > -1) {
                cv.tailored.hiddenSections.splice(index, 1);
            }
        } else {
            cv.tailored.hiddenSections.push(_section);
        }
        // Force re-render
        reRender();
    }

    const editSection = (section: string) => {
        if (section === 'summary' || section === 'personalInfo') section = 'personal';
        if (section === 'workExperience') section = 'experience';
        if (section === 'cover-letter') section = 'coverLetter';
        if (section === 'languages') section = 'skills';
        if (section === 'projects') section = 'projects';
        if (section === 'signature') section = 'signature';

        navigate(`/cv-data?edit=true&tab=${section}&cvId=${cv._id}`);
    }
    if (!cv) {
        return <></>
    }
    function toggleLeftColumn(section: string) {
        if (!cv.tailored) return;
        if (!cv.tailored.leftColumnSections) {
            cv.tailored.leftColumnSections = [];
        }
        if (cv.tailored.leftColumnSections.includes(section)) {
            cv.tailored.leftColumnSections.splice(cv.tailored.leftColumnSections.indexOf(section), 1);
        } else {
            cv.tailored.leftColumnSections.push(section);
        }
        reRender();
    }
    function isInLeftColumn(section: string): boolean {
        if (!cv.tailored || !cv.tailored.leftColumnSections) return false;
        return cv.tailored.leftColumnSections.includes(section);
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
            const token = await getAccessTokenSilently();
            const shareUrl = pictureId ? await userService.getPictureShareLink(pictureId, token) : '';
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
            <DiscreteColorPicker
                label="Primary Color"
                options={[cv.tailored?.pdfOptions?.primaryColorOverride || 'black', ...defaultColorList]}
                onColorChange={(color: string) => {
                    if (cv.tailored) {
                        cv.tailored.pdfOptions = { ...cv.tailored.pdfOptions, primaryColorOverride: color };
                        reRender();
                    }
                }}
            />
            <DiscreteColorPicker label="Secondary Color" options={[cv.tailored?.pdfOptions?.secondaryColorOverride || 'black', 'lightblue', 'lightsalmon', 'linen', 'whitesmoke']}
                onColorChange={color => {
                    cv.tailored && (cv.tailored.pdfOptions = { ...cv.tailored.pdfOptions, secondaryColorOverride: color })
                    reRender();
                }} />
            <DiscreteColorPicker label="Text Color" options={[cv.tailored?.pdfOptions?.textColorOverride || 'black', '#333333', '#555500', '#000000', '#000055']}
                onColorChange={color => {
                    cv.tailored && (cv.tailored.pdfOptions = { ...cv.tailored.pdfOptions, textColorOverride: color })
                    reRender();
                }} />

            <PictureSelector onPictureSelected={handlePictureSelected} />

        </div>
        {sections.length === 0 && <p className="text-muted-foreground">No sections to display. Add sections from the toolbar above.</p>}
        {sections.map((section) => {
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
                            { name: 'Edit', icon: <Pencil />, action: () => editSection('personalInfo') },
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
                            { name: 'Edit', icon: <Pencil />, action: () => editSection('summary') },
                            { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('summary') } },
                            { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('summary') } },
                        ]}>
                            <div>{cv.personal_info.summary}</div>
                        </EditableSectionCard>
                    );
                case 'skills':
                    return (<EditableSectionCard title="Skills" onIncludeChange={s => { onHideSection('skills', s) }} toolBarOptions={[
                        ColumnToggleButton('skills'),
                        { name: 'Edit', icon: <Pencil />, action: () => editSection('skills') },
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
                            { name: 'Edit', icon: <Pencil />, action: () => editSection('workExperience') },
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
                        { name: 'Edit', icon: <Pencil />, action: () => editSection('education') },
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
                        { name: 'Edit', icon: <Pencil />, action: () => editSection('languages') },
                        { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('languages') } },
                        { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('languages') } },
                    ]}>
                        <ul className="list-disc list-inside flex flex-wrap gap-2">{cv.language_skills.map(lang => (
                            <li key={lang.id} className="font-semibold">{lang.language} <span className='font-normal'>{lang.level}</span></li>
                        ))}
                        </ul>
                    </EditableSectionCard>);
                case 'projects':
                    return (<EditableSectionCard title="Projects" onIncludeChange={s => { onHideSection('projects', s) }} toolBarOptions={[
                        ColumnToggleButton('projects'),
                        { name: 'Edit', icon: <Pencil />, action: () => editSection('projects') },
                        { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('projects') } },
                        { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('projects') } },
                    ]}>
                        {cv.projects && cv.projects.length > 0 ? (
                            cv.projects.map(project => (
                                <div key={project.id} className="mb-2">
                                    <h4 className="font-semibold">{project.name}</h4>
                                    <p className="text-sm text-muted-foreground">{project.description}</p>
                                    {project.url && (
                                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            View Project
                                        </a>
                                    )}
                                    {project.skills && project.skills.length > 0 && (
                                        <div className="mt-1">
                                            <span className="text-sm font-medium">Skills: </span>
                                            <span className="text-sm">{project.skills.map(skill => skill.name).join(', ')}</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No projects added yet.</p>
                        )}
                    </EditableSectionCard>);
                case 'signature':
                    return (<EditableSectionCard title="Signature" onIncludeChange={s => { onHideSection('signature', s) }} toolBarOptions={[
                        ColumnToggleButton('signature'),
                        { name: 'Edit', icon: <Pencil />, action: () => editSection('signature') },
                        { name: 'Move up', icon: <ArrowUp />, action: () => { moveSectionUp('signature') } },
                        { name: 'Move down', icon: <ArrowDown />, action: () => { moveSectionDown('signature') } },
                    ]}>
                        {cv.signature ? (
                            <div className="space-y-2">
                                {cv.signature.imageUrl && (
                                    <div>
                                        <img src={cv.signature.imageUrl} alt="Signature" className="max-w-xs max-h-32 object-contain" />
                                    </div>
                                )}
                                {cv.signature.date && (
                                    <p className="text-sm text-muted-foreground">Date: {cv.signature.date}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No signature added yet.</p>
                        )}
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

function DiscreteColorPicker({ label, options, onColorChange }: { label: string, options: string[], onColorChange: (color: string) => void }) {
    const pickerRef = useRef<HTMLInputElement>(null);
    const gradientRef = useRef<SVGSVGElement>(null);
    return <div className="flex flex-row space-x-2">
        <p>{label}</p>
        {options.map(option => (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                onClick={() => onColorChange(option)}
                style={{ cursor: 'pointer' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill={standardize_color(option)} />
            </svg>
        ))}
        <svg ref={gradientRef} width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            onClick={() => { pickerRef.current?.click() }}
            style={{ cursor: 'pointer' }}>
            <defs>
                <linearGradient id="multicolorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff0000" />
                    <stop offset="25%" stopColor="#ff00ff" />
                    <stop offset="50%" stopColor="#0000ff" />
                    <stop offset="75%" stopColor="#fff000" />
                    <stop offset="100%" stopColor="#00ff00" />
                </linearGradient>
            </defs>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"
                fill="url(#multicolorGradient)" />
        </svg>
        <input hidden ref={pickerRef} type="color" value={standardize_color(options[0])} onChange={e => onColorChange(e.target.value)} className="h-6 w-6 p-1" />

    </div>
}