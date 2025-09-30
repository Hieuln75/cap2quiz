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
    console.log('Logging out...');
    nhost.auth.signOut();
    setGuestMode(false);
  };

  // Cấp credit mặc định nếu chưa có
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

  async function handleLoginSuccess(session) {
    if (session?.user?.id) {
      await addDefaultCredit(session.user.id);
    }
  }

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
      {/* NAVIGATION BAR */}
      <nav style={{
        padding: 20,
        borderBottom: '1px solid #ccc',
        marginBottom: 20,
        position: 'relative'
      }}>
        <button onClick={() => setView('studentV3')}>Làm bài thi</button>
        <button onClick={() => setView('history')}>🕘 Xem lịch sử</button>
        <button onClick={() => setView('admin')}>🛠 Quản lý đề</button>

        {/* User Info & Logout */}
        <div style={{ position: 'absolute', right: 20, top: 20, textAlign: 'right' }}>
          {isAuthenticated && user?.email && (
            <div style={{ marginBottom: 4, color: '#555' }}>
              👤 Người dùng: {user.email}
            </div>
          )}
          <button onClick={handleLogout} style={{ color: 'red' }}>
            🔒 Đăng xuất
          </button>
        </div>
      </nav>

      {/* QR CODE + Ghi chú */}
      {isAuthenticated && !guestMode && (
      <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
        <img
          src="https://oojbgyspwbwvnpxnokol.storage.ap-southeast-1.nhost.run/v1/files/2ceff24a-c733-4612-9954-1d010a519038"
          alt="QR code"
          style={{ width: 200, marginBottom: 12 }}
        />
        <div style={{ fontSize: '0.7rem', color: '#444' }}>
          <p>💳 <strong>Mua thêm lượt:</strong> 50.000đ - 5 lượt</p>
          <p>📝 <strong>Nội dung chuyển khoản:</strong> <i>cap2 email</i></p>
        </div>
      </div>
      )}
      {/* Main View Rendering */}
      {view === 'studentV3' && <StudentQuizTest guestMode={guestMode} />}
      {view === 'history' && <StudentQuizHistory />}
      {view === 'admin' && <UploadFile />}
    </div>
  );
}
