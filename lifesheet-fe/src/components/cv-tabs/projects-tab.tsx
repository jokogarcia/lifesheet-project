import { FolderOpen, Plus, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CV, Project, Skill } from '../../services/cvs-service';
import { FormattedMessage, useIntl } from 'react-intl';

interface ProjectsTabProps {
  isEditing: boolean;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  cv: CV | null;
  availableSkills: Skill[];
}

export function ProjectsTab({
  isEditing,
  projects,
  setProjects,
  cv,
  availableSkills,
}: ProjectsTabProps) {
  const intl = useIntl();

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      url: '',
      skills: [],
    };
    setProjects([...projects, newProject]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const updateProject = (
    id: string,
    field: keyof Project,
    value: Project[keyof Project]
  ) => {
    setProjects(
      projects.map(project => (project.id === id ? { ...project, [field]: value } : project))
    );
  };

  const addSkillToProject = (projectId: string) => {
    setProjects(
      projects.map(project =>
        project.id === projectId ? { ...project, skills: [...(project.skills || []), { id: '', name: '', level: 'Advanced' }] } : project
      )
    );
  };

  const updateProjectSkill = (projectId: string, skillIndex: number, field: keyof Skill, value: string) => {
    setProjects(
      projects.map(project =>
        project.id === projectId
          ? {
            ...project,
            skills:
              project.skills?.map((skill, idx) => 
                idx === skillIndex ? { ...skill, [field]: value } : skill
              ) || [],
          }
          : project
      )
    );
  };

  const removeSkillFromProject = (projectId: string, skillIndex: number) => {
    setProjects(
      projects.map(project =>
        project.id === projectId
          ? {
            ...project,
            skills: project.skills?.filter((_, idx) => idx !== skillIndex) || [],
          }
          : project
      )
    );
  };

  const addExistingSkillToProject = (projectId: string, skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId);
    if (skill) {
      setProjects(
        projects.map(project =>
          project.id === projectId 
            ? { ...project, skills: [...(project.skills || []), { ...skill }] }
            : project
        )
      );
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="border rounded-lg p-6 card-hover bg-gradient-subtle">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="h-5 w-5" />
          <h3 className="font-semibold text-lg">
            <FormattedMessage id="dashboard.projects" defaultMessage="Projects" />
          </h3>
        </div>
        <div className="space-y-6">
          {isEditing ? (
            <>
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="space-y-4 p-4 border rounded-lg transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">
                      <FormattedMessage
                        id="dashboard.project"
                        defaultMessage="Project {number}"
                        values={{ number: index + 1 }}
                      />
                    </h3>
                    {projects.length > 1 && (
                      <button
                        onClick={() => removeProject(project.id)}
                        className="bg-red-100 text-red-600 px-2 py-1 rounded"
                      >
                        <FormattedMessage id="dashboard.remove" defaultMessage="Remove" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor={`name-${project.id}`}>
                        <FormattedMessage id="dashboard.projectName" defaultMessage="Project Name" />*
                      </label>
                      <input
                        id={`name-${project.id}`}
                        value={project.name}
                        required
                        onChange={e => updateProject(project.id, 'name', e.target.value)}
                        placeholder={intl.formatMessage({ id: "dashboard.projectName.placeholder", defaultMessage: "Project Name" })}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`url-${project.id}`}>
                        <FormattedMessage id="dashboard.projectUrl" defaultMessage="Project URL" />
                      </label>
                      <input
                        id={`url-${project.id}`}
                        type="url"
                        value={project.url || ''}
                        onChange={e => updateProject(project.id, 'url', e.target.value)}
                        placeholder={intl.formatMessage({ id: "dashboard.projectUrl.placeholder", defaultMessage: "https://example.com" })}
                        className="border rounded-lg p-2 placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`description-${project.id}`}>
                      <FormattedMessage id="dashboard.projectDescription" defaultMessage="Project Description" />
                    </label>
                    <textarea
                      id={`description-${project.id}`}
                      value={project.description}
                      onChange={e => updateProject(project.id, 'description', e.target.value)}
                      placeholder={intl.formatMessage({ id: "dashboard.projectDescription.placeholder", defaultMessage: "Describe your project, technologies used, and key features..." })}
                      rows={4}
                      className="block w-full border rounded-lg p-2 placeholder-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label>
                      <FormattedMessage id="dashboard.projectSkills" defaultMessage="Skills Used" />
                    </label>
                    <div className="space-y-2">
                      {/* Add existing skill dropdown */}
                      {availableSkills.length > 0 && (
                        <div className="flex gap-2">
                          <select
                            onChange={e => {
                              if (e.target.value) {
                                addExistingSkillToProject(project.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            className="flex-1 border rounded-lg p-2"
                            defaultValue=""
                          >
                            <option value="">
                              <FormattedMessage id="dashboard.addExistingSkill" defaultMessage="Add existing skill..." />
                            </option>
                            {availableSkills
                              .filter(skill => !project.skills?.some(ps => ps.id === skill.id))
                              .map(skill => (
                                <option key={skill.id} value={skill.id}>
                                  {skill.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                      
                      {/* Project-specific skills */}
                      {(project.skills || []).map((skill, skillIndex) => (
                        <div key={skillIndex} className="flex gap-2">
                          <input
                            value={skill.name}
                            onChange={e => updateProjectSkill(project.id, skillIndex, 'name', e.target.value)}
                            placeholder={intl.formatMessage({ id: "dashboard.skillName.placeholder", defaultMessage: "Skill name..." })}
                            className="flex-1 border rounded-lg p-2 placeholder-gray-500"
                          />
                          <button
                            onClick={() => removeSkillFromProject(project.id, skillIndex)}
                            className="bg-red-100 text-red-600 px-3 py-2 rounded"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addSkillToProject(project.id)}
                        className="bg-blue-100 text-blue-600 px-3 py-2 rounded text-sm"
                      >
                        <FormattedMessage id="dashboard.addSkill" defaultMessage="+ Add Skill" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addProject}
                className="bg-green-100 text-green-600 px-4 py-2 rounded btn-custom"
              >
                <Plus className="h-4 w-4 mr-2 inline-block" />
                <FormattedMessage id="dashboard.addProject" defaultMessage="Add Project" />
              </button>
            </>
          ) : (
            <div className="space-y-4">
              {cv?.projects?.length === 0 || !cv?.projects ? (
                <p className="text-muted-foreground text-center py-8">
                  <FormattedMessage id="dashboard.noProjects" defaultMessage="No projects added yet" />
                </p>
              ) : (
                cv?.projects.map((project: Project) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <FormattedMessage id="dashboard.viewProject" defaultMessage="View Project" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="text-sm mt-2 text-left">
                      <ReactMarkdown>{project.description}</ReactMarkdown>
                    </div>
                    {project.skills && project.skills.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium text-sm mb-2">
                          <FormattedMessage id="dashboard.skillsUsed" defaultMessage="Skills Used" />:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {skill.name}
                              {skill.level && ` (${skill.level})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
