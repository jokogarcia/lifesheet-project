import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

// Import your language context or create a mock
import { LanguageProvider } from '@/contexts/language-context';

// Mock translations for testing
const mockTranslations = {
    en: {
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.close': 'Close',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',
    },
    de: {
        'common.loading': 'Laden...',
        'common.error': 'Fehler',
        'common.success': 'Erfolg',
        'common.cancel': 'Abbrechen',
        'common.save': 'Speichern',
        'common.delete': 'Löschen',
        'common.edit': 'Bearbeiten',
        'common.add': 'Hinzufügen',
        'common.close': 'Schließen',
        'common.confirm': 'Bestätigen',
        'common.yes': 'Ja',
        'common.no': 'Nein',
    },
    es: {
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito',
        'common.cancel': 'Cancelar',
        'common.save': 'Guardar',
        'common.delete': 'Eliminar',
        'common.edit': 'Editar',
        'common.add': 'Agregar',
        'common.close': 'Cerrar',
        'common.confirm': 'Confirmar',
        'common.yes': 'Sí',
        'common.no': 'No',
    },
};

interface AllTheProvidersProps {
    children: React.ReactNode;
    locale?: string;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({
    children,
    locale = 'en'
}) => {
    return (
        <BrowserRouter>
            <LanguageProvider>
                <IntlProvider
                    locale={locale}
                    messages={mockTranslations[locale as keyof typeof mockTranslations]}
                >
                    {children}
                </IntlProvider>
            </LanguageProvider>
        </BrowserRouter>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'> & { locale?: string }
) => {
    const { locale, ...renderOptions } = options || {};

    return render(ui, {
        wrapper: ({ children }) => (
            <AllTheProviders locale={locale}>
                {children}
            </AllTheProviders>
        ),
        ...renderOptions,
    });
};

// Mock functions for common testing scenarios
export const mockApiResponse = <T,>(data: T, delay = 0) => {
    return new Promise<T>((resolve) => {
        setTimeout(() => resolve(data), delay);
    });
};

export const mockApiError = (message = 'API Error', delay = 0) => {
    return new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(message)), delay);
    });
};

// Helper to create mock user data
export const createMockUser = (overrides = {}) => ({
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    ...overrides,
});

// Helper to create mock CV data
export const createMockCV = (overrides = {}) => ({
    id: '1',
    userId: '1',
    personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St, City, Country',
    },
    workExperience: [],
    education: [],
    skills: [],
    ...overrides,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
