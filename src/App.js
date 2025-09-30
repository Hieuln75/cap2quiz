import React, { useState, useEffect } from 'react';
import { useAuthenticationStatus, useUserData } from '@nhost/react';
import nhost from './services/nhost';
import LoginPage from './components/LoginPage';
import StudentQuizTest from './components/StudentQuizTest';
import StudentQuizHistory from './components/StudentQuizHistory';
import UploadFile from './components/UploadFile';

export default function App() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();
  const [guestMode, setGuestMode] = useState(false);
  const [view, setView] = useState('studentV3');

  const handleLogout = () => {
    nhost.auth.signOut();
    setGuestMode(false);
  };

  // Hàm cấp credit mặc định nếu chưa có
  async function addDefaultCredit(userId) {
    try {
      const { data, error } = await nhost.graphql.request(
        `
        query ($user_id: uuid!) {
          quiz_credits(where: { user_id: { _eq: $user_id } }) {
            user_id
          }
        }
        `,
        { user_id: userId }
      );

      if (error) {
        console.error('Check credit error:', error);
        return;
      }

      if (data.quiz_credits.length === 0) {
        const { error: insertError } = await nhost.graphql.request(
          `
          mutation ($user_id: uuid!) {
            insert_quiz_credits_one(object: { user_id: $user_id, credit_remaining: 5 }) {
              user_id
            }
          }
          `,
          { user_id: userId }
        );

        if (insertError) {
          console.error('Insert credit error:', insertError);
        } else {
          console.log('✅ Credit inserted for user:', userId);
        }
      }
    } catch (err) {
      console.error('addDefaultCredit exception:', err);
    }
  }

  // Gọi sau khi đăng nhập bằng email
  async function handleLoginSuccess(session) {
    if (session?.user?.id) {
      await addDefaultCredit(session.user.id);
    }
  }

  // Gọi tự động sau khi Google login (do redirect về app)
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      addDefaultCredit(user.id);
    }
  }, [isAuthenticated, user]);

  if (isLoading) return <p>Loading...</p>;

  if (!isAuthenticated && !guestMode) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGuestLogin={() => setGuestMode(true)}
      />
    );
  }

  return (
    <div>
      <nav style={{ padding: 20, borderBottom: '1px solid #ccc', marginBottom: 20 }}>
        <button onClick={() => setView('studentV3')}>Làm bài thi</button>
        <button onClick={() => setView('history')}>🕘 Xem lịch sử</button>
        <button onClick={() => setView('admin')}>🛠 Quản lý đề</button>
<>
{/*  <div style={{ float: 'right', textAlign: 'right' }}>
    {isAuthenticated && user?.email && (
      <div style={{ marginBottom: 4, color: '#555' }}>
        👤 Người dùng: {user.email}
      </div>
    )}
    <button onClick={handleLogout} style={{ color: 'red' }}>
      🔒 Đăng xuất
    </button>
  </div> */}

  <div style={{ float: 'right', textAlign: 'right' }}>
  {isAuthenticated && user?.email && (
    <div style={{ marginBottom: 4, color: '#555' }}>
      👤 Người dùng: {user.email}
      <br />
        <button onClick={handleLogout} style={{ color: 'red' }}>
    🔒 Đăng xuất
  </button>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
        <img 
          src="https://oojbgyspwbwvnpxnokol.storage.ap-southeast-1.nhost.run/v1/files/2ceff24a-c733-4612-9954-1d010a519038" 
          alt="icon mua lượt" 
          style={{ width: 60, height: 60 }} 
        />
             <div style={{ textAlign: 'left', marginTop: 2, fontSize: '12px', color: '#555' }}>
          <div>Mua thêm lượt: 50,000 vnd -5 lượt</div>
          <div>Nội dung tin nhắn : cap2 email</div>
        </div>
      </div>
    </div>
  )}

</div>

</>
      </nav>

      {view === 'studentV3' && <StudentQuizTest guestMode={guestMode} />}
      {view === 'history' && <StudentQuizHistory />}
      {view === 'admin' && <UploadFile />}
    </div>
  );
}


