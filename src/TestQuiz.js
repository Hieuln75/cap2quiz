/*// TestQuiz.js
import React, { useState, useEffect } from 'react';
import nhost from './nhost';

export default function TestQuiz() {
  const [question, setQuestion] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await nhost.graphql.request(`
        query {
          quizzes {
            id
            question
            created_at
          }
        }
      `);
      if (response.error) {
        console.error('GraphQL error:', response.error);
      } else {
        setQuizzes(response.data.quizzes);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const addQuiz = async () => {
    if (!question.trim()) {
      alert('Nhập câu hỏi trước đã');
      return;
    }
    setLoading(true);
    try {
      const mutation = `
        mutation ($question: String!) {
          insert_quizzes_one(object: { question: $question }) {
            id
            question
          }
        }
      `;
      const variables = { question };
      const response = await nhost.graphql.request(mutation, variables);
      if (response.error) {
        console.error('GraphQL error:', response.error);
        alert('Lỗi khi thêm câu hỏi');
      } else {
        alert('Thêm câu hỏi thành công');
        setQuestion('');
        fetchQuizzes(); // load lại danh sách
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi thêm câu hỏi');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Test CRUD với Nhost</h2>

      <input
        type="text"
        placeholder="Nhập câu hỏi"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={loading}
        style={{ width: '300px', marginRight: 10 }}
      />
      <button onClick={addQuiz} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Thêm câu hỏi'}
      </button>

      <h3 style={{ marginTop: 30 }}>Danh sách câu hỏi:</h3>
      {loading && !quizzes.length ? (
        <p>Đang tải...</p>
      ) : (
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <strong>{quiz.question}</strong> - <em>{new Date(quiz.created_at).toLocaleString()}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
*/