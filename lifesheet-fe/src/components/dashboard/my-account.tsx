import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-hook';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import * as userService from '@/services/user-service';
import { useUserCV } from '@/hooks/use-cv';
import { constants } from '@/constants';
export function MyAccount() {
    const intl = useIntl();
    const navigate = useNavigate();
    const { logout: _logout, getAccessTokenSilently } = useAuth();
    const { cv, isLoading } = useUserCV();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeletingLoading, setIsDeletingLoading] = useState(false);
    const [isReseting, setIsReseting] = useState(false);
    const [isResetingLoading, setIsResetingLoading] = useState(false);

    const logout = () => {
        _logout({
            redirectUri: window.location.origin
        });
    };

    const handleChangePassword = () => {
        // Typically, Keycloak provides a password change page
        // Redirect to that page or launch in a new window
        const url = `https://${constants.AUTH_DOMAIN}/realms/${constants.AUTH_REALM}/account/account-security/signing-in`;
        window.open(url, '_blank');
    };

    const handleDeleteAccount = async () => {
        if (isDeleting) {
            const confirmed = window.confirm(
                intl.formatMessage({
                    id: 'myAccount.confirmDelete',
                    defaultMessage: 'Are you sure you want to delete your account? This action cannot be undone.'
                })
            );

            if (confirmed) {
                try {
                    setIsDeletingLoading(true);
                    const token = await getAccessTokenSilently();
                    await userService.deleteUserAccount(token);
                    alert(
                        intl.formatMessage({
                            id: 'myAccount.accountDeleted',
                            defaultMessage: 'Your account has been successfully deleted. You will be logged out now.'
                        })
                    );

                    // Logout after successful deletion
                    setTimeout(() => {
                        logout();
                    }, 2000);
                } catch (error) {
                    console.error('Error deleting account:', error);
                    alert(
                        intl.formatMessage({
                            id: 'myAccount.errorDeleteDescription',
                            defaultMessage: 'An error occurred while trying to delete your account. Please try again later.'
                        })
                    );
                    setIsDeleting(false);
                    setIsDeletingLoading(false);
                }
            } else {
                setIsDeleting(false);
            }
        } else {
            setIsDeleting(true);
        }
    };

    const handleResetAccount = async () => {
        if (isReseting) {
            const confirmed = window.confirm(
                intl.formatMessage({
                    id: 'myAccount.confirmReset',
                    defaultMessage: 'Are you sure you want to reset your account? All your CVs and data will be permanently lost.'
                })
            );

            if (confirmed) {
                try {
                    setIsResetingLoading(true);
                    const token = await getAccessTokenSilently();
                    await userService.resetUserAccount(token);
                    alert(
                        intl.formatMessage({
                            id: 'myAccount.accountReset',
                            defaultMessage: 'Your account has been successfully reset. You will be redirected to the dashboard.'
                        })
                    );

                    // Redirect to dashboard after successful reset
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                } catch (error) {
                    console.error('Error resetting account:', error);
                    alert(
                        intl.formatMessage({
                            id: 'myAccount.errorResetDescription',
                            defaultMessage: 'An error occurred while trying to reset your account. Please try again later.'
                        })
                    );
                    setIsReseting(false);
                    setIsResetingLoading(false);
                }
            } else {
                setIsReseting(false);
            }
        } else {
            setIsReseting(true);
        }
    };

    if (isLoading) {
        return <LoadingIndicator />;
    }

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <Button variant="outline" onClick={() => navigate('/')}>
                    <FormattedMessage id="myAccount.backToDashboard" defaultMessage="Back to Dashboard" />
                </Button>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>
                        <FormattedMessage id="myAccount.title" defaultMessage="My Account" />
                    </CardTitle>
                    <CardDescription>
                        <FormattedMessage id="myAccount.subtitle" defaultMessage="Manage your account settings" />
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-medium">
                                <FormattedMessage id="myAccount.personalInfo" defaultMessage="Personal Information" />
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-muted-foreground">
                                    <FormattedMessage id="myAccount.name" defaultMessage="Name" />
                                </div>
                                <div>{cv?.personal_info?.fullName || 'N/A'}</div>

                                <div className="text-muted-foreground">
                                    <FormattedMessage id="myAccount.email" defaultMessage="Email" />
                                </div>
                                <div>{cv?.personal_info?.email || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-4">
                    <div className="flex flex-col gap-2 w-full">
                        <h3 className="text-lg font-medium">
                            <FormattedMessage id="myAccount.accountManagement" defaultMessage="Account Management" />
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={handleChangePassword} variant="outline">
                                <FormattedMessage id="myAccount.changePassword" defaultMessage="Change Password" />
                            </Button>

                            <Button onClick={logout} variant="secondary">
                                <FormattedMessage id="myAccount.logout" defaultMessage="Logout" />
                            </Button>
                        </div>
                    </div>

                    <div className="border-t border-border w-full pt-4 mt-2">
                        <h3 className="text-lg font-medium text-destructive mb-2">
                            <FormattedMessage id="myAccount.dangerZone" defaultMessage="Danger Zone" />
                        </h3>
                        <Button
                            onClick={handleDeleteAccount}
                            variant="destructive"
                            className={`m-3 ${isDeleting ? 'animate-pulse' : ''}`}
                            disabled={isDeletingLoading}

                        >
                            {isDeletingLoading ? (
                                <FormattedMessage id="myAccount.deleting" defaultMessage="Deleting..." />
                            ) : isDeleting ? (
                                <FormattedMessage id="myAccount.confirmDelete" defaultMessage="Click again to confirm" />
                            ) : (
                                <FormattedMessage id="myAccount.deleteAccount" defaultMessage="Delete My Account" />
                            )}
                        </Button>
                        <Button
                            onClick={handleResetAccount}
                            variant="destructive"
                            className={isReseting ? 'animate-pulse' : ''}
                            disabled={isResetingLoading}
                        >
                            {isResetingLoading ? (
                                <FormattedMessage id="myAccount.reseting" defaultMessage="Reseting..." />
                            ) : isReseting ? (
                                <FormattedMessage id="myAccount.confirmReset" defaultMessage="Click again to confirm" />
                            ) : (
                                <FormattedMessage id="myAccount.resetAccount" defaultMessage="Reset My Account" />
                            )}
                        </Button>
                        {isReseting && (
                            <p className="text-sm text-muted-foreground mt-2">
                                <FormattedMessage
                                    id="myAccount.resetWarning"
                                    defaultMessage="This will permanently reset your account. You will still be able to login, but all your CVs, and all your data will be lost. This action cannot be undone."
                                />
                            </p>
                        )}
                        {isDeleting && (
                            <p className="text-sm text-muted-foreground mt-2">
                                <FormattedMessage
                                    id="myAccount.deleteWarning"
                                    defaultMessage="This will permanently delete your account, all your CVs, and all your data. You will not be able to log back in. This action cannot be undone."
                                />
                            </p>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
