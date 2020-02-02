import React from "react";
/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { PrimaryButton } from "./Styles";
import { QuestionList } from "./QuestionList";
import { /*getUnansweredQuestions,*/ QuestionData } from "./QuestionsData";
import { Page } from "./Page";
import { PageTitle } from "./PageTitle";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";

import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { getUnansweredQuestionsActionCreator, AppState } from "./Store";

import { useAuth } from "./Auth";

interface Props extends RouteComponentProps {
    getUnansweredQuestions: () => Promise<void>;
    questions: QuestionData[] | null;
    questionsLoading: boolean;
}

//const renderQuestion = (question: QuestionData) => <div>{question.title}</div>

/*export*/ const HomePage: React.FC<Props> = ({ history, questions, questionsLoading, getUnansweredQuestions }) => {
    //const [questions, setQuestions] = useState<QuestionData[] | null>(null);
    //const [questionsLoading, setQuestionsLoading] = useState(true);
    const [count, setCount] = useState(0);

    /*useEffect(() => {
        let cancelled = false;
        console.log("first rendered");
        const doGetUnansweredQuestions = async () => {
            const unansweredQuestions = await getUnansweredQuestions();
            if (!cancelled) {
                setQuestions(unansweredQuestions);
                setQuestionsLoading(false);
            }            
        };
        doGetUnansweredQuestions();
        return () => {
            cancelled = true;
        };
    }, []);*/

    useEffect(() => {
        
        if (questions === null) {
            getUnansweredQuestions();
        }
    }, [questions, getUnansweredQuestions]);

    const handleAskQuestionClick = () => {
        //setCount(count + 1);
        //console.log("Todo - move to the AskPage");
        history.push("/ask");
    };

    const { isAuthenticated } = useAuth();

    return (
        <Page>
            <div
                css={css`
                    margin: 50px auto 20px auto;
                    padding: 30px 20px;
                    max-width: 600px;
                `}
            >
                <div
                    css={css`
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    `}
                >
                    <PageTitle>Unanswered Questions</PageTitle>
                    { isAuthenticated && (
                        <PrimaryButton onClick={handleAskQuestionClick}>Ask a question</PrimaryButton>
                    )}                    
                </div>
                {/*<QuestionList data={getUnansweredQuestions()} />*/}
                {questionsLoading ? (
                    <div
                        css={css`
                            font-size: 16px;
                            font-style: italic;
                        `}
                    >
                        Loading...
                    </div>
                    ) : (
                        <QuestionList data={questions || []} />
                    )
                }                
            </div>
        </Page>        
    );
};

const mapStateToProps = (store: AppState) => {
    return {
        questions: store.questions.unanswered,
        questionsLoading: store.questions.loading
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        getUnansweredQuestions: () => dispatch(getUnansweredQuestionsActionCreator())
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HomePage);