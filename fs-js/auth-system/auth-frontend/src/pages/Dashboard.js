import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { state, dispatch } = useContext(AuthContext);
    return (
        <div>
            <h1>Welcome {state.user?.email}</h1>
            <button onClick={() => dispatch({ type: 'LOGOUT' })}>Logout</button>
        </div>
    )
}

export default Dashboard;
