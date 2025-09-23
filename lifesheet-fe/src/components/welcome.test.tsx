import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import { Welcome } from './welcome';

// Mock the auth hook
const mockLoginWithRedirect = vi.fn();
vi.mock('@/hooks/auth-hook', () => ({
    useAuth: () => ({
        loginWithRedirect: mockLoginWithRedirect,
    }),
}));

// Mock the language selector component
vi.mock('@/components/ui/language-selector', () => ({
    LanguageSelector: () => <div data-testid="language-selector">Language Selector</div>,
}));

describe('Welcome Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders welcome content', () => {
        render(<Welcome />);

        expect(screen.getByText('Welcome to LifeSheet')).toBeInTheDocument();
        expect(screen.getByText('Your CV management and tailoring solution')).toBeInTheDocument();
    });

    it('renders language selector', () => {
        render(<Welcome />);

        expect(screen.getByTestId('language-selector')).toBeInTheDocument();
    });

    it('renders main heading and subtitle', () => {
        render(<Welcome />);

        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Welcome to LifeSheet');

        const subtitle = screen.getByText('Your CV management and tailoring solution');
        expect(subtitle).toBeInTheDocument();
    });

    it('renders feature cards', () => {
        render(<Welcome />);

        expect(screen.getByText('Store & Organize')).toBeInTheDocument();
        expect(screen.getByText('Tailor & Customize')).toBeInTheDocument();
        expect(screen.getByText('Export & Share')).toBeInTheDocument();
    });

    it('renders dashboard preview image', () => {
        render(<Welcome />);

        const image = screen.getByAltText('LifeSheet Dashboard Preview');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/dashboard.png');
    });

    it('calls loginWithRedirect when Get Started button is clicked', () => {
        render(<Welcome />);

        const getStartedButton = screen.getByText('Get Started');
        fireEvent.click(getStartedButton);

        expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1);
    });

    it('calls loginWithRedirect when Sign In to Get Started button is clicked', () => {
        render(<Welcome />);

        const signInButton = screen.getByText('Sign In to Get Started');
        fireEvent.click(signInButton);

        expect(mockLoginWithRedirect).toHaveBeenCalledTimes(1);
    });

    it('renders both action buttons', () => {
        render(<Welcome />);

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);

        expect(screen.getByText('Get Started')).toBeInTheDocument();
        expect(screen.getByText('Sign In to Get Started')).toBeInTheDocument();
    });

    it('renders section headings', () => {
        render(<Welcome />);

        expect(screen.getByText('Manage Your Professional Journey')).toBeInTheDocument();
        expect(screen.getByText('Ready to level up your job applications?')).toBeInTheDocument();
    });

    it('renders feature descriptions', () => {
        render(<Welcome />);

        expect(screen.getByText(/Keep all your professional experience/)).toBeInTheDocument();
        expect(screen.getByText(/Adjust your CV for specific job applications/)).toBeInTheDocument();
        expect(screen.getByText(/Generate professional-looking CVs/)).toBeInTheDocument();
    });

    it('applies correct CSS classes', () => {
        render(<Welcome />);

        // Find the main container div
        const container = screen.getByText('Welcome to LifeSheet').closest('.min-h-screen');
        expect(container).toHaveClass('min-h-screen', 'bg-gradient-to-b');
    });
});
