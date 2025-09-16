import React, { useState } from 'react';
import useQuizzesV3 from '../hooks/useQuizzesV3';
import QuizCardV3 from './QuizCardV3';
import ResultSummaryV3 from './ResultSummaryV3';
import TimerBadge from './TimerBadge';
import useTimer from '../hooks/useTimer';
import * as api from '../services/quizAPIV3';
export default function StudentQuizTest() {
  const {
    subjects,
    topics,
    quizzes,
    selectedSubject,
    setSelectedSubject,
    selectedTopic,
    setSelectedTopic,
  } = useQuizzesV3();

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const { time, reset } = useTimer(!submitted && quizzes.length > 0);


  const onAnswerChange = (quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  };

 

const handleSubmit = async () => {
  const unanswered = quizzes
    .filter(q => q.question_type !== 'suggestion')
    .filter(q => {
      const a = answers[q.id];
      if (q.question_type === 'short_answer') {
        return !a || a.trim() === '';
      }
      return a === undefined || a === null;
    });

  if (unanswered.length > 0) {
    const questionNumbers = unanswered.map(q => quizzes.indexOf(q) + 1).join(', ');
    const confirmSubmit = window.confirm(
      `⚠️ Bạn chưa trả lời các câu: ${questionNumbers}.\nBạn có chắc chắn muốn nộp bài không?`
    );
    if (!confirmSubmit) return;
  }

  try {
    const answerPayload = quizzes.map((q) => {
      const answer = answers[q.id];
      return {
        quiz_id: q.id,
        selected_index: q.question_type === 'multiple_choice' ? answer ?? -1 : null,
        short_answer: q.question_type === 'short_answer' ? answer ?? '' : null,
      };
    });

await api.submitFullQuiz({
  quizzes,
  answers,
  studentName: studentName.trim(),
  topic: selectedTopic, // 🆕 Truyền thêm topic từ state
});

    alert('✅ Nộp bài thành công!');
    setSubmitted(true);
  } catch (error) {
    console.error('❌ Lỗi khi gửi bài:', error);
    alert('❌ Gửi bài thất bại, vui lòng thử lại.');
  }
};


  const handleRetake = () => {
    setSubmitted(false);
    setSelectedSubject('');
    setSelectedTopic('');
    setAnswers({});
    setStudentName('');
   reset(); // dùng reset từ useTimer
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
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#ff4081' }}>
              👧🏻📚 Chọn chủ đề
            </p>

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
              <option value="">-- Chọn đề thi --</option>
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
          {quizzes.map((quiz, index) => (
            <QuizCardV3
              key={quiz.id}
              quiz={quiz}
              index={index}
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
        <ResultSummaryV3
          timeSpent={time}
          onRetake={handleRetake}
          quizzes={quizzes}
          answers={answers}
          studentName={studentName}   // thêm dòng này
          topic={selectedTopic}       // thêm dòng này
        />
      )}
    </div>
  );
}
