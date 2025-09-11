/*import React from 'react';

export default function ResultSummary({ timeSpent, onRetake }) {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <div style={{ marginTop: 32, textAlign: 'center' }}>
      <h3>✅ Bạn đã nộp bài thành công</h3>
      <p>Thời gian làm bài: {formatTime(timeSpent)}</p>
      <button
        onClick={onRetake}
        style={{
          padding: '12px 24px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: 6,
        }}
      >
        Làm lại bài
      </button>
    </div>
  );
}
*/
import React from 'react';

export default function ResultSummary({ timeSpent, onRetake, quizzes, answers }) {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const correctCount = quizzes.filter(
    q => answers[q.id] !== undefined && answers[q.id] === q.correct_index
  ).length;

  return (
    <div style={{ marginTop: 40 }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>
        🎉 Bạn đã nộp bài. Xem kết quả bên dưới:
      </h3>

      <p style={{ fontSize: '1.2rem', marginBottom: 12 }}>
        ✅ Số câu đúng: <strong>{correctCount} / {quizzes.length}</strong>
      </p>

      <p style={{ fontSize: '1.2rem', marginBottom: 24 }}>
        🕒 Thời gian làm bài: <strong>{formatTime(timeSpent)}</strong>
      </p>

      {quizzes.map((quiz, index) => {
        const studentAnswer = answers[quiz.id] !== undefined ? answers[quiz.id] : -1;
        const isCorrect = studentAnswer === quiz.correct_index;

        return (
          <div
            key={quiz.id}
            style={{
              marginBottom: 24,
              padding: 16,
              border: '2px solid',
              borderColor: isCorrect ? '#28a745' : '#dc3545',
              borderRadius: 8,
              backgroundColor: isCorrect ? '#e6ffed' : '#ffe6e6',
              boxShadow: isCorrect ? 'none' : '0 0 10px rgba(220,53,69,0.7)',
            }}
          >
            <p style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Câu {index + 1}: {quiz.question}
            </p>

            {quiz.question_image && quiz.question_image.trim() !== '' && (
              <img
                src={quiz.question_image}
                alt="question"
                style={{ maxWidth: '100%', borderRadius: 6, marginBottom: 8 }}
              />
            )}

            <p><strong>Đáp án đúng:</strong> {quiz.options[quiz.correct_index].value}</p>
            <p>
              <strong>Bạn chọn:</strong> {studentAnswer !== -1 ? quiz.options[studentAnswer]?.value : <i>Chưa trả lời</i>}
            </p>
            {!isCorrect && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>❌ Sai</p>}
            {isCorrect && <p style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Đúng</p>}
          </div>
        );
      })}

      <button
        onClick={onRetake}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          fontSize: '1.1rem',
          borderRadius: 6,
          border: 'none',
          backgroundColor: '#007bff',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        ← Quay lại làm bài
      </button>
    </div>
  );
}

