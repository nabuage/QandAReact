import { QuestionData, getUnansweredQuestions, postQuestion, PostQuestionData } from "./QuestionsData";
import { Action, ActionCreator, Dispatch, Reducer, combineReducers, Store, createStore, applyMiddleware } from "redux";
import thunk, { ThunkAction } from "redux-thunk";
import { Question } from "./Question";

interface QuestionState {
    readonly loading: boolean;
    readonly unanswered: QuestionData[] | null;
    readonly postedResult?: QuestionData;
}

export interface AppState {
    readonly questions: QuestionState;
}

const initialQuestionState: QuestionState = {
    loading: false,
    unanswered: null
}

interface GettingUnansweredQuestionsAction
    extends Action<"GettingUnansweredQuestions"> {
}

export interface GotUnansweredQuestionsAction
    extends Action<"GotUnansweredQuestions"> {
    questions: QuestionData[];
}

export interface PostedQuestionAction  
    extends Action<"PostedQuestion"> {
    result: QuestionData | undefined;
}

type QuestionsActions =
    | GettingUnansweredQuestionsAction
    | GotUnansweredQuestionsAction
    | PostedQuestionAction;

//export const getUnansweredQuestionsActionCreator = () => {
export const getUnansweredQuestionsActionCreator: ActionCreator<
    ThunkAction<
        Promise<void>, 
        QuestionData[], 
        null, 
        GotUnansweredQuestionsAction
        >
    > = () => {
    return async (dispatch: Dispatch) => {
        //dispatch the GettingUnansweredQuestions action
        const gettingUnansweredQuestionsAction:
            GettingUnansweredQuestionsAction = {
                type: "GettingUnansweredQuestions"
            };
        dispatch(gettingUnansweredQuestionsAction);

        //get the questions from server
        const questions = await getUnansweredQuestions();

        //dispatch the GotUnansweredQuestions action
        const gotUnansweredQuestionsAction:
            GotUnansweredQuestionsAction = {
                questions,
                type: "GotUnansweredQuestions"
            };
        dispatch(gotUnansweredQuestionsAction);
    };
}

export const postQuestionActionCreator: ActionCreator<
    ThunkAction<
        Promise<void>, 
        QuestionData[], 
        PostQuestionData, 
        PostedQuestionAction
        >
    > = (question: PostQuestionData) => {
    return async (dispatch: Dispatch) => {
        //get the questions from server
        const result = await postQuestion(question);

        //dispatch the GotUnansweredQuestions action
        const postedQuestionAction:
            PostedQuestionAction = {
                type: "PostedQuestion",
                result
            };
        dispatch(postedQuestionAction);
    };
}

export const clearPostedQuestionActionCreator: ActionCreator<
        PostedQuestionAction
    > = () => {
        const postedQuestionAction: PostedQuestionAction = {
            type: "PostedQuestion",
            result: undefined
        };
        return postedQuestionAction;
    };

const questionsReducer: Reducer<QuestionState, QuestionsActions> = (
    state = initialQuestionState,
    action
) => {
    //Handle the different actions and return new state

    switch (action.type) {
        case "GettingUnansweredQuestions": {
            return {
                ...state,
                unanswered: null,
                loading: true
            };
        }
        case "GotUnansweredQuestions": {
            return {
                ...state,
                unanswered: action.questions,
                loading: false
            };
        }
        case "PostedQuestion": {
            return {
                ...state,
                unanswered: action.result
                    ? (state.unanswered || []).concat(action.result)
                    : state.unanswered,
                postedResult: action.result
            };
        }
        default:
                neverReach(action);
    }
    return state;
}

const neverReach = (never: never) => {};

const rootReducer = combineReducers<AppState>({
    questions: questionsReducer
});

export function configureStore(): Store<AppState> {
    const store = createStore(
        rootReducer,
        undefined,
        applyMiddleware(thunk)
    );
    return store;
}