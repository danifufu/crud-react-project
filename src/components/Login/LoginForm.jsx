import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'

export function LoginForm () {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [success, setSuccess] = useState(false);
  

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setShowAlert(false);
    setSuccess(false);
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setShowAlert(false);
    setSuccess(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAlert(true);
    if (email == 'daniela@gmail.com' && password == '123456') {
      // Autenticação bem-sucedida, redirecionar ou executar ações necessárias
      // alert('Usuário autenticado!');
      setSuccess(true);
      setTimeout(() => {navigate('/list')}, 3000);
    }
  }

  return (
    <div className="container">
      <h1>Login</h1>
      {showAlert && (
        <div>
          {success ? (
            <div className="success-alert">Login bem-sucedido!</div>
          ) : (
            <div className="error-alert">Email e/ou Senha incorretos!</div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}