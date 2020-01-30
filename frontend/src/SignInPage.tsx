import React from "react";
import { Page } from "./Page";
import { StatusText } from "./Styles";
import { useAuth } from "./Auth";

type SigninAction = "signin" | "signin-callback";

interface Props {
    action: SigninAction;
}

export const SignInPage: React.FC<Props> = ({ action }) => {
    const { signIn } = useAuth();

    if (action === "signin") {console.log(action);
        signIn();
    }

    return (
        <Page title="Sign In">
            <StatusText>Signing in...</StatusText>
        </Page>
    );

};