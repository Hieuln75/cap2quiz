/*
// AdminQuizForm.jsx
import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';

export default function AdminQuizForm() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [optionImages, setOptionImages] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizList, setQuizList] = useState([]);

  const fetchQuizzes = async () => {
    const query = `
      query {
        quizzes(order_by: {created_at: desc}) {
          id
          topic
          question
          question_image
          options
          correct_index
        }
      }
    `;
    try {
      const res = await nhost.graphql.request(query);
      if (!res.data?.quizzes) return;
      setQuizList(res.data.quizzes);
    } catch (error) {
      console.error('❌ Error fetching quizzes:', error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic.trim() || !question.trim()) {
      alert('Vui lòng điền chủ đề và câu hỏi.');
      return;
    }

    if (
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some((opt) => !opt.trim())
    ) {
      alert('Vui lòng nhập đủ 4 đáp án hợp lệ.');
      return;
    }

    if (
      correctIndex === null ||
      correctIndex < 0 ||
      correctIndex > 3 ||
      isNaN(correctIndex)
    ) {
      alert('Vui lòng chọn đáp án đúng.');
      return;
    }

    setLoading(true);

    try {
      const mutation = `
        mutation InsertQuiz($topic: String!, $question: String!, $question_image: String, $options: jsonb!, $correct_index: Int!) {
          insert_quizzes_one(object: {
            topic: $topic,
            question: $question,
            question_image: $question_image,
            options: $options,
            correct_index: $correct_index
          }) {
            id
          }
        }
      `;

      const formattedOptions = options.map((opt, idx) => ({
        value: opt,
        image: optionImages[idx] || null,
      }));

      const variables = {
        topic: topic.trim(),
        question: question.trim(),
        question_image: questionImage || null,
        options: formattedOptions,
        correct_index: correctIndex,
      };

      const res = await nhost.graphql.request(mutation, variables);

      if (!res.data?.insert_quizzes_one) {
        alert('❌ Không thể thêm câu hỏi.');
      } else {
        alert('✅ Đã thêm câu hỏi thành công!');
        setTopic('');
        setQuestion('');
        setQuestionImage('');
        setOptions(['', '', '', '']);
        setOptionImages(['', '', '', '']);
        setCorrectIndex(null);
        fetchQuizzes();
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm câu hỏi:', error);
      alert('Có lỗi xảy ra, kiểm tra console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Thêm câu hỏi</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Chủ đề:</label><br />
          <input value={topic} onChange={(e) => setTopic(e.target.value)} disabled={loading} />
        </div>
        <div>
          <label>Câu hỏi:</label><br />
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} disabled={loading} rows={3} />
        </div>
        <div>
          <label>Ảnh cho câu hỏi (URL):</label><br />
          <input value={questionImage} onChange={(e) => setQuestionImage(e.target.value)} disabled={loading} />
        </div>
        <div>
          <label>Đáp án:</label>
          {options.map((opt, i) => (
            <div key={i}>
              <input
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
                placeholder={`Đáp án ${i + 1}`}
                disabled={loading}
              />
              <input
                value={optionImages[i]}
                onChange={(e) => {
                  const imgs = [...optionImages];
                  imgs[i] = e.target.value;
                  setOptionImages(imgs);
                }}
                placeholder={`Ảnh cho đáp án ${i + 1} (URL)`}
                disabled={loading}
              />
            </div>
          ))}
        </div>
        <div>
          <label>Chọn đáp án đúng:</label><br />
          <select value={correctIndex ?? ''} onChange={(e) => setCorrectIndex(Number(e.target.value))} disabled={loading}>
            <option value="">-- Chọn --</option>
            {[0, 1, 2, 3].map((i) => (
              <option key={i} value={i}>Đáp án {i + 1}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Đang lưu...' : 'Lưu câu hỏi'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Danh sách câu hỏi</h3>
      {quizList.length === 0 && <p>Không có câu hỏi nào.</p>}
      <ul>
        {quizList.map((quiz) => (
          <li key={quiz.id}>
            <b>[{quiz.topic}]</b> {quiz.question}
            {quiz.question_image && (
              <div><img src={quiz.question_image} alt="Câu hỏi" width="150" /></div>
            )}
            (Đáp án đúng: {quiz.correct_index + 1})
          </li>
        ))}
      </ul>
    </div>
  );
}
*/
// AdminQuizForm.jsx
import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';

export default function AdminQuizForm() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [optionImages, setOptionImages] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizList, setQuizList] = useState([]);

  const fetchQuizzes = async () => {
    const query = `
      query {
        quizzes(order_by: {created_at: desc}) {
          id
          topic
          question
          question_image
          options
          correct_index
        }
      }
    `;
    try {
      const res = await nhost.graphql.request(query);
      if (!res.data?.quizzes) return;
      setQuizList(res.data.quizzes);
    } catch (error) {
      console.error('❌ Error fetching quizzes:', error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic.trim() || !question.trim()) {
      alert('Vui lòng điền chủ đề và câu hỏi.');
      return;
    }

    if (
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some((opt) => !opt.trim())
    ) {
      alert('Vui lòng nhập đủ 4 đáp án hợp lệ.');
      return;
    }

    if (
      correctIndex === null ||
      correctIndex < 0 ||
      correctIndex > 3 ||
      isNaN(correctIndex)
    ) {
      alert('Vui lòng chọn đáp án đúng.');
      return;
    }

    setLoading(true);

    try {
      const mutation = `
        mutation InsertQuiz($topic: String!, $question: String!, $question_image: String, $options: jsonb!, $correct_index: Int!) {
          insert_quizzes_one(object: {
            topic: $topic,
            question: $question,
            question_image: $question_image,
            options: $options,
            correct_index: $correct_index
          }) {
            id
          }
        }
      `;

      const formattedOptions = options.map((opt, idx) => ({
        value: opt,
        image: optionImages[idx] || null,
      }));

      const variables = {
        topic: topic.trim(),
        question: question.trim(),
        question_image: questionImage || null,
        options: formattedOptions,
        correct_index: correctIndex,
      };

      const res = await nhost.graphql.request(mutation, variables);

      if (!res.data?.insert_quizzes_one) {
        alert('❌ Không thể thêm câu hỏi.');
      } else {
        alert('✅ Đã thêm câu hỏi thành công!');
        setTopic('');
        setQuestion('');
        setQuestionImage('');
        setOptions(['', '', '', '']);
        setOptionImages(['', '', '', '']);
        setCorrectIndex(null);
        fetchQuizzes();
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm câu hỏi:', error);
      alert('Có lỗi xảy ra, kiểm tra console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Thêm câu hỏi</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Chủ đề:</label><br />
          <input
            style={{
              width: '100%',
              fontSize: '1.2rem',
              padding: '8px',
              boxSizing: 'border-box',
            }}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Câu hỏi:</label><br />
          <textarea
            style={{
              width: '100%',
              height: '120px',
              fontSize: '1.2rem',
              padding: '8px',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            rows={5}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Ảnh cho câu hỏi (URL):</label><br />
          <input
            style={{
              width: '100%',
              fontSize: '1.1rem',
              padding: '8px',
              boxSizing: 'border-box',
            }}
            value={questionImage}
            onChange={(e) => setQuestionImage(e.target.value)}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Đáp án:</label>
          {options.map((opt, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <input
                style={{
                  width: '80%',
                  fontSize: '1.1rem',
                  padding: '6px',
                  marginRight: 8,
                  boxSizing: 'border-box',
                }}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
                placeholder={`Đáp án ${i + 1}`}
                disabled={loading}
              />
              <br />
              <input
                style={{
                  width: '80%',
                  fontSize: '1.1rem',
                  padding: '6px',
                  marginTop: 4,
                  boxSizing: 'border-box',
                }}
                value={optionImages[i]}
                onChange={(e) => {
                  const imgs = [...optionImages];
                  imgs[i] = e.target.value;
                  setOptionImages(imgs);
                }}
                placeholder={`Ảnh cho đáp án ${i + 1} (URL)`}
                disabled={loading}
              />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Chọn đáp án đúng:</label><br />
          <select
            style={{ fontSize: '1.1rem', padding: '6px', width: '100%', boxSizing: 'border-box' }}
            value={correctIndex ?? ''}
            onChange={(e) => setCorrectIndex(Number(e.target.value))}
            disabled={loading}
          >
            <option value="">-- Chọn --</option>
            {[0, 1, 2, 3].map((i) => (
              <option key={i} value={i}>
                Đáp án {i + 1}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 10, padding: '10px 20px', fontSize: '1.1rem' }}
        >
          {loading ? 'Đang lưu...' : 'Lưu câu hỏi'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />
{/*
      <h3>Danh sách câu hỏi</h3>
      {quizList.length === 0 && <p>Không có câu hỏi nào.</p>}
      <ul>
        {quizList.map((quiz) => (
          <li key={quiz.id} style={{ marginBottom: 12 }}>
            <b>[{quiz.topic}]</b> {quiz.question}
            {quiz.question_image && (
              <div>
                <img src={quiz.question_image} alt="Câu hỏi" width="150" />
              </div>
            )}
            (Đáp án đúng: {quiz.correct_index + 1})
          </li>
        ))}
      </ul>
      */}
    </div>
  );
}
