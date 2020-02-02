import React from "react";
import { Page } from "./Page";
import { useState, useEffect } from "react";
import { RouteComponentProps } from "react-router-dom";
import { QuestionList } from "./QuestionList";
import { searchQuestions, QuestionData } from "./QuestionsData";
/** @jsx jsx */
import { css, jsx } from "@emotion/core";

export const SearchPage: React.FC<RouteComponentProps> = ({ location }) => {
    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get("criteria") || "";

    useEffect(() => {
        let cancelled = false;
        const doSearch = async (criteria: string) => {
            const foundResults = await searchQuestions(criteria);

            if (!cancelled) {
                setQuestions(foundResults);
            }            
        };

        doSearch(search);

        return () => {
            cancelled = true;
        };
    }, [search]);

    return <Page title="Search Results">
        {search && (
            <p
                css={css`
                    font-size: 16px;
                    font-style: italic;
                    margin-top: 0px;
                `}
            >
                for "{search}"
            </p>
        )}
        <QuestionList data={questions} />
    </Page>
};