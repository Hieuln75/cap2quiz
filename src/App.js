import React, { useState } from 'react';
import AdminQuizForm from './components/AdminQuizForm';
import StudentQuizTestV2 from './components/StudentQuizTestV2';
import StudentQuizTest from './components/StudentQuizTest';
import StudentQuizHistory from './components/StudentQuizHistory';

import UploadFile from './components/UploadFile';

export default function App() {
  const [view, setView] = useState('studentV3'); // 'student' hoặc 'admin'
  const [showImage, setShowImage] = useState(true); // hiển thị ảnh splash ban đầu

  if (showImage) {
    return (
      <div
        style={{
          textAlign: 'center',
          paddingTop: '50px',
        }}
      >
   <h2
  style={{
    marginBottom: '18px',
    color: '#4c5fd5', // xanh tím sáng
    fontFamily: "'Baloo 2', 'Segoe UI', sans-serif",
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  }}
>
  Học sinh : Lê Ngọc Hà,<br />
  Chuyên toán trường Hoàng Mai
</h2>

   <p
  style={{
    marginTop: '20px',
    fontSize: '20px',
    color: '#ff6f61', // màu cam hồng tươi sáng
    fontFamily: "'Comic Sans MS', 'Comic Neue', cursive",
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
  }}
>
  Các đề thi toán quốc tế và chuyên đề toán cấp 2
</p>


        <img
          
          src="https://oojbgyspwbwvnpxnokol.storage.ap-southeast-1.nhost.run/v1/files/ab7cf9a5-846a-45bf-a7d9-5c2ae154c065"
          //src="https://oojbgyspwbwvnpxnokol.storage.ap-southeast-1.nhost.run/v1/files/e3bce5d9-8860-4d39-a283-6d6daa58a2d7"
          alt="Splash"
          style={{
            width: '300px',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
          }}
          onClick={() => setShowImage(false)}
        />

      <p
  style={{
    marginTop: '20px',
    fontSize: '20px',
    color: '#555',
    fontWeight: 'bold', // <-- thêm dòng này
  }}
>
  Nhấn vào ảnh để bắt đầu
</p>

      </div>
    );
  }

  return (
    <div>
      <nav style={{ padding: 20, borderBottom: '1px solid #ccc', marginBottom: 20 }}>
   
        <button
  onClick={() => setView('studentV2')}
  style={{
    marginRight: 10,
    backgroundColor: view === 'studentV2' ? '#007bff' : '#f0f0f0',
    color: view === 'studentV2' ? 'white' : 'black',
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
  }}
>
  Làm bài thi trắc nghiệm  
</button>

<button
  onClick={() => setView('studentV3')}
  style={{
    marginRight: 10,
    backgroundColor: view === 'studentV3' ? '#007bff' : '#f0f0f0',
    color: view === 'studentV3' ? 'white' : 'black',
    padding: '8px 14px',
    border: 'none',
    cursor: 'pointer',
  }}
>
 Update trắc nghiệm 
</button>
<button onClick={() => setView('history')}>🕘 Xem lịch sử</button>



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

     
      {view === 'studentV2' && <StudentQuizTestV2 />}
      {view === 'studentV3' && <StudentQuizTest />}
      {view === 'history' && <StudentQuizHistory />}
      {view === 'admin' && (
        <>
          <AdminQuizForm />
          <UploadFile />
        </>
      )}
    </div>
  );
}
