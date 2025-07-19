import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    try {
      const response = await login(formData);
      // 서버 응답에서 토큰을 추출합니다. 백엔드의 실제 응답 구조에 따라 키 이름('accessToken')은 변경될 수 있습니다.
      const { accessToken } = response.data; 
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        navigate('/main');
      } else {
        alert('로그인에 성공했지만 토큰을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="login-card">
      <img src="/logo.png" alt="Zoooooom!" className="brand-logo" />
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        onNavigateSignup={() => navigate('/signup')}
      />
    </div>
  );
}

export default Login;
