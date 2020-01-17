using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using QandA.Data;
using QandA.Data.Models;
using QandA.Hubs;

namespace QandA.Controllers
{
    [Route("/api/[controller]")]
    [ApiController]
    public class QuestionsController: ControllerBase
    {
        private readonly IDataRepository _dataRepository;
        private readonly IHubContext<QuestionsHub> _questionHubContext;

        public QuestionsController(IDataRepository dataRepository, IHubContext<QuestionsHub> questionHubContext)
        {
            _dataRepository = dataRepository;
            _questionHubContext = questionHubContext;
        }

        [HttpGet]
        public IEnumerable<QuestionGetManyResponse> GetQuestions(string search, bool includeAnswers, int page = 1, int pageSize = 20)
        {
            //var questions = _dataRepository.GetQuestions();
            //return questions;

            if (string.IsNullOrEmpty(search))
            {
                if (includeAnswers)
                {
                    return _dataRepository.GetQuestionsWithAnswers();
                }
                else
                {
                    return _dataRepository.GetQuestions();
                }                
            }
            else
            {
                //return _dataRepository.GetQuestionsBySearch(search);
                return _dataRepository.GetQuestionsBySearchWithPaging(search, page, pageSize);
            }
        }

        /*[HttpGet("unanswered")]
        public IEnumerable<QuestionGetManyResponse> GetUnansweredQUestions()
        {
            return _dataRepository.GetUnansweredQuestions();
        }*/

        [HttpGet("unanswered")]
        public async Task<IEnumerable<QuestionGetManyResponse>> GetUnansweredQuestions()
        {
            return await _dataRepository.GetUnansweredQuestionsAsync();
        }        

        [HttpGet("{questionId}")]
        public ActionResult<QuestionGetSingleResponse> GetQuestion(int questionId)
        {
            var question = _dataRepository.GetQuestion(questionId);

            if (question == null)
            {
                return NotFound();
            }

            return question;
        }

        [HttpPost]
        public ActionResult<QuestionGetSingleResponse> PostQuestion(QuestionPostRequest questionPostRequest)
        {
            //var savedQuestion = _dataRepository.PostQuestion(questionPostRequest);

            var savedQuestion = _dataRepository.PostQuestion(
                new QuestionPostFullRequest{
                    Title = questionPostRequest.Title,
                    Content = questionPostRequest.Content,
                    UserId = "1",
                    UserName = "bob.test@test.com",
                    Created = DateTime.UtcNow
                }
            );

            return CreatedAtAction(
                nameof(GetQuestion),
                new { questionId = savedQuestion.QuestionId },
                savedQuestion);
        }

        [HttpPut("{questionId}")]
        public ActionResult<QuestionGetSingleResponse> PutQuestion(int questionId, QuestionPutRequest questionPutRequest)
        {
            var question = _dataRepository.GetQuestion(questionId);

            if (question == null) {
                return NotFound();
            }

            questionPutRequest.Title = string.IsNullOrEmpty(questionPutRequest.Title) ? question.Title : questionPutRequest.Title;
            questionPutRequest.Content = string.IsNullOrEmpty(questionPutRequest.Content) ? question.Content : questionPutRequest.Content;

            var savedQuestion = _dataRepository.PutQuestion(questionId, questionPutRequest);
            return savedQuestion;
        }

        [HttpDelete("{questionId}")]
        public ActionResult DeleteQuestion(int questionId)
        {
            var question = _dataRepository.GetQuestion(questionId);

            if (question == null)
            {
                return NotFound();
            }

            _dataRepository.DeleteQuestion(questionId);
            return NoContent();
        }

        [HttpPost("answer")]
        public ActionResult<AnswerGetResponse> PostAnswer(AnswerPostRequest answerPostRequest)
        {
            var questionsExists = _dataRepository.QuestionExists(answerPostRequest.QuestionId.Value);

            if (!questionsExists)
            {
                return NotFound();
            }

            //var savedAnswer = _dataRepository.PostAnswer(answerPostRequest);

            var savedAnswer = _dataRepository.PostAnswer(new AnswerPostFullRequest{
                QuestionId = answerPostRequest.QuestionId.Value,
                Content = answerPostRequest.Content,
                UserId = "1",
                UserName = "bob.test@test.com",
                Created = DateTime.UtcNow
            });

            _questionHubContext.Clients.Group(
                $"Question-{answerPostRequest.QuestionId.Value}")
                .SendAsync(
                    "ReceiveQuestion",
                    _dataRepository.GetQuestion(answerPostRequest.QuestionId.Value)
                );
            
            return savedAnswer;
        }

    }
}