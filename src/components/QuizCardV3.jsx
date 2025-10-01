import React from 'react';
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export default function QuizCardV3({ quiz, index, answer, onAnswerChange, disabled }) {
  const questionType = quiz.question_type || 'multiple_choice';

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: 6,
      padding: 16,
      marginBottom: 24,
      backgroundColor: '#f9f9f9',
    }}>
      {/*
      <h3 style={{ marginBottom: 12 }}>
        {index !== null ? (
          <span style={{ color: '#007bff' }}>Câu {index + 1}:</span>
        ) : null} {quiz.question}
      </h3>
        */}
        <h3 style={{ marginBottom: 12 }}>
  {quiz.question_type === 'suggestion' ? (
    <span style={{ color: '#28a745' }}>Câu gợi ý:</span>
  ) : index !== null ? (
    <span style={{ color: '#007bff' }}>Câu {index + 1}:</span>
  ) : null}{' '}
  {quiz.question}
</h3>



      {quiz.question_image && (
        <div style={{ marginBottom: 12 }}>
          <img
            src={quiz.question_image}
            alt="question"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 6 }}
          />
        </div>
      )}

      {/* Hint */}
     {/* {quiz.hint && (
        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: 12 }}>
          💡 Gợi ý: {quiz.hint}
        </p>
      )} */}
      
        {quiz.hint && (
        <p style={{ fontStyle: 'italic', color: '#555', marginBottom: 12 }}>
          💡 Gợi ý:{' '}
          {isValidURL(quiz.hint) ? (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.open(quiz.hint, '_blank', 'width=800,height=600');
              }}
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              {quiz.hint}
            </a>
          ) : (
            quiz.hint
          )}
        </p>
      )}

      {/* Audio */}
      {quiz.audio_url && (
        <audio controls style={{ marginBottom: 12, width: '100%' }}>
          <source src={quiz.audio_url} type="audio/mpeg" />
          Trình duyệt của bạn không hỗ trợ audio.
        </audio>
      )}

      {/* Multiple choice */}
      {questionType === 'multiple_choice' && Array.isArray(quiz.options) && (
        <div>
          {quiz.options.map((option, idx) => (
            <label
              key={idx}
              style={{
                display: 'block',
                marginBottom: 12,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <input
                type="radio"
                name={`quiz-${quiz.id}`}
                value={idx}
                checked={answer === idx}
                disabled={disabled}
                onChange={() => !disabled && onAnswerChange(quiz.id, idx)}
                style={{ marginRight: 10 }}
              />
              <strong>{String.fromCharCode(65 + idx)}.</strong> {option?.value}
              {option?.image && option.image.trim() !== '' && (
                <div style={{ marginTop: 6, marginLeft: 28 }}>
                  <img
                    src={option.image}
                    alt={`option-${idx + 1}`}
                    style={{ maxWidth: 250, height: 'auto', borderRadius: 4 }}
                  />
                </div>
              )}
            </label>
          ))}
        </div>
      )}

      {/* Short answer */}
      {questionType === 'short_answer' && (
        <textarea
          value={answer || ''}
          onChange={(e) => !disabled && onAnswerChange(quiz.id, e.target.value)}
          disabled={disabled}
          rows={3}
          placeholder="Nhập câu trả lời của bạn..."
          style={{
            width: '100%',
            maxWidth: 300,
            padding: 10,
            fontSize: '1rem',
            borderRadius: 6,
            border: '1px solid #ccc',
          }}
        />
      )}
    </div>
  );
}
