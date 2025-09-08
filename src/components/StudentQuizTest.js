
/*

import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';

export default function StudentQuizTest() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');

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

  const fetchQuizzesByTopic = async (topic) => {
    const query = `
      query ($topic: String!) {
        quizzes(where: {topic: {_eq: $topic}}, order_by: {created_at: asc}) {
          id
          question
          question_image
          options
        }
      }
    `;
    try {
      const res = await nhost.graphql.request(query, { topic });
      setQuizzes(res.data?.quizzes || []);
      setAnswers({});
      setSubmitted(false);
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
    }
  }, [selectedTopic]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quizzes.length) {
      alert('Vui lòng trả lời hết tất cả các câu hỏi!');
      return;
    }
    if (!studentName.trim()) {
      alert('Vui lòng nhập tên của bạn!');
      return;
    }

    setLoading(true);

    try {
      for (const quiz of quizzes) {
        const selected_index = answers[quiz.id];
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: 20 }}>📝 Trắc nghiệm</h2>

      {!submitted && (
        <>
          <input
            placeholder="Nhập tên của bạn"
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
              maxWidth: 500,
              fontSize: '1.2rem',
              marginTop: 8,
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

              {quiz.question_image && (
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
                    {opt.value}
                  </label>
                  {opt.image && (
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
          <h3 style={{ fontSize: '1.5rem' }}>🎉 Bạn đã nộp bài. Cảm ơn bạn!</h3>
        </div>
      )}
    </div>
  );
}
*/
import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';

export default function StudentQuizTest() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentName, setStudentName] = useState('');

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
    }
  }, [selectedTopic]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quizzes.length) {
      alert('Vui lòng trả lời hết tất cả các câu hỏi!');
      return;
    }
    // Bỏ phần check tên rồi nha

    setLoading(true);

    try {
      for (const quiz of quizzes) {
        const selected_index = answers[quiz.id];
        const mutation = `
          mutation InsertAnswer($quiz_id: uuid!, $student_id: String, $selected_index: Int!) {
            insert_quiz_answers_one(object: {
              quiz_id: $quiz_id,
              student_id: $studentName, 
              selected_index: $selected_index
            }) {
              id
            }
          }
        `;
        await nhost.graphql.request(mutation, {
          quiz_id: quiz.id,
          student_id: studentName.trim(), // vẫn gửi tên nếu có, không có cũng được
          selected_index,
        });
      }
      alert('✅ Nộp bài thành công!');
      setSubmitted(true);
    } catch (error) {
      console.error('❌ Submit error:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: 20 }}>📝 Trắc nghiệm</h2>

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
              maxWidth: 500,
              fontSize: '1.2rem',
              marginTop: 8,
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
                    {opt.value}
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

          <p style={{ fontSize: '1.2rem', marginBottom: 24 }}>
            ✅ Số câu đúng: <strong>
              {
                quizzes.filter(q => answers[q.id] === q.correct_index).length
              } / {quizzes.length}
            </strong>
          </p>

          {quizzes.map((quiz, index) => {
            const studentAnswer = answers[quiz.id];
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
                  <strong>Đáp án của bạn:</strong>{' '}
                  {quiz.options[studentAnswer]?.value || '(không chọn)'}{' '}
                  {isCorrect ? '✅' : '❌'}
                </p>

                {!isCorrect && (
                  <p style={{ fontWeight: 'bold', color: '#c82333' }}>
                    Đáp án đúng: {quiz.options[quiz.correct_index]?.value}
                  </p>
                )}
              </div>
            );
          })}

          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setSelectedTopic('');
              setQuizzes([]);
              setStudentName('');
            }}
            style={{
              marginTop: 20,
              padding: '12px 24px',
              fontSize: '1.1rem',
              borderRadius: 6,
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🔙 Trở lại chọn chủ đề
          </button>
        </div>
      )}
    </div>
  );
}
