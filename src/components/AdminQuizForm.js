

import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';

export default function AdminQuizForm() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const [quizList, setQuizList] = useState([]); // danh sách câu hỏi

  // Hàm lấy danh sách câu hỏi từ backend
  const fetchQuizzes = async () => {
    const query = `
      query {
        quizzes(order_by: {created_at: desc}) {
          id
          topic
          question
          options
          correct_index
        }
      }
    `;
    try {
      const res = await nhost.graphql.request(query);
      if (res.error) {
        console.error('Lỗi lấy danh sách câu hỏi:', res.error);
        return;
      }
      setQuizList(res.data.quizzes);
    } catch (error) {
      console.error('Lỗi lấy danh sách câu hỏi:', error);
    }
  };

  // Lấy danh sách câu hỏi khi component mount
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic || !question || options.some(opt => !opt) || correctIndex === null) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    setLoading(true);
    try {
      const mutation = `
        mutation InsertQuiz($topic: String!, $question: String!, $options: jsonb!, $correct_index: Int!) {
          insert_quizzes_one(object: {
            topic: $topic,
            question: $question,
            options: $options,
            correct_index: $correct_index
          }) {
            id
          }
        }
      `;

      const variables = {
        topic,
        question,
        options: options.map(opt => ({ type: 'text', value: opt })),
        correct_index: correctIndex,
      };

      const res = await nhost.graphql.request(mutation, variables);
      if (res.error) {
        alert('❌ Lỗi khi thêm câu hỏi');
        console.error(res.error);
      } else {
        alert('✅ Đã thêm câu hỏi!');
        // Reset form
        setTopic('');
        setQuestion('');
        setOptions(['', '', '', '']);
        setCorrectIndex(null);
        // Lấy lại danh sách câu hỏi mới nhất
        fetchQuizzes();
      }
    } catch (error) {
      console.error(error);
      alert('❌ Lỗi khi thêm câu hỏi');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Thêm câu hỏi</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Chủ đề:</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div>
          <label>Câu hỏi:</label>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>
        <div>
          <label>Đáp án:</label>
          {options.map((opt, i) => (
            <div key={i}>
              <input
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
              />
            </div>
          ))}
        </div>
        <div>
          <label>Chọn đáp án đúng:</label>
          <select
            value={correctIndex ?? ''}
            onChange={(e) => setCorrectIndex(Number(e.target.value))}
          >
            <option value="">-- Chọn --</option>
            {[0, 1, 2, 3].map(i => (
              <option key={i} value={i}>
                Đáp án {i + 1}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu câu hỏi'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Danh sách câu hỏi đã lưu</h3>
      {quizList.length === 0 ? (
        <p>Chưa có câu hỏi nào.</p>
      ) : (
        <ul>
          {quizList.map((quiz) => (
            <li key={quiz.id} style={{ marginBottom: 15 }}>
              <b>Chủ đề:</b> {quiz.topic} <br />
              <b>Câu hỏi:</b> {quiz.question} <br />
              <b>Đáp án:</b>
              <ul>
                {quiz.options.map((opt, i) => (
                  <li key={i}>
                    {i === quiz.correct_index ? <b>(Đáp án đúng) </b> : null}
                    {opt.value}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
