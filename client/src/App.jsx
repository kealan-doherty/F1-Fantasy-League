import './App.css';
import HomePage from './pages/homePage.jsx';
import NewUserPage from './pages/newUserPage.jsx';
import LogIn from './pages/logIn.jsx';
import SelectTeam from './pages/selectTeamPage.jsx';
import UserProfile from './pages/userProfile.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import ResetRequest from './pages/ResetRequest.jsx';
import ResetPassword from './pages/ResetPassword.jsx';


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/newUser" element={<NewUserPage />} />
          <Route path="/LogIn" element={<LogIn />} />
          <Route path="/selectTeam" element={<SelectTeam />} />
          <Route path="/userProfile" element={<UserProfile />} />
          <Route path="/ResetRequest" element={<ResetRequest />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;
