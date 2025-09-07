import React, { useState } from 'react';
import { addQuiz } from '../api/quizzes';

export default function QuizForm({ onAdd }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return;
    }

    setLoading(true);

    try {
      const newQuiz = await addQuiz(question.trim());
      setQuestion('');
      if (onAdd) onAdd(newQuiz);
      alert('Thêm câu hỏi thành công!');
    } catch (error) {
      console.error(error);
      alert('Lỗi khi thêm câu hỏi');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input
        type="text"
        placeholder="Nhập câu hỏi"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={loading}
        style={{ width: 300, marginRight: 10 }}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Đang thêm...' : 'Thêm câu hỏi'}
      </button>
    </form>
  );
}
