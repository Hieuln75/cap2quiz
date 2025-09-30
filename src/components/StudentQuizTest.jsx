// ĐÃ SỬA FILE: StudentQuizTest.jsx

import React, { useState, useEffect } from 'react';
import useQuizzesV3 from '../hooks/useQuizzesV3';
import QuizCardV3 from './QuizCardV3';
import ResultSummaryV3 from './ResultSummaryV3';
import TimerBadge from './TimerBadge';
import useTimer from '../hooks/useTimer';
import * as api from '../services/quizAPIV3';
import nhost from '../services/nhost';

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
  const { time, reset } = useTimer(!submitted && quizzes.length > 0);

  const [credit, setCredit] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(true);



  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
      setSelectedTopic('');
    }
  }, [subjects, selectedSubject, setSelectedSubject, setSelectedTopic]);

  useEffect(() => {
    const initUser = async () => {
      const user = await nhost.auth.getUser();

      if (user && user.id) {
        setUserId(user.id);
        setIsGuest(false);
      } else {
        setIsGuest(true);
      }
    };

    initUser();
  }, []);

  useEffect(() => {
    const fetchUserCredit = async () => {
      if (!userId) return;

      const query = `
        query GetUserCredit($user_id: uuid!) {
          quiz_credits_by_pk(user_id: $user_id) {
            credit_remaining
          }
        }
      `;

      try {
        const res = await nhost.graphql.request(query, { user_id: userId });
        const creditValue = res.data?.quiz_credits_by_pk?.credit_remaining;
        setCredit(creditValue ?? null);
        console.log('[User Credit] ✅', creditValue);
      } catch (error) {
        console.error('[User Credit] ❌ Lỗi khi lấy credit:', error);
      }
    };

    fetchUserCredit();
  }, [userId]);

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
      await api.submitFullQuiz({
        quizzes,
        answers,
        topic: selectedTopic,
        user_id: userId, // ✅ Dùng user_id thay cho studentName
      });

      alert('✅ Nộp bài thành công!');
      setSubmitted(true);

      if (!isGuest && credit !== null) {
        setCredit(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }
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
    reset();
  };

  return (
    <div style={{ padding: '10px 20px 20px', maxWidth: 1000, margin: 'auto', fontFamily: 'sans-serif', position: 'relative', marginTop: '-30px'}}>
      <h2 style={{ fontSize: '2rem', marginBottom: 10 }}>📝 Trắc nghiệm</h2>

      {isGuest ? (
        <div style={{ marginBottom: 16, fontSize: '1.1rem', color: 'gray' }}>
          🔓 Bạn đang làm bài với tư cách khách. Để được đầy đủ tính năng bạn nên đăng nhập.
        </div>
      ) : (
        credit !== null && (
          <div style={{ marginBottom: 16, fontSize: '1.1rem', color: '#007bff' }}>
            🔋 Số lần làm bài còn lại: <strong>{credit}</strong>
          </div>
        )
      )}

      {!submitted && quizzes.length > 0 && <TimerBadge time={time} />}

      {!submitted && (
        <>
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
          studentName="" // hoặc bỏ hẳn prop này nếu không dùng
          topic={selectedTopic}
        />
      )}
    </div>
  );
}
