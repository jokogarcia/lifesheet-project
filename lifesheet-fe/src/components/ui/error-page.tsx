import { FormattedMessage } from "react-intl";

export function ErrorPage() {
    return <div><FormattedMessage id="error.generic" defaultMessage="Something went wrong. Please try again later." /></div>;
}