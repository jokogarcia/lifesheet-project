import { Award, Plus } from 'lucide-react';
import type { Skill, LanguageSkill, CV } from '../../services/cvs-service';

interface SkillsTabProps {
  isEditing: boolean;
  skills: Skill[];
  setSkills: (skills: Skill[]) => void;
  newSkill: { name: string; level: string };
  setNewSkill: (skill: { name: string; level: string }) => void;
  languageSkills: LanguageSkill[];
  setLanguageSkills: (skills: LanguageSkill[]) => void;
  newLanguageSkill: { language: string; level: string };
  setNewLanguageSkill: (skill: { language: string; level: string }) => void;
  cv: CV | null | null;
}

export function SkillsTab({
  isEditing,
  skills,
  setSkills,
  newSkill,
  setNewSkill,
  languageSkills,
  setLanguageSkills,
  newLanguageSkill,
  setNewLanguageSkill,
  cv,
}: SkillsTabProps) {
  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name,
        level: newSkill.level,
      };
      setSkills([...skills, skill]);
      setNewSkill({ name: '', level: 'Intermediate' });
    }
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const addLanguageSkill = () => {
    if (newLanguageSkill.language.trim()) {
      const languageSkill: LanguageSkill = {
        id: Date.now().toString(),
        language: newLanguageSkill.language,
        level: newLanguageSkill.level,
      };
      setLanguageSkills([...languageSkills, languageSkill]);
      setNewLanguageSkill({ language: '', level: 'Intermediate' });
    }
  };

  const removeLanguageSkill = (id: string) => {
    setLanguageSkills(languageSkills.filter(langSkill => langSkill.id !== id));
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Skills</h3>
        </div>
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="flex gap-2">
                <input
                  value={newSkill.name}
                  required
                  onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                  placeholder="Skill name (e.g., JavaScript, Project Management)"
                  className="flex-1 border rounded-lg p-2 placeholder-gray-500"
                />
                <select
                  value={newSkill.level}
                  onChange={e => setNewSkill({ ...newSkill, level: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  onClick={addSkill}
                  className="bg-green-100 text-green-600 px-4 py-2 rounded btn-custom"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {skills.length > 0 && (
                <div className="space-y-2">
                  <label>Your Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <div
                        key={skill.id}
                        className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2 transition-colors hover:bg-gray-200"
                      >
                        {skill.name} ({skill.level})
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Language Skills Section */}
              <div className="border-t pt-4 mt-6">
                <h4 className="font-semibold text-lg mb-4">Language Skills</h4>
                <div className="flex gap-2 mb-4">
                  <input
                    required
                    value={newLanguageSkill.language}
                    onChange={e =>
                      setNewLanguageSkill({ ...newLanguageSkill, language: e.target.value })
                    }
                    placeholder="Language (e.g., English, Spanish, French)"
                    className="flex-1 border rounded-lg p-2 placeholder-gray-500"
                  />
                  <select
                    value={newLanguageSkill.level}
                    onChange={e =>
                      setNewLanguageSkill({ ...newLanguageSkill, level: e.target.value })
                    }
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                  </select>
                  <button
                    onClick={addLanguageSkill}
                    className="bg-green-100 text-green-600 px-4 py-2 rounded btn-custom"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {languageSkills.length > 0 && (
                  <div className="space-y-2">
                    <label>Your Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {languageSkills.map(langSkill => (
                        <div
                          key={langSkill.id}
                          className="bg-blue-50 px-2 py-1 rounded flex items-center gap-2 transition-colors hover:bg-blue-100"
                        >
                          {langSkill.language} ({langSkill.level})
                          <button
                            onClick={() => removeLanguageSkill(langSkill.id)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {cv?.skills.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No skills added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cv?.skills.map((skill: Skill) => (
                    <div
                      key={skill.id}
                      className="bg-gray-100 px-2 py-1 rounded transition-colors hover:bg-gray-200"
                    >
                      {skill.name} ({skill.level})
                    </div>
                  ))}
                </div>
              )}

              {/* Language Skills Display */}
              {cv?.language_skills && cv.language_skills.length > 0 && (
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-semibold text-lg mb-4">Language Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {cv.language_skills.map((langSkill: LanguageSkill) => (
                      <div
                        key={langSkill.id}
                        className="bg-blue-50 px-2 py-1 rounded transition-colors hover:bg-blue-100"
                      >
                        {langSkill.language} ({langSkill.level})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
