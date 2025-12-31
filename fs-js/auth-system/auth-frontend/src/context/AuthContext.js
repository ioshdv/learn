import { createContext, useReducer, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import jwt_decode from 'jsonwebtoken';

const AuthContext = createContext();

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    loading: false,
    error: null
};

const reducer = (state, action) => {
    switch(action.type){
        case 'LOGIN_START': 
            return { ...state, loading: true, error: null };
        case 'LOGIN_SUCCESS': 
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
            localStorage.setItem('user', JSON.stringify({ email: action.payload.email }));
            return { 
                ...state, 
                loading: false, 
                user: { email: action.payload.email }, 
                token: action.payload.token, 
                refreshToken: action.payload.refreshToken 
            };
        case 'LOGIN_FAILURE': 
            return { ...state, loading: false, error: action.payload };
        case 'LOGOUT': 
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            return { ...state, user: null, token: null, refreshToken: null };
        case 'REFRESH_TOKEN':
            localStorage.setItem('token', action.payload.token);
            return { ...state, token: action.payload.token };
        default: 
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Verificar y refrescar token al cargar la app
    useEffect(() => {
        const refreshToken = state.refreshToken;
        const token = state.token;

        const verifyToken = async () => {
            if(token){
                const decoded = jwt_decode.decode(token);
                const expiresIn = decoded.exp * 1000 - Date.now();
                if(expiresIn < 60000 && refreshToken){
                    try {
                        const res = await axios.post('/auth/refresh', { refreshToken });
                        dispatch({ type: 'REFRESH_TOKEN', payload: { token: res.data.token } });
                    } catch (err) {
                        dispatch({ type: 'LOGOUT' });
                    }
                }
            }
        };

        verifyToken();
    }, []);

    // Sincronizar logout entre pestañas
    useEffect(() => {
        const handleStorageChange = (event) => {
            if(event.key === 'token' && !event.newValue){
                dispatch({ type: 'LOGOUT' });
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}

export default AuthContext;
