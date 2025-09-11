import React, { useState, useEffect, useRef } from 'react';
import nhost from '../services/nhost';

export default function StudentQuizTest() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef(null);

  // Lấy topics
  const fetchTopics = async () => {
    const query = `
      query {
        quizzes(distinct_on: topic) {
          topic
        }
      }
    `;
    try {
      const res = await nhost.graphql.request(query);
      const uniqueTopics = res.data?.quizzes.map(q => q.topic).filter(Boolean);
      setTopics(uniqueTopics);
    } catch (error) {
      console.error('❌ Lỗi lấy topic:', error);
    }
  };

  // Lấy quizzes theo topic
  const fetchQuizzesByTopic = async (topic) => {
    const query = `
      query ($topic: String!) {
        quizzes(where: {topic: {_eq: $topic}}, order_by: {created_at: asc}) {
          id
          question
          question_image
          options
          correct_index
        }
      }
    `;
    try {
      const res = await nhost.graphql.request(query, { topic });
      setQuizzes(res.data?.quizzes || []);
      setAnswers({});
      setSubmitted(false);
      setTimeSpent(0);
      if (timerRef.current) clearInterval(timerRef.current);
      // Bắt đầu đếm giờ khi chọn chủ đề
      timerRef.current = setInterval(() => {
        setTimeSpent(t => t + 1);
      }, 1000);
    } catch (error) {
      console.error('❌ Lỗi fetch quiz theo topic:', error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchQuizzesByTopic(selectedTopic);
    } else {
      // Nếu bỏ chọn topic thì dừng đếm giờ
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeSpent(0);
      setQuizzes([]);
      setAnswers({});
      setSubmitted(false);
    }
    // Cleanup khi component unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedTopic]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };

  const handleSubmit = async () => {
    const confirmSubmit = window.confirm('Bạn làm chưa xong, có chắc muốn nộp bài không?');
    if (!confirmSubmit) return;

    setLoading(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      for (const quiz of quizzes) {
        const selected_index = answers[quiz.id] !== undefined ? answers[quiz.id] : -1; // -1 = chưa trả lời
        const mutation = `
          mutation InsertAnswer($quiz_id: uuid!, $student_id: String, $selected_index: Int!) {
            insert_quiz_answers_one(object: {
              quiz_id: $quiz_id,
              student_id: $student_id,
              selected_index: $selected_index
            }) {
              id
            }
          }
        `;
        await nhost.graphql.request(mutation, {
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
      // Nếu lỗi thì tiếp tục đếm giờ lại
      timerRef.current = setInterval(() => {
        setTimeSpent(t => t + 1);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: 'auto', fontFamily: 'sans-serif', position: 'relative' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: 20 }}>📝 Trắc nghiệm</h2>

      {/* Bộ đếm giờ góc trên phải */}
      {selectedTopic && !submitted && (
        <div style={{
          position: 'absolute',
          top: 24,
          right: 24,
          fontWeight: 'bold',
          backgroundColor: '#007bff',
          color: 'white',
          padding: '8px 12px',
          borderRadius: 6,
          userSelect: 'none',
          fontSize: '1rem',
        }}>
          Thời gian: {formatTime(timeSpent)}
        </div>
      )}

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
            disabled={loading}
          />

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={loading}
            style={{
              padding: 12,
              width: '100%',
              maxWidth: 700,
              fontSize: '1.2rem',
              marginTop: 8,
              marginBottom: 24,
              borderRadius: 6,
              border: '1px solid #ccc',
            }}
          >
            <option value="">-- Chọn đề thi--</option>
            {topics.map((topic, idx) => (
              <option key={idx} value={topic}>{topic}</option>
            ))}
          </select>
        </>
      )}

      {!submitted && selectedTopic && quizzes.length === 0 && (
        <p style={{ fontSize: '1.1rem' }}>Không có câu hỏi nào cho chủ đề này.</p>
      )}

      {!submitted && quizzes.length > 0 && (
        <div>
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              style={{
                marginBottom: 32,
                padding: 20,
                border: '1px solid #ccc',
                borderRadius: 8,
                background: '#f9f9f9',
              }}
            >
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 12 }}>
                Câu {index + 1}: {quiz.question}
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
                    }}
                  >
                    <input
                      type="radio"
                      name={`answer-${quiz.id}`}
                      value={i}
                      checked={answers[quiz.id] === i}
                      onChange={() => setAnswers({ ...answers, [quiz.id]: i })}
                      disabled={loading || submitted}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <strong>{String.fromCharCode(65 + i)}.</strong> {opt.value}

                  </label>

                  {opt.image && opt.image.trim() !== '' && (
                    <div style={{ marginTop: 6 }}>
                      <img
                        src={opt.image}
                        alt={`Đáp án ${i + 1}`}
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 6 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '1.2rem',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              marginTop: 20,
            }}
          >
            {loading ? 'Đang nộp...' : '✅ Nộp bài'}
          </button>
        </div>
      )}

      {submitted && (
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>
            🎉 Bạn đã nộp bài. Xem kết quả bên dưới:
          </h3>

          <p style={{ fontSize: '1.2rem', marginBottom: 12 }}>
            ✅ Số câu đúng: <strong>
              {
                quizzes.filter(q => answers[q.id] !== undefined && answers[q.id] === q.correct_index).length
              } / {quizzes.length}
            </strong>
          </p>

          <p style={{ fontSize: '1.2rem', marginBottom: 24 }}>
            🕒 Thời gian làm bài: <strong>{formatTime(timeSpent)}</strong>
          </p>

          {quizzes.map((quiz, index) => {
            const studentAnswer = answers[quiz.id] !== undefined ? answers[quiz.id] : -1; // -1 nếu chưa trả lời
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

                <p>
                  <strong>Đáp án đúng:</strong> {quiz.options[quiz.correct_index].value}
                </p>
                <p>
                  <strong>Bạn chọn:</strong> {studentAnswer !== -1 ? quiz.options[studentAnswer]?.value : <i>Chưa trả lời</i>}
                </p>
                {!isCorrect && <p style={{ color: '#dc3545', fontWeight: 'bold' }}>❌ Sai</p>}
                {isCorrect && <p style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Đúng</p>}
              </div>
            );
          })}

          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setSelectedTopic('');
              setTimeSpent(0);
            }}
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
            aria-label="Quay lại làm bài"
          >
            ← Quay lại làm bài
          </button>
        </div>
      )}
    </div>
  );
}
