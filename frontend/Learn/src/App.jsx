
import { useAuth0 } from "@auth0/auth0-react";
import { Routes } from "react-router-dom";
import { Route, Navigate } from "react-router-dom";
import { use, useEffect } from "react";
import HomePage from "../pages/HomePage.jsx";
import WelcomePage from "../pages/WelcomePage.jsx";


const ProtectedRoute = ({children}) => {
  const {isAuthenticated, user} = useAuth0();

  if(!isAuthenticated){
    return <Navigate to="/" replace/>;
  }
  if(!user.email_verified){
    return <div>Please verify your email to access this page.</div>;
  }

  //if auth and verified pass
  return children;

}

const RedirectAuthenticatedUser = ({children})=> {
  const {isAuthenticated, user} = useAuth0();

  if(isAuthenticated && user.email_verified){
    return <Navigate to="/" replace/>
  }

  return children;

}

function App() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

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
      <Route path="/" element={<RedirectAuthenticatedUser><HomePage /></RedirectAuthenticatedUser>} />
      <Route path="/home" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
    </Routes>
    </>
  );
}

export default App;
