
import { useAuth0 } from "@auth0/auth0-react";
import { Routes } from "react-router-dom";
import { Route, Navigate } from "react-router-dom";
import { use, useEffect } from "react";
import HomePage from "../pages/HomePage.jsx";
import WelcomePage from "../pages/WelcomePage.jsx";
import CreateQuiz from "../pages/CreateQuiz.jsx";
import Quiz from "../pages/Quiz.jsx";


const ProtectedRoute = ({children}) => {
  const {isAuthenticated} = useAuth0();

  if(!isAuthenticated){
    return <Navigate to="/" replace/>;
  }

  //if auth and verified pass
  return children;

}

const RedirectAuthenticatedUser = ({children})=> {
  const {isAuthenticated} = useAuth0();

  if(isAuthenticated){
    return <Navigate to="/home" replace/>
  }

  return children;

}

function App() {
  const {loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  useEffect(() => {
    if(!isAuthenticated){
      <Navigate to="/" replace/>
    }
  })

  return (
    <>
      {/* <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h1>Auth0 React Demo</h1>
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      ) : (
        <>
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Log Out
          </button>
        </>
      )}
    </div>  */}

    <Routes>
      <Route path="/" element={<WelcomePage />}/>
      <Route path="/home" element={<HomePage/>} />
      <Route path="/create-quiz" element={<CreateQuiz/>} />
      <Route path="/quiz" element={<Quiz/>} />
    </Routes>
    </>
  );
}

export default App;
