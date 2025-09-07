import React, { useEffect, useState } from 'react';
import { getQuizzes } from '../api/quizzes';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải danh sách câu hỏi');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  if (loading) return <p>Đang tải danh sách câu hỏi...</p>;

  if (quizzes.length === 0) return <p>Chưa có câu hỏi nào.</p>;

  return (
    <ul>
      {quizzes.map((quiz) => (
        <li key={quiz.id}>
          <strong>{quiz.question}</strong> -{' '}
          <em>{new Date(quiz.created_at).toLocaleString()}</em>
        </li>
      ))}
    </ul>
  );
}
