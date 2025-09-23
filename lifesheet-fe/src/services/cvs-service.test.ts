import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
    type CV,
    type CVListItem,
    type CreateOrUpdateCVRequest,
    type CVToPDFOptions,
    isCVOnboarded,
    defaultSectionOrder,
    defaultLeftColumnSections,
    defaultPdfOptions,
    getUserCV,
    getUsersTailoredCvs,
    createOrUpdateCV,
    deleteCV,
    tailorCV,
    getCVPDF,
    getPDFv2,
    uploadCVFile
} from './cvs-service';
import { constants } from '../constants';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock the api-error-interceptor
vi.mock('./api-error-interceptor', () => ({
    setupApiErrorInterceptor: vi.fn(),
}));

// Mock constants
vi.mock('../constants', () => ({
    constants: {
        API_URL: 'https://api.example.com',
    },
}));

// Mock data
const mockPersonalInfo = {
    fullName: 'John Doe',
    email: 'john@example.com',
    title: 'Software Engineer',
    phone: '+1234567890',
    location: 'New York, NY',
    summary: 'Experienced software engineer',
};

const mockWorkExperience = {
    id: 'exp-1',
    company: 'Tech Corp',
    position: 'Senior Developer',
    startDate: '2020-01-01',
    endDate: '2023-12-31',
    current: false,
    description: 'Led development team',
    location: 'San Francisco, CA',
    achievements: ['Improved performance by 50%'],
};

const mockEducation = {
    id: 'edu-1',
    institution: 'University of Technology',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    startDate: '2016-09-01',
    endDate: '2020-05-31',
    gpa: '3.8',
    location: 'Boston, MA',
};

const mockSkill = {
    id: 'skill-1',
    name: 'JavaScript',
    level: 'Expert',
};

const mockLanguageSkill = {
    id: 'lang-1',
    language: 'English',
    level: 'Native',
};

const mockCV: CV = {
    _id: 'cv-123',
    personal_info: mockPersonalInfo,
    work_experience: [mockWorkExperience],
    education: [mockEducation],
    skills: [mockSkill],
    language_skills: [mockLanguageSkill],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
    user_id: 'user-123',
    sectionTitles: {
        personalInfo: 'Personal Information',
        workExperience: 'Work Experience',
        education: 'Education',
        skills: 'Skills',
        languages: 'Languages',
    },
};

const mockCVListItem: CVListItem = {
    _id: 'cv-1',
    updatedAt: '2023-12-01T00:00:00Z',
    hasCoverLetter: true,
    companyName: 'Tech Corp',
};

const mockCreateOrUpdateRequest: CreateOrUpdateCVRequest = {
    personal_info: mockPersonalInfo,
    work_experience: [mockWorkExperience],
    education: [mockEducation],
    skills: [mockSkill],
    language_skills: [mockLanguageSkill],
};

const mockPDFOptions: CVToPDFOptions = {
    template: 'single-column-1',
    includeEmail: true,
    includePhone: true,
    includeAddress: true,
};

const mockAuthToken = 'test-auth-token-123';

describe('CVsService Functions', () => {
    let mockAxiosInstance: any;
    let consoleSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create mock axios instance
        mockAxiosInstance = {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            defaults: {
                headers: {
                    common: {},
                },
            },
            interceptors: {
                response: {
                    use: vi.fn(),
                },
            },
        };

        (mockedAxios.create as any).mockReturnValue(mockAxiosInstance);

        // Mock console.log to avoid noise in tests
        consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getUserCV', () => {
        it('should fetch user CV without cvId', async () => {
            mockAxiosInstance.get.mockResolvedValue({ data: mockCV });

            const result = await getUserCV(mockAuthToken);

            expect(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: constants.API_URL,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${mockAuthToken}`);
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/cv');
            expect(result).toEqual(mockCV);
            expect(consoleSpy).toHaveBeenCalledWith('🔄 CVsService: Fetching user CV ', '');
        });

        it('should fetch user CV with cvId', async () => {
            const cvId = 'cv-456';
            mockAxiosInstance.get.mockResolvedValue({ data: mockCV });

            const result = await getUserCV(mockAuthToken, cvId);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/cv/cv-456');
            expect(result).toEqual(mockCV);
            expect(consoleSpy).toHaveBeenCalledWith('🔄 CVsService: Fetching user CV ', 'cv-456');
        });

        it('should use custom baseUrl when provided', async () => {
            const customBaseUrl = 'https://custom-api.com';
            mockAxiosInstance.get.mockResolvedValue({ data: mockCV });

            await getUserCV(mockAuthToken, undefined, customBaseUrl);

            expect(mockedAxios.create).toHaveBeenCalledWith({
                baseURL: customBaseUrl,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        });

        it('should handle getUserCV error', async () => {
            const error = new Error('Network error');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getUserCV(mockAuthToken)).rejects.toThrow('Network error');
        });
    });

    describe('getUsersTailoredCvs', () => {
        it('should fetch users tailored CVs', async () => {
            const mockTailoredCVs = [mockCVListItem];
            mockAxiosInstance.get.mockResolvedValue({ data: mockTailoredCVs });

            const result = await getUsersTailoredCvs(mockAuthToken);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/cv/tailored-list');
            expect(result).toEqual(mockTailoredCVs);
        });

        it('should handle getUsersTailoredCvs error', async () => {
            const error = new Error('API error');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getUsersTailoredCvs(mockAuthToken)).rejects.toThrow('API error');
        });
    });

    describe('createOrUpdateCV', () => {
        it('should create or update CV successfully', async () => {
            const cvId = 'cv-123';
            mockAxiosInstance.put.mockResolvedValue({ data: mockCV });

            const result = await createOrUpdateCV(mockAuthToken, cvId, mockCreateOrUpdateRequest);

            expect(mockAxiosInstance.put).toHaveBeenCalledWith('/user/me/cv/cv-123', mockCreateOrUpdateRequest);
            expect(result).toEqual(mockCV);
        });

        it('should throw error when response data is null', async () => {
            const cvId = 'cv-123';
            mockAxiosInstance.put.mockResolvedValue({ data: null });

            await expect(createOrUpdateCV(mockAuthToken, cvId, mockCreateOrUpdateRequest))
                .rejects.toThrow('Failed to create or update CV');
        });

        it('should throw error when response data is undefined', async () => {
            const cvId = 'cv-123';
            mockAxiosInstance.put.mockResolvedValue({ data: undefined });

            await expect(createOrUpdateCV(mockAuthToken, cvId, mockCreateOrUpdateRequest))
                .rejects.toThrow('Failed to create or update CV');
        });

        it('should handle createOrUpdateCV network error', async () => {
            const cvId = 'cv-123';
            const error = new Error('Network error');
            mockAxiosInstance.put.mockRejectedValue(error);

            await expect(createOrUpdateCV(mockAuthToken, cvId, mockCreateOrUpdateRequest))
                .rejects.toThrow('Network error');
        });
    });

    describe('deleteCV', () => {
        it('should delete CV successfully', async () => {
            mockAxiosInstance.delete.mockResolvedValue({});

            await deleteCV(mockAuthToken);

            expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/user/me/cv');
            expect(consoleSpy).toHaveBeenCalledWith('🔄 CVsService: Deleting user CV...');
        });

        it('should handle deleteCV error', async () => {
            const error = new Error('Delete failed');
            mockAxiosInstance.delete.mockRejectedValue(error);

            await expect(deleteCV(mockAuthToken)).rejects.toThrow('Delete failed');
        });
    });

    describe('tailorCV', () => {
        beforeEach(() => {
            // Mock the wait function
            vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
                callback();
                return 1 as any;
            });
        });

        it('should tailor CV successfully', async () => {
            const jobDescription = 'Software Engineer position';
            const companyName = 'Tech Corp';
            const includeCoverLetter = true;
            const useAiTailoring = true;
            const translateTo = 'en';

            const mockBullId = 'bull-123';
            const mockTailoredCVId = 'tailored-cv-456';

            // Mock startTailoringOperation
            mockAxiosInstance.post.mockResolvedValueOnce({ data: { bullId: mockBullId } });

            // Mock checkTailoringStatus - first call returns processing, second returns completed
            mockAxiosInstance.get
                .mockResolvedValueOnce({ data: { state: 'processing', progress: 50 } })
                .mockResolvedValueOnce({
                    data: {
                        state: 'completed',
                        progress: 100,
                        result: { tailoredCVId: mockTailoredCVId, consumptionId: 'cons-123' }
                    }
                });

            const result = await tailorCV(
                mockAuthToken,
                jobDescription,
                companyName,
                includeCoverLetter,
                useAiTailoring,
                translateTo
            );

            expect(result).toEqual({ cvId: mockTailoredCVId });
            expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/me/cv/tailor', {
                jobDescription,
                companyName,
                includeCoverLetter,
                useAiTailoring,
                translateTo,
            });
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user/me/cv/tailor/progress/bull-123');
        });

        it('should handle tailoring failure', async () => {
            const jobDescription = 'Software Engineer position';
            const companyName = 'Tech Corp';
            const includeCoverLetter = true;
            const useAiTailoring = true;
            const translateTo = 'en';

            const mockBullId = 'bull-123';

            // Mock startTailoringOperation
            mockAxiosInstance.post.mockResolvedValueOnce({ data: { bullId: mockBullId } });

            // Mock checkTailoringStatus returns failed
            mockAxiosInstance.get.mockResolvedValueOnce({
                data: { state: 'failed', progress: 0 }
            });

            await expect(tailorCV(
                mockAuthToken,
                jobDescription,
                companyName,
                includeCoverLetter,
                useAiTailoring,
                translateTo
            )).rejects.toThrow('Failed to tailor CV');
        });

        it('should handle startTailoringOperation error', async () => {
            const jobDescription = 'Software Engineer position';
            const companyName = 'Tech Corp';
            const includeCoverLetter = true;
            const useAiTailoring = true;
            const translateTo = 'en';

            mockAxiosInstance.post.mockRejectedValue(new Error('Start tailoring failed'));

            await expect(tailorCV(
                mockAuthToken,
                jobDescription,
                companyName,
                includeCoverLetter,
                useAiTailoring,
                translateTo
            )).rejects.toThrow('Start tailoring failed');
        });

        it('should handle startTailoringOperation with null response data', async () => {
            const jobDescription = 'Software Engineer position';
            const companyName = 'Tech Corp';
            const includeCoverLetter = true;
            const useAiTailoring = true;
            const translateTo = 'en';

            mockAxiosInstance.post.mockResolvedValueOnce({ data: null });

            await expect(tailorCV(
                mockAuthToken,
                jobDescription,
                companyName,
                includeCoverLetter,
                useAiTailoring,
                translateTo
            )).rejects.toThrow('Failed to tailor CV');
        });
    });

    describe('getCVPDF', () => {
        it('should get CV PDF without options', async () => {
            const cvId = 'cv-123';
            const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
            mockAxiosInstance.get.mockResolvedValue({ data: mockBlob });

            const result = await getCVPDF(mockAuthToken, cvId);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('https://api.example.com/user/me/cv/cv-123/pdf', {
                responseType: 'blob',
            });
            expect(result).toEqual(mockBlob);
            expect(consoleSpy).toHaveBeenCalledWith('🔄 CVsService: Fetching CV PDF...');
        });

        it('should get CV PDF with all options', async () => {
            const cvId = 'cv-123';
            const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
            const options: CVToPDFOptions = {
                pictureId: 'pic-123',
                template: 'two-column',
                primaryColorOverride: '#ff0000',
                secondaryColorOverride: '#00ff00',
                textColorOverride: '#000000',
                text2ColorOverride: '#333333',
                backgroundColorOverride: '#ffffff',
            };

            mockAxiosInstance.get.mockResolvedValue({ data: mockBlob });

            const result = await getCVPDF(mockAuthToken, cvId, options);

            const expectedUrl = 'https://api.example.com/user/me/cv/cv-123/pdf?pictureId=pic-123&template=two-column&primaryColor=%23ff0000&secondaryColor=%2300ff00&textColor=%23000000&text2Color=%23333333&backgroundColor=%23ffffff';
            expect(mockAxiosInstance.get).toHaveBeenCalledWith(expectedUrl, {
                responseType: 'blob',
            });
            expect(result).toEqual(mockBlob);
        });

        it('should get CV PDF with partial options', async () => {
            const cvId = 'cv-123';
            const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
            const options: CVToPDFOptions = {
                pictureId: 'pic-123',
                template: 'single-column',
            };

            mockAxiosInstance.get.mockResolvedValue({ data: mockBlob });

            const result = await getCVPDF(mockAuthToken, cvId, options);

            const expectedUrl = 'https://api.example.com/user/me/cv/cv-123/pdf?pictureId=pic-123&template=single-column';
            expect(mockAxiosInstance.get).toHaveBeenCalledWith(expectedUrl, {
                responseType: 'blob',
            });
            expect(result).toEqual(mockBlob);
        });

        it('should throw error when PDF data is null', async () => {
            const cvId = 'cv-123';
            mockAxiosInstance.get.mockResolvedValue({ data: null });

            await expect(getCVPDF(mockAuthToken, cvId)).rejects.toThrow('Failed to fetch CV PDF');
        });

        it('should handle getCVPDF network error', async () => {
            const cvId = 'cv-123';
            const error = new Error('Network error');
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect(getCVPDF(mockAuthToken, cvId)).rejects.toThrow('Network error');
        });
    });

    describe('getPDFv2', () => {
        it('should generate PDF v2 successfully', async () => {
            const html = '<html><body>Test content</body></html>';
            const pictureId = 'pic-123';
            const docTitle = 'Test Document';
            const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

            mockAxiosInstance.post.mockResolvedValue({ data: mockBlob });

            const result = await getPDFv2(mockAuthToken, html, pictureId, docTitle);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/utils/generate-pdf',
                { html, pictureId, docTitle },
                { responseType: 'blob' }
            );
            expect(result).toEqual(mockBlob);
        });

        it('should generate PDF v2 without optional parameters', async () => {
            const html = '<html><body>Test content</body></html>';
            const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });

            mockAxiosInstance.post.mockResolvedValue({ data: mockBlob });

            const result = await getPDFv2(mockAuthToken, html);

            expect(mockAxiosInstance.post).toHaveBeenCalledWith(
                '/utils/generate-pdf',
                { html, pictureId: undefined, docTitle: undefined },
                { responseType: 'blob' }
            );
            expect(result).toEqual(mockBlob);
        });

        it('should throw error when PDF data is null', async () => {
            const html = '<html><body>Test content</body></html>';
            mockAxiosInstance.post.mockResolvedValue({ data: null });

            await expect(getPDFv2(mockAuthToken, html)).rejects.toThrow('Failed to generate PDF');
        });

        it('should handle getPDFv2 network error', async () => {
            const html = '<html><body>Test content</body></html>';
            const error = new Error('Network error');
            mockAxiosInstance.post.mockRejectedValue(error);

            await expect(getPDFv2(mockAuthToken, html)).rejects.toThrow('Network error');
        });
    });

    describe('uploadCVFile', () => {
        it('should throw not implemented error', async () => {
            const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

            await expect(uploadCVFile(mockAuthToken, file)).rejects.toThrow('Method not implemented.');
            expect(consoleSpy).toHaveBeenCalledWith('File to upload:', 'test.pdf');
        });

        it('should log file name for different file types', async () => {
            const file = new File(['test content'], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

            await expect(uploadCVFile(mockAuthToken, file)).rejects.toThrow('Method not implemented.');
            expect(consoleSpy).toHaveBeenCalledWith('File to upload:', 'resume.docx');
        });
    });
});

describe('isCVOnboarded utility function', () => {
    it('should return false for null CV', () => {
        expect(isCVOnboarded(null)).toBe(false);
    });

    it('should return false for undefined CV', () => {
        expect(isCVOnboarded(undefined as any)).toBe(false);
    });

    it('should return false when created_at equals updated_at', () => {
        const cv: CV = {
            ...mockCV,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
        };

        expect(isCVOnboarded(cv)).toBe(false);
    });

    it('should return true when created_at differs from updated_at', () => {
        const cv: CV = {
            ...mockCV,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-12-01T00:00:00Z',
        };

        expect(isCVOnboarded(cv)).toBe(true);
    });

    it('should handle different timestamp formats', () => {
        const cv: CV = {
            ...mockCV,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-02T10:30:45Z',
        };

        expect(isCVOnboarded(cv)).toBe(true);
    });
});

describe('CVsService constants and exports', () => {
    it('should export default section order', () => {
        expect(defaultSectionOrder).toEqual(['cover-letter', 'personalInfo', 'summary', 'skills', 'workExperience', 'education', 'languages']);
    });

    it('should export default left column sections', () => {
        expect(defaultLeftColumnSections).toEqual(['personalInfo', 'skills', 'languages']);
    });

    it('should export default PDF options', () => {
        expect(defaultPdfOptions).toEqual({
            includeEmail: true,
            includePhone: true,
            includeAddress: true,
            primaryColorOverride: '',
            secondaryColorOverride: '',
            textColorOverride: '',
            text2ColorOverride: '',
            backgroundColorOverride: '',
            template: 'single-column-1',
        });
    });


});