import React, { useState } from 'react';
import useQuizzes from '../hooks/useQuizzes';
import useTimer from '../hooks/useTimer';
import QuizCard from './QuizCard';
import ResultSummary from './ResultSummary';
import TimerBadge from './TimerBadge';
import * as api from '../services/quizAPI';


export default function StudentQuizTestV2() {
  const {
    subjects,
    topics,
    quizzes,
    selectedSubject,
    setSelectedSubject,
    selectedTopic,
    setSelectedTopic,
  } = useQuizzes();

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const { time, reset } = useTimer(!submitted && quizzes.length > 0);

  const onAnswerChange = (quizId, index) => {
    setAnswers(prev => ({ ...prev, [quizId]: index }));
  };

  const handleSubmit = async () => {
    if (!window.confirm('Bạn làm chưa xong, có chắc muốn nộp bài không?')) return;

    try {
      for (const quiz of quizzes) {
        const selected_index = answers[quiz.id] !== undefined ? answers[quiz.id] : -1;
        await api.submitAnswer({
          quiz_id: quiz.id,
          student_id: studentName.trim(),
          selected_index,
        });
      }
      alert('✅ Nộp bài thành công!');
      setSubmitted(true);
    } catch (error) {
      console.error('❌ Submit error:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleRetake = () => {
    setSubmitted(false);
    setSelectedSubject('');
    setSelectedTopic('');
    setAnswers({});
    setStudentName('');
    reset();
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: 'auto', fontFamily: 'sans-serif', position: 'relative' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: 20 }}>📝 Trắc nghiệm</h2>

      {!submitted && quizzes.length > 0 && <TimerBadge time={time} />}

      {!submitted && (
        <>
          <input
            placeholder="Nhập tên của bạn (không bắt buộc)"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            style={{
              padding: 12,
              width: '100%',
              maxWidth: 500,
              fontSize: '1.2rem',
              marginBottom: 16,
              borderRadius: 6,
              border: '1px solid #ccc',
            }}
          />

                  
<div style={{ marginBottom: 16 }}>
  <p>Chọn môn học:</p>
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
    {subjects.map((subject, idx) => (
      <button
        key={idx}
        onClick={() => !submitted && setSelectedSubject(subject)}
        disabled={quizzes.length > 0}
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          border: selectedSubject === subject ? '2px solid #007bff' : '1px solid #ccc',
          backgroundColor: selectedSubject === subject ? '#e0f0ff' : 'white',
          cursor: quizzes.length > 0 ? 'not-allowed' : 'pointer',
          fontWeight: selectedSubject === subject ? 'bold' : 'normal',
        }}
      >
        {subject}
      </button>
    ))}
  </div>
</div>
            

          {selectedSubject && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={quizzes.length > 0}
              style={{
                padding: 12,
                width: '100%',
                maxWidth: 700,
                fontSize: '1.2rem',
                marginBottom: 24,
                borderRadius: 6,
                border: '1px solid #ccc',
              }}
            >
              <option value="">-- Chọn chủ đề --</option>
              {topics.map((topic, idx) => (
                <option key={idx} value={topic}>{topic}</option>
              ))}
            </select>
          )}
        </>
      )}

      {!submitted && selectedTopic && quizzes.length === 0 && (
        <p style={{ fontSize: '1.1rem' }}>Không có câu hỏi nào cho chủ đề này.</p>
      )}

      {!submitted && quizzes.length > 0 && (
        <div>
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              answer={answers[quiz.id]}
              onAnswerChange={onAnswerChange}
              disabled={submitted}
            />
          ))}

          <button
            disabled={quizzes.length === 0 || Object.keys(answers).length === 0}
            onClick={handleSubmit}
            style={{
              padding: '14px 24px',
              fontSize: '1.3rem',
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 6,
            }}
          >
            Nộp bài
          </button>
        </div>
      )}

      {submitted && (
        <ResultSummary timeSpent={time}
         onRetake={handleRetake} 
          quizzes={quizzes}
        answers={answers}
         />
      )}
    </div>
  );
}
