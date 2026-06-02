import './App.css';
import HomePage from './pages/homePage.jsx';
import NewUserPage from './pages/newUserPage.jsx';
import LogIn from './pages/logIn.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/newUser" element={<NewUserPage />} />
          <Route path="/LogIn" element={<LogIn />} />
        </Routes>
      </Router>
    </>
  )
}

export default App;
