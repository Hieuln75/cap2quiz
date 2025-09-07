import React, { useState } from 'react';
import QuizForm from '../components/QuizForm';
import QuizList from '../components/QuizList';

export default function Home() {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleAddQuiz = () => {
    // dùng để kích hoạt refresh danh sách nếu cần
    setRefreshFlag((prev) => !prev);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Quản lý câu hỏi Quiz</h1>
      <QuizForm onAdd={handleAddQuiz} />
      <hr />
      {/* Để QuizList có thể reload lại khi thêm câu hỏi, 
          ta có thể truyền key */}
      <QuizList key={refreshFlag} />
    </div>
  );
}
