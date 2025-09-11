import React from 'react';

export default function QuizCard({ quiz,index, answer, onAnswerChange, disabled }) {
  return (
    <div
      style={{
        marginBottom: 32,
        padding: 20,
        border: '1px solid #ccc',
        borderRadius: 8,
        background: '#f9f9f9',
      }}
    >
 <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 12 }}>
  <span style={{ color: '#007bff', fontWeight: 'bold' }}>
    Câu {index + 1}:
  </span>{' '}
  {quiz.question}
</p>

      {quiz.question_image && quiz.question_image.trim() !== '' && (
        <div style={{ marginBottom: 16 }}>
          <img
            src={quiz.question_image}
            alt="question"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 6 }}
          />
        </div>
      )}

      {quiz.options.map((opt, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.7 : 1,
            }}
          >
            <input
              type="radio"
              name={`answer-${quiz.id}`}
              value={i}
              checked={answer === i}
              onChange={() => onAnswerChange(quiz.id, i)}
              disabled={disabled}
              style={{ transform: 'scale(1.2)' }}
            />
              <strong>{String.fromCharCode(65 + i)}.</strong> {opt.value}

          </label>

          {opt.image && opt.image.trim() !== '' && (
            <div style={{ marginLeft: 28, marginTop: 6 }}>
              <img
                src={opt.image}
                alt={`option-${i + 1}`}
                style={{ maxWidth: 250, height: 'auto', borderRadius: 6 }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
