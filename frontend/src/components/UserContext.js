import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [adafruitInfo, setAdafruitInfo] = useState({});
    const [threshold, setThreshold] = useState([{}]);
    const navigate = useNavigate();

    const handleLogin = (username, adafruitInfo) => {
        setUsername(username);
        setAdafruitInfo(adafruitInfo);
        setLoggedIn(true);
    }

    const handleLogout = () => {
        setUsername('');
        setAdafruitInfo({});
        setLoggedIn(false);
    }
    
    useEffect(() => {
        if (!loggedIn) {
            navigate('/');
        }
        fetch('http://localhost:3001/api/getThreshold', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        }) 
        .then(response => response.json())
        .then(data => {
            setThreshold(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }, [loggedIn]);
    return (
        <UserContext.Provider value={{ loggedIn, setLoggedIn, username, setUsername, adafruitInfo, setAdafruitInfo,
        handleLogin, handleLogout, threshold, setThreshold}}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    return useContext(UserContext);
}