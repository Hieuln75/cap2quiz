import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';


export default function StudentQuizTest() {
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const query = `
        query {
          quizzes {
            id
            question
            options
            correct_index
          }
        }
      `;
      try {
        const res = await nhost.graphql.request(query);
        setQuizzes(res.data.quizzes);
      } catch (error) {
        console.error('Lỗi khi lấy câu hỏi:', error);
      }
    };
    fetchQuizzes();
  }, []);

  const handleSubmit = async () => {
    if (!studentName.trim()) {
      alert('Vui lòng nhập tên trước khi nộp bài');
      return;
    }
    if (Object.keys(answers).length !== quizzes.length) {
      alert('Vui lòng trả lời hết các câu hỏi');
      return;
    }

    setLoading(true);
    try {
      const mutations = quizzes.map((quiz) => {
        const selected = answers[quiz.id];
        return nhost.graphql.request(
          `
          mutation InsertAnswer($quiz_id: uuid!, $student_name: String!, $selected_index: Int!) {
            insert_quiz_answers_one(object: {
              quiz_id: $quiz_id,
              student_id: null,
              student_name: $student_name,
              selected_index: $selected_index
            }) {
              id
            }
          }
        `,
          {
            quiz_id: quiz.id,
            student_name: studentName,
            selected_index: selected,
          }
        );
      });

      await Promise.all(mutations);
      setSubmitted(true);
      alert('✅ Đã nộp bài!');
    } catch (error) {
      console.error('Lỗi khi nộp bài:', error);
      alert('❌ Có lỗi xảy ra khi nộp bài');
    }
    setLoading(false);
  };

  if (quizzes.length === 0) return <p>Đang tải câu hỏi...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Làm bài trắc nghiệm</h2>
      {!submitted && (
        <div style={{ marginBottom: 20 }}>
          <input
            placeholder="Nhập tên của bạn"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{ padding: 8, width: '100%', maxWidth: 300 }}
            disabled={loading}
          />
        </div>
      )}

      {quizzes.map((quiz, idx) => (
        <div key={quiz.id} style={{ marginBottom: 20 }}>
          <h4>
            Câu {idx + 1}: {quiz.question}
          </h4>
          {quiz.options.map((opt, i) => {
            const isCorrect = i === quiz.correct_index;
            const isSelected = answers[quiz.id] === i;
            return (
              <div key={i}>
                <label>
                  <input
                    type="radio"
                    name={`quiz-${quiz.id}`}
                    value={i}
                    disabled={submitted || loading}
                    checked={isSelected}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [quiz.id]: i }))
                    }
                    style={{ marginRight: 8 }}
                  />
                  {opt.value}
                  {submitted && isCorrect && ' ✅'}
                  {submitted && isSelected && !isCorrect && ' ❌'}
                </label>
              </div>
            );
          })}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 20, padding: '8px 20px' }}
        >
          {loading ? 'Đang nộp bài...' : 'Nộp bài'}
        </button>
      )}
    </div>
  );
}
