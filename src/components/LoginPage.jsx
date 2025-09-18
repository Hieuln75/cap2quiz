import React, { useState } from 'react';
import nhost from '../services/nhost';
import { GoogleIcon } from './GoogleIcon';

export default function LoginPage({ onLoginSuccess, onGuestLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError("Mật khẩu không khớp.");
          setLoading(false);
          return;
        }
        const { error } = await nhost.auth.signUp({ email, password });
        if (error) throw error;
        alert("Đăng ký thành công! Vui lòng kiểm tra email.");
      } else {
        const { error, session } = await nhost.auth.signIn({ email, password });
        if (error) throw error;
        onLoginSuccess(session);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await nhost.auth.signIn({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      maxWidth: 900,
      margin: '40px auto',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: 10,
      overflow: 'hidden',
      minHeight: 450,
    }}>
      {/* Ảnh bên trái */}
      <div style={{ flex: 1, backgroundColor: '#f7f9fc', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <img
          src="https://oojbgyspwbwvnpxnokol.storage.ap-southeast-1.nhost.run/v1/files/acd23f6e-56b0-4bbc-bc3f-9752f400df9d"
          alt="Inspiration"
          style={{ maxWidth: '100%', borderRadius: 10 }}
        />
        <div style={{ marginTop: 20, fontSize: '12px', color: '#555', textAlign: 'center' }}>
          Author: Lê Ngọc Hiếu <br />
          email: <a href="mailto:hieuln@gmail.com">hieuln@gmail.com</a>
        </div>
      </div>

      {/* Form bên phải */}
      <div style={{ flex: 1, padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 12, fontWeight: 'bold', fontSize: '1rem', color: '#333', textAlign: 'center' }}>
          Các đề thi TOÁN QUỐC TẾ, TIẾNG ANH NÂNG CAO <br />
          Dành cho học sinh cấp 2 các lớp chọn.
        </div>

        <div style={{ marginBottom: 24, fontStyle: 'italic', color: '#ffa861ff', fontFamily: "'Comic Sans MS', 'Comic Neue', cursive",fontSize: '20px', textAlign: 'center' }}>
          You can do it — never give up!
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🎓Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
        />
        <input
          placeholder="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
        />
        {isRegistering && (
          <input
            placeholder="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
          />
        )}

        {error && <div style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={btnStyle}>
          {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
        </button>

   { /*<button disabled={true} onClick={handleGoogleLogin} style={{ ...btnStyle, backgroundColor: '#db4437' }}>
          <GoogleIcon /> Đăng nhập với Google
        </button>
*/}
<button
  disabled={true}
  onClick={handleGoogleLogin}
  style={{
    ...btnStyle,
    backgroundColor: 'gray',  // xám hẳn luôn
    cursor: 'not-allowed',
    opacity: 1,  // giữ full opacity để xám đậm luôn
  }}
>
  <GoogleIcon /> Đăng nhập với Google
</button>



        <button onClick={onGuestLogin} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>
          👤 Không đăng nhập (Guest user)
        </button>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ color: '#007bff', cursor: 'pointer' }}
          >
            {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </a>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  width: '100%',
  padding: 12,
  fontSize: 16,
  marginBottom: 10,
  cursor: 'pointer',
  border: 'none',
  color: 'white',
  backgroundColor: '#007bff',
};

{/*import React, { useState } from 'react';
import nhost from '../services/nhost';
import { GoogleIcon } from './GoogleIcon'; // Tùy chọn, icon Google

export default function LoginPage({ onLoginSuccess, onGuestLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError("Mật khẩu không khớp.");
          return;
        }
        const { error } = await nhost.auth.signUp({ email, password });
        if (error) throw error;
        alert("Đăng ký thành công! Vui lòng kiểm tra email.");
      } else {
        const { error, session } = await nhost.auth.signIn({ email, password });
        if (error) throw error;
        onLoginSuccess(session);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await nhost.auth.signIn({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🎓 Cap2Quiz Login</h2>

      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10 }}
        />
      </div>
      {isRegistering && (
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: 10 }}
          />
        </div>
      )}

      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

      <button onClick={handleSubmit} disabled={loading} style={btnStyle}>
        {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
      </button>

      <button onClick={handleGoogleLogin} style={{ ...btnStyle, backgroundColor: '#db4437' }}>
        <GoogleIcon /> Đăng nhập với Google
      </button>

      <button onClick={onGuestLogin} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>
        👤 Vào chơi không cần đăng nhập
      </button>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <a
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ color: '#007bff', cursor: 'pointer' }}
        >
          {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
        </a>
      </div>
    </div>
  );
}

const btnStyle = {
  width: '100%',
  padding: 12,
  fontSize: 16,
  marginBottom: 10,
  cursor: 'pointer',
  border: 'none',
  color: 'white',
  backgroundColor: '#007bff',
};
*/}