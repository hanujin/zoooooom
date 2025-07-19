import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api';

function Signup() {
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    try {
      await signup(formData);
      alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      navigate('/');
    } catch (error) {
      console.error('Signup failed:', error);
      alert('회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="login-card">
      <img src="/logo.png" alt="Zoooooom!" className="brand-logo" />
      <AuthForm
        type="signup"
        onSubmit={handleSignup}
        onNavigateLogin={() => navigate('/')}
      />
    </div>
  );
}

export default Signup;
