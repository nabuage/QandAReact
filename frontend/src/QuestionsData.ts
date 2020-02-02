import { http } from "./http";
import { getAccessToken } from "./Auth";

export interface QuestionData {
    questionId: number;
    title: string;
    content: string;
    userName: string;
    created: Date;
    answers: AnswerData[];
}

export interface AnswerData {
    answerId: number;
    content: string;
    userName: string;
    created: Date;
}

export interface QuestionDataFromServer {
  questionId: number;
    title: string;
    content: string;
    userName: string;
    created: string;
    answers: AnswerDataFromServer[];
}

export interface AnswerDataFromServer {
  answerId: number;
  content: string;
  userName: string;
  created: string;
}

export const mapQuestionFromServer = (
  question: QuestionDataFromServer
): QuestionData => ({
  ...question,
  created: new Date(question.created.substr(0, 19)),
  answers: question.answers !== null ? question.answers.map(answer => ({
    ...answer,
    created: new Date(question.created.substr(0, 19))
  })) : []
});

const questions: QuestionData[] = [
    {
      questionId: 1,
      title: 'Why should I learn TypeScript?',
      content:
        'TypeScript seems to be getting popular so I wondered whether it is worth my time learning it? What benefits does it give over JavaScript?',
      userName: 'Bob',
      created: new Date(),
      answers: [
        {
          answerId: 1,
          content: 'To catch problems earlier speeding up your developments',
          userName: 'Jane',
          created: new Date(),
        },
        {
          answerId: 2,
          content:
            'So, that you can use the JavaScript features of tomorrow, today',
          userName: 'Fred',
          created: new Date(),
        },
      ],
    },
    {
      questionId: 2,
      title: 'Which state management tool should I use?',
      content:
        'There seem to be a fair few state management tools around for React - React, Unstated, ... Which one should I use?',
      userName: 'Bob',
      created: new Date(),
      answers: [],
    },
  ];

export const getUnansweredQuestions = async (): Promise<QuestionData[]> => {
    //await wait(1000);
    //return questions.filter(q => q.answers.length === 0);
    let unansweredQuestions: QuestionData[] = [];

    //call api/questions/unanswered
    /*await fetch("http://localhost:5000/api/questions/unanswered")
      .then(res => res.json())
      .then(body => {
        //put response body in the unansweredQuestions
        unansweredQuestions = body;
      })
      .catch(err => {
        console.log(err);
      });

    return unansweredQuestions.map(question => ({
      ...question,
      created: new Date(question.created)
    }));*/

    try {
      const result = await http<
        undefined,
        QuestionDataFromServer[]
      >({
        path: "/questions/unanswered"
      });

      if (result.parsedBody) {
        return result.parsedBody.map(mapQuestionFromServer);
      }
      else {
        return [];
      }      
    }
    catch (ex) {
      console.log(ex);
      return [];
    }
};

const wait = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const getQuestion = async (questionId: number) : Promise<QuestionData | null> => {
    /*await wait(1000);
    const results = questions.filter(q => q.questionId === questionId);
    return results.length === 0 ? null : results[0];*/
    try {
      const result = await http<undefined, QuestionDataFromServer>({
        path: `/questions/${questionId}`
      });

      console.log(result);

      if (result.ok && result.parsedBody) {
        console.log(result.parsedBody);
        return mapQuestionFromServer(result.parsedBody);
      }
      else {
        return null;
      }
    }
    catch (ex) {
      console.log(ex);
      return null;
    }
};

export const searchQuestions = async (criteria: string): Promise<QuestionData[]> => {
    /*await wait(1000);
    return questions.filter(
        q => q.title.toLowerCase().indexOf(criteria.toLowerCase()) >= 0 ||
        q.content.toLowerCase().indexOf(criteria.toLowerCase()) >= 0
    );*/

    try {
      const result = await http<undefined, QuestionDataFromServer[]>({
        path: `/questions?search=${criteria}`
      });

      if (result.ok && result.parsedBody) {
        return result.parsedBody.map(mapQuestionFromServer);
      }
      else {
        return [];
      }
    }
    catch (ex) {
      console.log(ex);
      return [];
    }
};

export interface PostQuestionData {
    title: string;
    content: string;
    userName: string;
    created: Date;
}

export const postQuestion = async (
    question: PostQuestionData
): Promise<QuestionData | undefined> => {
    /*await wait(1000);
    const questionId = Math.max( ...questions.map(q => q.questionId)) + 1;
    const newQuestion: QuestionData = {
        ...question,
        questionId,
        answers: []
    };
    questions.push(newQuestion);
    return newQuestion;*/

    const accessToken = await getAccessToken();

    try {
      const result = await http<PostQuestionData, QuestionDataFromServer>({path: "/questions", method: "post", body: question, accessToken});

      if (result.ok && result.parsedBody) {
          return mapQuestionFromServer(result.parsedBody);
      }
      else {
          return undefined;
      }
    }
    catch (ex) {
        console.log(ex);
        return undefined;
    }
}

export interface PostAnswerData {
    questionId: number;
    content: string;
    userName: string;
    created: Date;
}

export const postAnswer = async (
    answer: PostAnswerData
): Promise<AnswerData | undefined> => {
    /*await wait(1000);
    const question = questions.filter(
        q => q.questionId === answer.questionId
    )[0];
    const answerInQuestion: AnswerData = {
        answerId: 99,
        ...answer
    };
    question.answers.push(answerInQuestion);
    return answerInQuestion;*/

    const accessToken = await getAccessToken();

    try {
        const result = await http<PostAnswerData, AnswerData>({
            path: "/questions/answer",
            method: "post",
            body: answer,
            accessToken
        });

        if (result.ok) {
            return result.parsedBody;
        }
        else {
            return undefined;
        }
    }
    catch (ex) {
        console.log(ex);
        return undefined;
    }
}