import React from "react";
import { Page } from "./Page";
import { RouteComponentProps } from "react-router-dom";

import { QuestionData, getQuestion, postAnswer, mapQuestionFromServer, QuestionDataFromServer } from "./QuestionsData";
import { useState, Fragment, useEffect } from "react";
/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { gray3, gray6 } from "./Styles";

import { AnswerList } from "./AnswerList";
import { Form, required, minLength, Values } from "./Form";
import { Field } from "./Field";

import { HubConnectionBuilder, HubConnectionState, HubConnection } from "@aspnet/signalr";

import { useAuth } from "./Auth";

interface RouteParams {
    questionId: string;
}

export const QuestionPage: React.FC<RouteComponentProps<RouteParams>> = ({ match }) => {
    const [question, setQuestion] = useState<QuestionData | null>(null);

    const setUpSignalRConnection = async (questionId: number) => {
        //Setup connection to real-time signal r api
        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5000/questionshub")
            .withAutomaticReconnect()
            .build();

        //handle message function being called
        connection.on("Message", (message: string) => {
            console.log("Message", message);
        });

        //handle ReceiveQuestion function being called
        /*connection.on("ReceiveQuestion", (question: QuestionData) => {
            console.log("ReceiveQuestion", question);
            setQuestion(question);
        })*/
        connection.on("ReceiveQuestion", (question: QuestionDataFromServer) => {
            console.log("ReceiveQuestion", question);
            setQuestion(mapQuestionFromServer(question));
        });

        //start the connection
        try {
            await connection.start();
        }
        catch (err) {
            console.log(err);
        }

        //subscribe to question
        if (connection.state === HubConnectionState.Connected) {
            connection
                .invoke("SubscribeQuestion", questionId)
                .catch((err: Error) => {
                    return console.log(err.toString());
                })
        }

        //return the connection
        return connection;
    }

    const cleanUpSignalRConnection = async (
        questionId: number,
        connection: HubConnection
    ) => {
        //unsubscribe from the question
        if (connection.state === HubConnectionState.Connected) {
            try {
                await connection.invoke("UnsubscribeQuestion", questionId);
            }
            catch (err) {
                return console.log(err.toString());
            }

            //stop the connection
            connection.off("Message");
            connection.off("SubscribeQuestion");
            connection.stop();
        }
        else {
            //stop the connection
            connection.off("Message");
            connection.off("SubscribeQuestion");
            connection.stop();
        }
    }

    useEffect(() => {
        let cancelled = false;

        const doGetQuestion = async (questionId: number) => {
            const foundQuestion = await getQuestion(questionId);

            if (!cancelled) {
                setQuestion(foundQuestion);
            }            
        }

        let connection: HubConnection;

        if (match.params.questionId) {
            const questionId = Number(match.params.questionId);
            doGetQuestion(questionId);
            setUpSignalRConnection(questionId).then(con => {
                connection = con;
            });
        }

        return function cleanUp() {
            cancelled = true;
            if (match.params.questionId) {
                const questionId = Number(match.params.questionId);
                cleanUpSignalRConnection(questionId, connection);
            }
        }
    }, [match.params.questionId]);

    const handleSubmit = async (values: Values) => {
        const result = await postAnswer({
            questionId: question!.questionId,
            content: values.content,
            userName: "Fred",
            created: new Date()
        });

        return { success: question ? true : false, errors: {} };
    };

    const { isAuthenticated } = useAuth();
    
    return <Page>
        <div
            css={css`
                background-color: white;
                padding: 15px 20px 20px 20px;
                border-radius: 4px;
                border: 1px solid ${gray6};
                box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.16);
            `}
        >
            <div
                css={css`
                    font-size: 19px;
                    font-weight: bold;
                    margin: 10px 0px 5px;
                `}
            >
                {question === null ? "" : question.title}
            </div>
            {question !== null &&
                <Fragment>
                    <p
                        css={css`
                            margin-top: 0px;
                            background-color: white;
                        `}
                    >
                        {question.content}
                    </p>
                    <div
                        css={css`
                            font-size: 12px;
                            font-style: italic;
                            color: ${gray3};
                        `}
                    >
                        {`Asked by ${question.userName}
                            on ${question.created.toLocaleDateString()}
                            ${question.created.toLocaleTimeString()}
                        `}
                    </div>{question.answers.length}
                    <AnswerList data={question.answers} />
                    {isAuthenticated && (
                        <div
                            css={css`
                                margin-top: 20px;
                            `}
                        >
                            <Form 
                                submitCaption="Submit Your Answer"
                                validationRules={{
                                    content: [
                                        { validator: required },
                                        { validator: minLength, args: 50 }
                                    ]
                                }}
                                onSubmit={handleSubmit}
                                failureMessage="There was a problem with your answer"
                                successMessage="Your answer was successfully submitted"
                            >
                                <Field name="content" label="Your Answer" type="TextArea" />
                            </Form>
                        </div>
                    )}
                </Fragment>
            }
        </div>
    </Page>;
};