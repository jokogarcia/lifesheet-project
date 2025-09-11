import { File, GraduationCap } from 'lucide-react';
import type { CV, PersonalInfo } from '../../services/cvs-service';
import RichTextEditor from '../ui/editor';

interface CoverLetterTabProps {
    isEditing: boolean;
    coverLetter: string;
    setCoverLetter: (coverLetter: string) => void;
    cv: CV | null;
}

export function CoverLetterTab({
    isEditing,
    coverLetter,
    setCoverLetter,
    cv,
}: CoverLetterTabProps) {
    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
                <div className="flex items-center gap-2 mb-4">
                    <File className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Cover Letter</h3>
                </div>
                {isEditing ? <RichTextEditor content={coverLetter} onContentUpdate={setCoverLetter} /> : <div>{coverLetter}</div>}
            </div>
        </div>
    );
}
