/*
import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';

export default function StudentQuizTest() {
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');

  // Lấy danh sách câu hỏi
  const fetchQuizzes = async () => {
    const query = `
      query {
        quizzes(order_by: {created_at: desc}) {
          id
          question
          options
          correct_index
        }
      }
    `;

    try {
      const res = await nhost.graphql.request(query);
      console.log('📥 Fetch quizzes response:', res);

      if (res.error || res.errors) {
        console.error('❌ Lỗi GraphQL khi lấy câu hỏi:', res.error || res.errors);
        return;
      }

      if (!res.data || !res.data.quizzes) {
        console.warn('⚠️ Không có dữ liệu trả về từ server');
        return;
      }

      setQuizzes(res.data.quizzes);
    } catch (error) {
      console.error('❌ Lỗi khi gọi fetchQuizzes:', error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Nộp bài
  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quizzes.length) {
      alert('Vui lòng trả lời hết tất cả các câu hỏi!');
      return;
    }
    if (!studentName.trim()) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }

    setLoading(true);

    try {
      for (const quiz of quizzes) {
        const selected_index = answers[quiz.id];

        const mutation = `
          mutation InsertAnswer($quiz_id: uuid!, $student_id: String, $selected_index: Int!) {
            insert_quiz_answers_one(object: {
              quiz_id: $quiz_id,
              student_id: $student_id,
              selected_index: $selected_index
            }) {
              id
            }
          }
        `;

        const variables = {
          quiz_id: quiz.id,
          student_id: studentName.trim(),
          selected_index,
        };

        const res = await nhost.graphql.request(mutation, variables);
        console.log('📤 Insert answer response:', res);

        if (res.error || res.errors) {
          console.error('❌ Lỗi khi lưu câu trả lời:', res.error || res.errors);
          alert('Có lỗi khi nộp bài, vui lòng thử lại!');
          setLoading(false);
          return;
        }
      }

      alert('✅ Nộp bài thành công! Cảm ơn bạn đã tham gia.');
      setSubmitted(true);
    } catch (error) {
      console.error('❌ Lỗi khi nộp bài:', error);
      alert('Có lỗi khi nộp bài, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: 'auto' }}>
      <h2>Trắc nghiệm</h2>

      {!submitted && (
        <div style={{ marginBottom: 20 }}>
          <input
            placeholder="Nhập tên của bạn"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{ padding: 8, width: '100%', maxWidth: 400 }}
            disabled={loading}
          />
        </div>
      )}

      {!submitted && quizzes.length === 0 && <p>Đang tải câu hỏi...</p>}

      {!submitted && quizzes.length > 0 && (
        <div>
          {quizzes.map((quiz, index) => (
            <div key={quiz.id} style={{ marginBottom: 20 }}>
              <p>
                <b>Câu {index + 1}:</b> {quiz.question}
              </p>
              {quiz.options.map((opt, i) => (
                <div key={i}>
                  <label>
                    <input
                      type="radio"
                      name={`answer-${quiz.id}`}
                      value={i}
                      checked={answers[quiz.id] === i}
                      onChange={() => setAnswers({ ...answers, [quiz.id]: i })}
                      disabled={loading || submitted}
                    />
                    {` ${opt.value}`}
                  </label>
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      )}

      {submitted && (
        <div>
          <h3>Bạn đã nộp bài. Cảm ơn bạn!</h3>
        </div>
      )}
    </div>
  );
} */

  // StudentQuizTest.jsx
import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';

export default function StudentQuizTest() {
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');

  const fetchQuizzes = async () => {
    const query = `
      query {
        quizzes(order_by: {created_at: desc}) {
          id
          question
          question_image
          options
        }
      }
    `;

    try {
      const res = await nhost.graphql.request(query);
      if (!res.data?.quizzes) return;
      setQuizzes(res.data.quizzes);
    } catch (error) {
      console.error('❌ Lỗi fetch:', error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quizzes.length) {
      alert('Vui lòng trả lời hết tất cả các câu hỏi!');
      return;
    }
    if (!studentName.trim()) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }

    setLoading(true);

    try {
      for (const quiz of quizzes) {
        const selected_index = answers[quiz.id];
        const mutation = `
          mutation InsertAnswer($quiz_id: uuid!, $student_id: String, $selected_index: Int!) {
            insert_quiz_answers_one(object: {
              quiz_id: $quiz_id,
              student_id: $student_id,
              selected_index: $selected_index
            }) {
              id
            }
          }
        `;
        await nhost.graphql.request(mutation, {
          quiz_id: quiz.id,
          student_id: studentName.trim(),
          selected_index,
        });
      }
      alert('✅ Nộp bài thành công!');
      setSubmitted(true);
    } catch (error) {
      console.error('❌ Submit error:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: 'auto' }}>
      <h2>Trắc nghiệm</h2>

      {!submitted && (
        <>
          <input
            placeholder="Nhập tên của bạn"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{ padding: 8, width: '100%', maxWidth: 400 }}
            disabled={loading}
          />
          <br /><br />
        </>
      )}

      {!submitted && quizzes.length === 0 && <p>Đang tải câu hỏi...</p>}

      {!submitted && quizzes.length > 0 && (
        <div>
          {quizzes.map((quiz, index) => (
            <div key={quiz.id} style={{ marginBottom: 20 }}>
              <p><b>Câu {index + 1}:</b> {quiz.question}</p>
              {quiz.question_image && (
                <img src={quiz.question_image} alt="question" width="200" />
              )}
              {quiz.options.map((opt, i) => (
                <div key={i}>
                  <label>
                    <input
                      type="radio"
                      name={`answer-${quiz.id}`}
                      value={i}
                      checked={answers[quiz.id] === i}
                      onChange={() => setAnswers({ ...answers, [quiz.id]: i })}
                      disabled={loading || submitted}
                    />
                    {' '}{opt.value}
                  </label>
                  {opt.image && (
                    <div><img src={opt.image} alt={`Đáp án ${i + 1}`} width="150" /></div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang nộp...' : 'Nộp bài'}
          </button>
        </div>
      )}

      {submitted && (
        <div>
          <h3>Bạn đã nộp bài. Cảm ơn bạn!</h3>
        </div>
      )}
    </div>
  );
}

