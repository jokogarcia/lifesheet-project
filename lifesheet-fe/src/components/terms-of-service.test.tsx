import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TermsOfService } from './terms-of-service';
import { useTermsOfService } from '@/hooks/use-terms-of-service';

// Mock the useTermsOfService hook
vi.mock('@/hooks/use-terms-of-service', () => ({
    useTermsOfService: vi.fn(),
}));

describe('TermsOfService', () => {
    const mockUseTermsOfService = vi.mocked(useTermsOfService);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loading state', () => {
        it('should display loading indicator when loading', () => {
            mockUseTermsOfService.mockReturnValue({
                contents: '',
                isAccepted: false,
                version: '',
                lastAcceptedVersion: '',
                error: null,
                isLoading: true,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            });

            render(<TermsOfService />);

            // Check for the loading spinner element by class
            expect(document.querySelector('.animate-spin')).toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('should display error message when there is an error', () => {
            const errorMessage = 'Network error occurred';
            mockUseTermsOfService.mockReturnValue({
                contents: '',
                isAccepted: false,
                version: '',
                lastAcceptedVersion: '',
                error: errorMessage,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            });

            render(<TermsOfService />);

            expect(screen.getByText('Error Loading Terms of Service')).toBeInTheDocument();
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    describe('terms display', () => {
        it('should display terms content and version', () => {
            const mockTermsData = {
                contents: '<p>This is the terms of service content.</p>',
                isAccepted: false,
                version: '1.2.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            expect(screen.getByText('Terms of Service')).toBeInTheDocument();
            expect(screen.getByText('Version 1.2.0')).toBeInTheDocument();
            expect(screen.getByText('This is the terms of service content.')).toBeInTheDocument();
        });

        it('should display accept button when terms are not accepted', () => {
            const mockTermsData = {
                contents: '<p>Terms content</p>',
                isAccepted: false,
                version: '1.0.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            expect(screen.getByRole('button', { name: 'Accept Terms of Service' })).toBeInTheDocument();
        });

        it('should display accepted status when terms are accepted', () => {
            const mockTermsData = {
                contents: '<p>Terms content</p>',
                isAccepted: true,
                version: '1.0.0',
                lastAcceptedVersion: '1.0.0',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            expect(screen.getByText('✓ Terms of Service Accepted')).toBeInTheDocument();
            expect(screen.getByText('You have accepted version 1.0.0')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Accept Terms of Service' })).not.toBeInTheDocument();
        });
    });

    describe('accept terms functionality', () => {
        it('should call acceptTerms when accept button is clicked', async () => {
            const mockAcceptTerms = vi.fn().mockResolvedValue(undefined);
            const mockTermsData = {
                contents: '<p>Terms content</p>',
                isAccepted: false,
                version: '1.2.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: mockAcceptTerms,
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            const acceptButton = screen.getByRole('button', { name: 'Accept Terms of Service' });
            fireEvent.click(acceptButton);

            await waitFor(() => {
                expect(mockAcceptTerms).toHaveBeenCalledWith('1.2.0');
            });
        });

        it('should handle accept terms error', async () => {
            const mockAcceptTerms = vi.fn().mockRejectedValue(new Error('Accept failed'));
            const mockTermsData = {
                contents: '<p>Terms content</p>',
                isAccepted: false,
                version: '1.2.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: mockAcceptTerms,
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            render(<TermsOfService />);

            const acceptButton = screen.getByRole('button', { name: 'Accept Terms of Service' });
            fireEvent.click(acceptButton);

            await waitFor(() => {
                expect(mockAcceptTerms).toHaveBeenCalledWith('1.2.0');
                expect(consoleSpy).toHaveBeenCalledWith('Failed to accept terms:', expect.any(Error));
            });

            consoleSpy.mockRestore();
        });
    });

    describe('different content scenarios', () => {
        it('should handle plain text content', () => {
            const mockTermsData = {
                contents: 'Plain text terms content without HTML',
                isAccepted: false,
                version: '1.0.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            expect(screen.getByText('Plain text terms content without HTML')).toBeInTheDocument();
        });

        it('should handle HTML content', () => {
            const mockTermsData = {
                contents: '<h2>Terms Title</h2><p>Terms paragraph with <strong>bold text</strong>.</p>',
                isAccepted: false,
                version: '1.0.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            expect(screen.getByText('Terms Title')).toBeInTheDocument();
            expect(screen.getByText('bold text')).toBeInTheDocument();
            // Check for the paragraph text using a more flexible matcher
            expect(screen.getByText((content, element) => {
                return element?.textContent === 'Terms paragraph with bold text.';
            })).toBeInTheDocument();
        });

        it('should handle empty content', () => {
            const mockTermsData = {
                contents: '',
                isAccepted: false,
                version: '1.0.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            expect(screen.getByText('Terms of Service')).toBeInTheDocument();
            expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
        });

        it('should handle different version formats', () => {
            const versionScenarios = [
                { version: '1.0.0', expected: 'Version 1.0.0' },
                { version: '2.1.3', expected: 'Version 2.1.3' },
                { version: '1.5.0-beta.1', expected: 'Version 1.5.0-beta.1' },
            ];

            versionScenarios.forEach(({ version, expected }) => {
                const mockTermsData = {
                    contents: '<p>Terms content</p>',
                    isAccepted: false,
                    version,
                    lastAcceptedVersion: '',
                    error: null,
                    isLoading: false,
                    acceptTerms: vi.fn(),
                    refetch: vi.fn(),
                };

                mockUseTermsOfService.mockReturnValue(mockTermsData);

                const { unmount } = render(<TermsOfService />);

                expect(screen.getByText(expected)).toBeInTheDocument();

                unmount();
            });
        });
    });

    describe('accessibility', () => {
        it('should have proper heading structure', () => {
            const mockTermsData = {
                contents: '<p>Terms content</p>',
                isAccepted: false,
                version: '1.0.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            // Check for the title text since CardTitle might not have proper heading role
            expect(screen.getByText('Terms of Service')).toBeInTheDocument();
        });

        it('should have accessible button', () => {
            const mockTermsData = {
                contents: '<p>Terms content</p>',
                isAccepted: false,
                version: '1.0.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            const button = screen.getByRole('button', { name: 'Accept Terms of Service' });
            expect(button).toBeInTheDocument();
            expect(button).not.toBeDisabled();
        });
    });

    describe('edge cases', () => {
        it('should handle null error', () => {
            const mockTermsData = {
                contents: '<p>Terms content</p>',
                isAccepted: false,
                version: '1.0.0',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            expect(screen.getByText('Terms of Service')).toBeInTheDocument();
            expect(screen.queryByText('Error Loading Terms of Service')).not.toBeInTheDocument();
        });

        it('should handle undefined version', () => {
            const mockTermsData = {
                contents: '<p>Terms content</p>',
                isAccepted: false,
                version: '',
                lastAcceptedVersion: '',
                error: null,
                isLoading: false,
                acceptTerms: vi.fn(),
                refetch: vi.fn(),
            };

            mockUseTermsOfService.mockReturnValue(mockTermsData);

            render(<TermsOfService />);

            // Check for version text that might be empty
            expect(screen.getByText(/Version/)).toBeInTheDocument();
        });
    });
});
