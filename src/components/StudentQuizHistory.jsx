import React, { useEffect, useState } from 'react';
import nhost from '../services/nhost';
import { useUserData, useAuthenticationStatus } from '@nhost/react';


function normalizeAnswer(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();
}
export default function StudentQuizHistory() {
  const user = useUserData();
  const { isAuthenticated } = useAuthenticationStatus();

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [quizDetails, setQuizDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentSubmissions = async () => {
    let query;
    let variables = {};

    if (!isAuthenticated) {
      // Guest xem tất cả
      query = `
        query {
          quizzes_submission(
            order_by: { created_at: desc }
            limit: 8
          ) {
            id
            created_at
            topic
          }
        }
      `;
    } else {
      // Người đăng nhập chỉ xem bài của họ
      query = `
        query($user_id: uuid!) {
          quizzes_submission(
            where: { user_id: { _eq: $user_id } }
            order_by: { created_at: desc }
            limit: 8
          ) {
            id
            created_at
            topic
          }
        }
      `;
      variables = { user_id: user.id };
    }

    try {
      const res = await nhost.graphql.request(query, variables);
      setSubmissions(res.data?.quizzes_submission || []);
    } catch (error) {
      console.error('[fetchRecentSubmissions] Error:', error);
      setSubmissions([]);
    }
  };

  const fetchQuizDetails = async (submissionId) => {
    setLoading(true);
    setQuizDetails([]);

    const query = `
      query($submission_id: uuid!) {
        quiz_answers(
          where: { submission_id: { _eq: $submission_id } }
        ) {
          id
          quiz {
            question
            question_type
            correct_index
            correct_answer_text
            options
          }
          selected_index
          short_answer
        }
      }
    `;
    try {
      const res = await nhost.graphql.request(query, { submission_id: submissionId });
      setQuizDetails(res.data?.quiz_answers || []);
    } catch (error) {
      console.error('[fetchQuizDetails] Error:', error);
      setQuizDetails([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecentSubmissions();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: 'auto' }}>
      <h2 style={{ marginBottom: 16 }}>📜 Lịch sử làm bài gần nhất</h2>

      <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
        {submissions.length === 0 && <p>Không có dữ liệu bài làm nào.</p>}

        {submissions.map((submission) => (
          <li key={submission.id} style={{ marginBottom: 12 }}>
            <button
              onClick={() => {
                setSelectedSubmission(submission.id);
                fetchQuizDetails(submission.id);
              }}
              style={{
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                padding: '10px 16px',
                width: '100%',
                textAlign: 'left',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              🧑 Bài làm : {submission.topic || '<Chưa có chủ đề>'} |🕒 {new Date(submission.created_at).toLocaleString()}
            </button>
          </li>
        ))}
      </ul>

      {selectedSubmission && (
        <div style={{ marginTop: 40 }}>
          <h3>📋 Chi tiết bài làm</h3>
          {loading ? (
            <p>⏳ Đang tải...</p>
          ) : (
            <>
              {(() => {
                let visibleIndex = 0;
                return quizDetails.map((qa) => {
                  const isSuggestion = qa.quiz.question_type === 'suggestion';

                  // Đặt label câu hỏi
                  const questionLabel = isSuggestion ? 'Câu gợi ý' : `Câu ${++visibleIndex}`;

                  // Tính đúng sai (bỏ qua câu suggestion)
                  const isCorrect = isSuggestion
                    ? null
                    : qa.quiz.question_type === 'multiple_choice'
                      ? qa.selected_index === qa.quiz.correct_index
                      //: (qa.short_answer || '').trim().toLowerCase() === (qa.quiz.correct_answer_text || '').trim().toLowerCase();
                        : (() => {
  const correctAnswers = String(qa.quiz.correct_answer_text || '')
    .split('//')
    .map(ans => normalizeAnswer(ans.trim()));

  const normalizedUserAnswer = normalizeAnswer(qa.short_answer);
  return correctAnswers.includes(normalizedUserAnswer);
})()

                  return (
                    <div
                      key={qa.id}
                      style={{
                        padding: 16,
                        marginBottom: 16,
                        border: '2px solid',
                        borderColor: isSuggestion ? '#ccc' : (isCorrect ? '#28a745' : '#dc3545'),
                        borderRadius: 6,
                        backgroundColor: isSuggestion ? '#f0f0f0' : (isCorrect ? '#e8f5e9' : '#fdecea'),
                      }}
                    >
                      <p style={{ fontWeight: 'bold' }}>
                        {questionLabel}: {qa.quiz.question}
                      </p>

                      {!isSuggestion && qa.quiz.question_type === 'multiple_choice' && (
                        <>
                          <p>✅ Đúng: {qa.quiz.options?.[qa.quiz.correct_index]?.value}</p>
                          <p>🧑 Bạn chọn: {qa.quiz.options?.[qa.selected_index]?.value || <i>Không chọn</i>}</p>
                        </>
                      )}
                    {/*
                      {!isSuggestion && qa.quiz.question_type === 'short_answer' && (
                        <>
                          <p>✅ Đúng: {qa.quiz.correct_answer_text}</p>
                          <p>🧑 Bạn viết: {qa.short_answer || <i>Không trả lời</i>}</p>
                        </>
                      )} */}

                      {!isSuggestion && qa.quiz.question_type === 'short_answer' && (
  <>
    <p>✅ Đáp án đúng:</p>
    <ul style={{ paddingLeft: '1.5rem' }}>
      {String(qa.quiz.correct_answer_text || '')
        .split('//')
        .map((ans, idx) => (
          <li key={idx}><code>{ans.trim()}</code></li>
        ))}
    </ul>
    <p>🧑 Bạn viết: <strong>{qa.short_answer || <i>Không trả lời</i>}</strong></p>
  </>
)}




                      {!isSuggestion && (
                        <p style={{ fontWeight: 'bold', color: isCorrect ? '#28a745' : '#dc3545' }}>
                          {isCorrect ? '✅ Đúng' : '❌ Sai'}
                        </p>
                      )}

                      {isSuggestion && (
                        <p style={{ fontStyle: 'italic', color: '#555' }}>
                          (Đây là câu gợi ý, không chấm điểm)
                        </p>
                      )}
                    </div>
                  );
                });
              })()}
            </>
          )}
        </div>
      )}
    </div>
  );
}

