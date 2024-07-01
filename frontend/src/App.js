import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { UserProvider } from './components/UserContext.js';
import HomePage from './pages/HomePage.js';
import Sidebar from "./components/Sidebar.js";
import InfoPage from './pages/InfoPage.js';
import DeviceController from './pages/ControlPage.js';
import HistoryPage from './pages/HistoryPage.js';
import ForecastPage from './pages/ForecastPage.js';
import AnalysPage from './pages/AnalysPage.js';
import FeedbackPage from './pages/FeedbackPage.js';
import NotificationPage from './pages/NotificationPage.js';
import PageNotFound from './pages/PageNotFound.js';
import Login from './pages/Dangnhap.js';
import signup from './pages/Dangky.js';

function App() {
  return (
    <div >
        <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path='/' Component={Login}></Route>
            <Route path='/signup' Component={signup}></Route>
            <Route Component={Sidebar}>
              <Route path='/homepage' Component={HomePage}></Route>
              <Route path='/info' Component={InfoPage}></Route>
              <Route path='/control' Component={DeviceController}></Route>
              <Route path='/history' Component={HistoryPage}></Route>
              <Route path='/forecast' Component={ForecastPage}></Route>
              <Route path='/analys' Component={AnalysPage}></Route>
              <Route path='/feedback' Component={FeedbackPage}></Route>
              <Route path='/notification' Component={NotificationPage}></Route>
              <Route path='*' Component={PageNotFound}></Route>
            </Route>
          </Routes>
          </UserProvider>
        </BrowserRouter>
    </div>
  );
}

export default App;
