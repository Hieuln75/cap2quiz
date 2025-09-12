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

export default function ResultSummary({ timeSpent, onRetake, quizzes, answers }) {
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


{/*
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
  --code cũ



// components/ResultSummary.js
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

export default function ResultSummary({ timeSpent, onRetake, quizzes, answers }) {
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
    <div style={{ padding: 24, maxWidth: 700, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>Kết quả bài thi</h2>
      <p>Thời gian làm bài: {formatTime(timeSpent)}</p>
      <p>Tổng câu hỏi: {total}</p>
      <p>Số câu trả lời đúng: {correctCount}</p>
      <p>Điểm: {(correctCount / total * 10).toFixed(1)} / 10</p>

      <button
        onClick={onRetake}
        style={{
          marginTop: 24,
          padding: '12px 24px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: 6,
        }}
      >
        Làm lại
      </button>
    </div>
  );
}
*/}

