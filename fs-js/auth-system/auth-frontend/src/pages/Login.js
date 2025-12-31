import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';

const Login = () => {
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        dispatch({ type: 'LOGIN_START' });

        try {
            const res = await axiosInstance.post('/auth/login', { email, password });

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                    email,
                    token: res.data.token,
                    refreshToken: res.data.refreshToken
                }
            });

            navigate('/dashboard', { replace: true });

        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            dispatch({ type: 'LOGIN_FAILURE', payload: err });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
