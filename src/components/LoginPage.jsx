import React, { useState } from 'react';
import nhost from '../services/nhost';
import { GoogleIcon } from './GoogleIcon';

export default function LoginPage({ onLoginSuccess, onGuestLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
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
        onLoginSuccess(session); // chỉ email login mới dùng
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await nhost.auth.signIn({ provider: 'google' });
      // Không cần gọi onLoginSuccess ở đây vì sẽ redirect
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!email) {
        setError("Vui lòng nhập email để đặt lại mật khẩu.");
        return;
      }
      const { error } = await nhost.auth.resetPassword({ email });
      if (error) throw error;
      alert("Email đặt lại mật khẩu đã được gửi.");
      setForgotPasswordMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        ĐỀ TOÁN QUỐC TẾ, TIẾNG ANH NÂNG CAO <br />
        Dành cho học sinh cấp 2 các lớp chọn.
      </div>

      <div style={sloganStyle}>You can do it — never give up!</div>

      {!forgotPasswordMode ? (
        <>
          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🎓 Login</h2>

          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input placeholder="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

          {isRegistering && (
            <input placeholder="Xác nhận mật khẩu" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
          )}

          {error && <div style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={btnStyle}>
            {isRegistering ? 'Đăng ký' : 'Đăng nhập'}
          </button>

          <button onClick={handleGoogleLogin} disabled={loading} style={{ ...btnStyle, backgroundColor: 'green', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <GoogleIcon /> Đăng nhập với Google
          </button>

          <button onClick={onGuestLogin} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>
            👤 Không đăng nhập (Guest user)
          </button>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a onClick={() => setIsRegistering(!isRegistering)} style={linkStyle}>
              {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </a>
            <a onClick={() => { setForgotPasswordMode(true); setError(null); }} style={linkStyle}>Quên mật khẩu?</a>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🔑 Đặt lại mật khẩu</h2>
          <input placeholder="Nhập email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          {error && <div style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</div>}
          <button onClick={handleForgotPassword} disabled={loading} style={btnStyle}>Gửi email đặt lại mật khẩu</button>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a onClick={() => { setForgotPasswordMode(false); setError(null); }} style={linkStyle}>Quay lại đăng nhập</a>
          </div>
        </>
      )}

      <div style={footerStyle}>
        <img src="https://oojbgyspwbwvnpxnokol.storage.ap-southeast-1.nhost.run/v1/files/acd23f6e-56b0-4bbc-bc3f-9752f400df9d" alt="Inspiration" style={{ maxWidth: '70%', borderRadius: 10 }} />
        <div style={{ marginTop: 12, fontSize: '12px', color: '#555' }}>
          Author: Lê Ngọc Hiếu <br />
          Email: <a href="mailto:hieuln@gmail.com">hieuln@gmail.com</a>
        </div>
        <p style={{ fontSize: 14, fontStyle: 'italic', color: '#999' }}>Tự học mọi lúc, mọi nơi.</p>
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: 500,
  margin: '40px auto',
  fontFamily: 'sans-serif',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  borderRadius: 10,
  padding: 30,
  backgroundColor: '#fff',
};

const inputStyle = {
  width: '100%',
  padding: 10,
  marginBottom: 12,
  fontSize: 16,
};

const btnStyle = {
  width: '100%',
  padding: 12,
  marginBottom: 12,
  fontSize: 16,
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
};

const titleStyle = {
  marginBottom: 8,
  fontWeight: 'bold',
  fontSize: '1rem',
  color: '#333',
  textAlign: 'center',
};

const sloganStyle = {
  marginBottom: 14,
  fontStyle: 'italic',
  color: '#ffa861ff',
  fontFamily: "'Comic Sans MS', 'Comic Neue', cursive",
  fontSize: '20px',
  textAlign: 'center',
};

const linkStyle = {
  color: '#007bff',
  cursor: 'pointer',
  marginRight: 20,
};

const footerStyle = {
  marginTop: 20,
  backgroundColor: '#f7f9fc',
  borderRadius: 10,
  padding: 10,
  textAlign: 'center',
  width: '100%',
};

{/*
    import React, { useState } from 'react';
import nhost from '../services/nhost';
import { GoogleIcon } from './GoogleIcon';

export default function LoginPage({ onLoginSuccess, onGuestLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập / đăng ký
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

  // Xử lý đăng nhập Google
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error, session } = await nhost.auth.signIn({ provider: 'google' });

      if (error) throw error;

      // Khi login thành công với Google
      onLoginSuccess(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi email đặt lại mật khẩu
  const handleForgotPassword = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!email) {
        setError("Vui lòng nhập email để đặt lại mật khẩu.");
        setLoading(false);
        return;
      }

      const { error } = await nhost.auth.resetPassword({ email });
      if (error) throw error;

      alert("Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.");
      setForgotPasswordMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: '40px auto',
        fontFamily: 'sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: 10,
        overflow: 'hidden',
        padding: 30,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
  
      <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: '1rem', color: '#333', textAlign: 'center' }}>
        ĐỀ TOÁN QUỐC TẾ, TIẾNG ANH NÂNG CAO <br />
        Dành cho học sinh cấp 2 các lớp chọn.
      </div>

      <div style={{ marginBottom: 14, fontStyle: 'italic', color: '#ffa861ff', fontFamily: "'Comic Sans MS', 'Comic Neue', cursive", fontSize: '20px', textAlign: 'center' }}>
        You can do it — never give up!
      </div>

      {!forgotPasswordMode ? (
        <>
          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🎓 Login</h2>

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

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              ...btnStyle,
              backgroundColor: 'green',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
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
              style={{ color: '#007bff', cursor: 'pointer', marginRight: 20 }}
            >
              {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </a>

            <a
              onClick={() => {
                setForgotPasswordMode(true);
                setError(null);
              }}
              style={{ color: '#007bff', cursor: 'pointer' }}
            >
              Quên mật khẩu?
            </a>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🔑 Đặt lại mật khẩu</h2>

          <input
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
          />

          {error && <div style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</div>}

          <button onClick={handleForgotPassword} disabled={loading} style={btnStyle}>
            Gửi email đặt lại mật khẩu
          </button>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a
              onClick={() => {
                setForgotPasswordMode(false);
                setError(null);
              }}
              style={{ color: '#007bff', cursor: 'pointer' }}
            >
              Quay lại đăng nhập
            </a>
          </div>
        </>
      )}




      <div
        style={{
          marginTop: 20,
          backgroundColor: '#f7f9fc',
          borderRadius: 10,
          padding: 10,
          textAlign: 'center',
          width: '100%',
        }}
      >
        <img
          src="https://oojbgyspwbwvnpxnokol.storage.ap-southeast-1.nhost.run/v1/files/acd23f6e-56b0-4bbc-bc3f-9752f400df9d"
          alt="Inspiration"
          style={{ maxWidth: '70%', borderRadius: 10 }}
        />
        <div style={{ marginTop: 12, fontSize: '12px', color: '#555' }}>
          Author: Lê Ngọc Hiếu <br />
          Email: <a href="mailto:hieuln@gmail.com">hieuln@gmail.com</a>
        </div>


        <p style={{ fontSize: 14, fontStyle: 'italic', color: '#999' }}>
          Tự học mọi lúc, mọi nơi.
        </p>
      </div>
    </div>
  );
}

const btnStyle = {
  width: '100%',
  padding: 12,
  marginBottom: 12,
  fontSize: 16,
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
};

*/}
{/*
import React, { useState } from 'react';
import nhost from '../services/nhost';
import { GoogleIcon } from './GoogleIcon';

export default function LoginPage({ onLoginSuccess, onGuestLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Xử lý đăng nhập / đăng ký
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

  // Xử lý đăng nhập Google
  const handleGoogleLogin = async () => {
    try {
      const { error } = await nhost.auth.signIn({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };





  // Xử lý gửi email đặt lại mật khẩu
  const handleForgotPassword = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!email) {
        setError("Vui lòng nhập email để đặt lại mật khẩu.");
        setLoading(false);
        return;
      }

       const { error } = await nhost.auth.resetPassword({ email });
    if (error) throw error;

      alert("Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.");
      setForgotPasswordMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: '40px auto',
        fontFamily: 'sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: 10,
        overflow: 'hidden',
        padding: 30,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
    
      <div style={{ marginBottom: 12, fontWeight: 'bold', fontSize: '1rem', color: '#333', textAlign: 'center' }}>
        Các đề thi TOÁN QUỐC TẾ, TIẾNG ANH NÂNG CAO <br />
        Dành cho học sinh cấp 2 các lớp chọn.
      </div>

      <div style={{ marginBottom: 24, fontStyle: 'italic', color: '#ffa861ff', fontFamily: "'Comic Sans MS', 'Comic Neue', cursive", fontSize: '20px', textAlign: 'center' }}>
        You can do it — never give up!
      </div>

      {!forgotPasswordMode ? (
        <>
          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🎓 Login</h2>

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

          <button
            onClick={handleGoogleLogin}
            style={{
              ...btnStyle,
              backgroundColor: 'green',
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
              style={{ color: '#007bff', cursor: 'pointer', marginRight: 20 }}
            >
              {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </a>

            <a
              onClick={() => {
                setForgotPasswordMode(true);
                setError(null);
              }}
              style={{ color: '#007bff', cursor: 'pointer' }}
            >
              Quên mật khẩu?
            </a>
          </div>
        </>
      ) : (
        <>
          <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🔑 Đặt lại mật khẩu</h2>

          <input
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 12, fontSize: 16 }}
          />

          {error && <div style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</div>}

          <button onClick={handleForgotPassword} disabled={loading} style={btnStyle}>
            Gửi email đặt lại mật khẩu
          </button>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <a
              onClick={() => {
                setForgotPasswordMode(false);
                setError(null);
              }}
              style={{ color: '#007bff', cursor: 'pointer' }}
            >
              Quay lại đăng nhập
            </a>
          </div>
        </>
      )}

     
      <div
        style={{
          marginTop: 40,
          backgroundColor: '#f7f9fc',
          borderRadius: 10,
          padding: 20,
          textAlign: 'center',
          width: '100%',
        }}
      >
        <img
          src="https://oojbgyspwbwvnpxnokol.storage.ap-southeast-1.nhost.run/v1/files/acd23f6e-56b0-4bbc-bc3f-9752f400df9d"
          alt="Inspiration"
          style={{ maxWidth: '100%', borderRadius: 10 }}
        />
        <div style={{ marginTop: 12, fontSize: '12px', color: '#555' }}>
          Author: Lê Ngọc Hiếu <br />
          Email: <a href="mailto:hieuln@gmail.com">hieuln@gmail.com</a>
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
*/}