import React from 'react';

function normalizeAnswer(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function isCorrect(quiz, answer) {
  if (quiz.question_type === 'multiple_choice' || quiz.question_type == null) {
    return answer === quiz.correct_index;
  }
  if (quiz.question_type === 'short_answer') {
    return normalizeAnswer(answer) === normalizeAnswer(quiz.correct_answer_text);
  }
  return false;
}

export default function ResultSummaryV3({ timeSpent, onRetake, quizzes, answers,studentName, topic }) {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const validQuizzes = quizzes.filter(q => q.question_type !== 'suggestion');
  const total = validQuizzes.length;
  const correctCount = validQuizzes.filter(q => isCorrect(q, answers[q.id])).length;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: 12 }}>📊 Kết quả bài thi</h2>
      {studentName && <p>👤 Học sinh: <strong>{studentName}</strong></p>}
      {topic && <p>📚 Chủ đề: <strong>{topic}</strong></p>}
      <p>🕒 Thời gian làm bài: <strong>{formatTime(timeSpent)}</strong></p>
      <p>📝 Tổng câu hỏi: <strong>{total}</strong></p>
      <p>✅ Số câu đúng: <strong>{correctCount}</strong></p>
      <p>🎯 Điểm: <strong>{((correctCount / total) * 10).toFixed(1)} / 10</strong></p>

      <hr style={{ margin: '24px 0' }} />

      {quizzes.map((quiz, idx) => {
        const userAnswer = answers[quiz.id];
        const correct = isCorrect(quiz, userAnswer);
        const type = quiz.question_type || 'multiple_choice';

        return (
          <div
            key={quiz.id}
            style={{
              marginBottom: 24,
              padding: 16,
              border: '2px solid',
              borderColor: correct ? '#28a745' : '#dc3545',
              backgroundColor: correct ? '#eafbe7' : '#fdeaea',
              borderRadius: 8,
            }}
          >
            <p style={{ fontWeight: 'bold' }}>
              Câu {idx + 1}: {quiz.question}
            </p>

            {quiz.question_image && (
              <img src={quiz.question_image} alt="question" style={{ maxWidth: '100%', marginBottom: 12 }} />
            )}

            {type === 'multiple_choice' && quiz.options && (
              <>
                <p>🟢 Đáp án đúng: <strong>{quiz.options[quiz.correct_index]?.value || '...'}</strong></p>
                <p>
                  🧑 Đáp án của bạn:{' '}
                  {userAnswer !== undefined
                    ? <strong>{quiz.options[userAnswer]?.value || `(Sai cú pháp: ${userAnswer})`}</strong>
                    : <em>Chưa chọn</em>}
                </p>
              </>
            )}

            {type === 'short_answer' && (
              <>
                <p>🟢 Đáp án đúng: <strong>{quiz.correct_answer_text || '(Chưa có)'}</strong></p>
                <p>🧑 Câu trả lời của bạn: {userAnswer ? <strong>{userAnswer}</strong> : <em>Chưa trả lời</em>}</p>
              </>
            )}

            {type !== 'suggestion' && (
              <p style={{ fontWeight: 'bold', color: correct ? '#28a745' : '#dc3545' }}>
                {correct ? '✅ Đúng' : '❌ Sai'}
              </p>
            )}
          </div>
        );
      })}

      <button
        onClick={onRetake}
        style={{
          marginTop: 24,
          padding: '12px 24px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 6,
        }}
      >
        🔁 Làm lại
      </button>
    </div>
  );
}
