import React, { useEffect } from "react";
import { Page } from "./Page";
import { Form, required, minLength, Values, SubmitResult } from "./Form";
import { Field } from "./Field";
//import { postQuestion } from "./QuestionsData";
import { PostQuestionData, QuestionData } from "./QuestionsData";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { postQuestionActionCreator, AppState, clearPostedQuestionActionCreator } from "./Store";
import { AnyAction } from "redux";

interface Props {
    postQuestion: (question: PostQuestionData) => Promise<void>;
    postedQuestionResult?: QuestionData;
    clearPostedQuestion: () => void;
}

//export const AskPage = () => {
const AskPage: React.FC<Props> = ({ postQuestion, postedQuestionResult, clearPostedQuestion }) => {
    /*const handleSubmit1 = async (values: Values) => {
        const question = await postQuestion({
            title: values.title,
            content: values.content,
            userName: "Fred",
            created: new Date()
        });

        return { success: question ? true : false};
    };*/

    useEffect(() => {
        return function cleanup() {
            clearPostedQuestion();
        };
    }, [clearPostedQuestion]);

    const handleSubmit = /*async*/ (values: Values) => {
        /*const question = await postQuestion({
            title: values.title,
            content: values.content,
            userName: "Fred",
            created: new Date()
        });

        return { success: question ? true : false, errors: {} };*/

        postQuestion({
            title: values.title,
            content: values.content,
            userName: "Fred",
            created: new Date()
        });
    };

    let submitResult: SubmitResult | undefined;
    if (postedQuestionResult) {
        submitResult = { success: postedQuestionResult != undefined, errors: {} };
    }
    return (
        <Page title="Ask a question">
            <Form submitCaption="Submit Your Question"
                validationRules={{
                    title: [
                        { validator: required },
                        { validator: minLength, args: 10 }
                    ],
                    content: [
                        { validator: required },
                        { validator: minLength, args: 50 }
                    ]
                }}
                onSubmit={handleSubmit}
                submitResult={submitResult}
                failureMessage="There was a problem with your question"
                successMessage="Your question was successfully submitted"
            >
                <Field name="title" label="Title" />
                <Field name="content" label="Content" type="TextArea" />
            </Form>
        </Page>
    );    
};
//export default AskPage;

const mapStateToProps = (store: AppState) => {
    return {
        postedQuestionResult: store.questions.postedResult
    };
};

const mapDispatchToProps = (
    dispatch: ThunkDispatch<any, any, AnyAction>
) => {
    return {
        postQuestion: (question: PostQuestionData) =>
            dispatch(postQuestionActionCreator(question)),
        clearPostedQuestion: () =>
            dispatch(clearPostedQuestionActionCreator())
    };
};

export default connect (
    mapStateToProps,
    mapDispatchToProps
)(AskPage);