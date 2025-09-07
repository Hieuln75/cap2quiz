/*import React, { useState, useEffect } from 'react';
import nhost from '../services/nhost';

export default function AdminQuizForm() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizList, setQuizList] = useState([]);

  // Fetch danh sách quizzes từ backend
  const fetchQuizzes = async () => {
    const query = `
      query {
        quizzes(order_by: {created_at: desc}) {
          id
          topic
          question
          options
          correct_index
        }
      }
    `;
    try {
      const res = await nhost.graphql.request(query);
      console.log('➡️ Fetch quizzes response:', res);

      if (res.errors && res.errors.length > 0) {
        console.error('❌ GraphQL errors fetching quizzes:', res.errors);
        return;
      }

      if (!res.data || !res.data.quizzes) {
        console.warn('⚠️ No quizzes data returned:', res);
        return;
      }

      setQuizList(res.data.quizzes);
    } catch (error) {
      console.error('❌ Exception fetching quizzes:', error);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
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
        mutation InsertQuiz($topic: String!, $question: String!, $options: jsonb!, $correct_index: Int!) {
          insert_quizzes_one(object: {
            topic: $topic,
            question: $question,
            options: $options,
            correct_index: $correct_index
          }) {
            id
          }
        }
      `;

      const formattedOptions = options.map((opt) => ({
        type: 'text',
        value: opt,
      }));

      const variables = {
        topic: topic.trim(),
        question: question.trim(),
        options: formattedOptions,
        correct_index: correctIndex,
      };

      const res = await nhost.graphql.request(mutation, variables);

      console.log('📤 Insert quiz response:', res);

      if (res.errors && res.errors.length > 0) {
        alert('❌ Lỗi khi thêm câu hỏi. Xem console để biết chi tiết.');
        console.error('❌ GraphQL errors:', res.errors);
      } else if (!res.data || !res.data.insert_quizzes_one) {
        alert('❌ Không nhận được dữ liệu phản hồi hợp lệ.');
        console.error('❌ Invalid response:', res);
      } else {
        alert('✅ Đã thêm câu hỏi thành công!');
        setTopic('');
        setQuestion('');
        setOptions(['', '', '', '']);
        setCorrectIndex(null);
        fetchQuizzes();
      }
    } catch (error) {
      console.error('❌ Exception khi thêm câu hỏi:', error);
      alert('❌ Lỗi khi thêm câu hỏi. Xem console để biết chi tiết.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Thêm câu hỏi</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Chủ đề:</label>
          <br />
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label>Câu hỏi:</label>
          <br />
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            required
            rows={3}
          />
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
                disabled={loading}
                required
                placeholder={`Đáp án ${i + 1}`}
              />
            </div>
          ))}
        </div>
        <div>
          <label>Chọn đáp án đúng:</label>
          <br />
          <select
            value={correctIndex ?? ''}
            onChange={(e) => setCorrectIndex(Number(e.target.value))}
            disabled={loading}
            required
          >
            <option value="">-- Chọn --</option>
            {[0, 1, 2, 3].map((i) => (
              <option key={i} value={i}>
                Đáp án {i + 1}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Đang lưu...' : 'Lưu câu hỏi'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <h3>Danh sách câu hỏi hiện có</h3>
      {quizList.length === 0 && <p>Không có câu hỏi nào.</p>}
      <ul>
        {quizList.map((quiz) => (
          <li key={quiz.id}>
            <b>[{quiz.topic}]</b> {quiz.question} (Đáp án đúng: Đáp án{' '}
            {quiz.correct_index + 1})
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
