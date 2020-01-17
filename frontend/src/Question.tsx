//import { FC } from "react";
import React from "react";
/** @jsx jsx */
import { css, jsx } from "@emotion/core";
import { QuestionData } from "./QuestionsData";
import { gray2, gray3 } from "./Styles";
import { QuestionList } from "./QuestionList";
import { Link } from "react-router-dom";

interface Props {
    data: QuestionData;
    showContent?: boolean;
}

export const Question: React.FC<Props> = ({ data, showContent = true }) => (
    <div
        css={css`
            padding: 10px 0px;
        `}
    >
        <div
            css={css`
                padding: 10px 0px;
                font-size: 19px;
            `}
        >
            <Link
                to={`questions/${data.questionId}`}
                css={css`
                    text-decoration: none;
                    color: ${gray2};
                `}
            >
                {data.title}
            </Link>
            
        </div>
        { showContent && (
            <div
                css={css`
                    padding-bottom: 10px;
                    font-size: 15px;
                    color: ${gray2};
                `}
            >
                {data.content.length > 50 
                    ? `${data.content.substring(0, 50)}...`
                    : data.content}
            </div>
        )}
        <div
            css={css`
                font-size: 12px;
                font-style: italic;
                color: ${gray3};
            `}
        >
            {`Asked by ${data.userName} on
                ${data.created.toLocaleDateString()}
                ${data.created.toLocaleTimeString()}
            `}
        </div>
    </div>
);

/*Question.defaultProps = {
    showContent: true
};*/