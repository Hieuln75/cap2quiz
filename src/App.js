import React, { useState } from 'react';
import AdminQuizForm from './components/AdminQuizForm';
import StudentQuizTest from './components/StudentQuizTest';


export default function App() {
  const [view, setView] = useState('student'); // 'student' hoặc 'admin'

  return (
    <div>
      <nav style={{ padding: 20, borderBottom: '1px solid #ccc', marginBottom: 20 }}>
        <button
          onClick={() => setView('student')}
          style={{
            marginRight: 10,
            backgroundColor: view === 'student' ? '#007bff' : '#f0f0f0',
            color: view === 'student' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Làm bài trắc nghiệm
        </button>
        <button
          onClick={() => setView('admin')}
          style={{
            backgroundColor: view === 'admin' ? '#007bff' : '#f0f0f0',
            color: view === 'admin' ? 'white' : 'black',
            padding: '8px 16px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Quản lý câu hỏi
        </button>
      </nav>

      {view === 'student' && <StudentQuizTest />}
      {view === 'admin' && <AdminQuizForm />}
    </div>
  );
}
