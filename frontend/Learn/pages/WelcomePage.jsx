import React from "react";

const WelcomePage = () => {
    const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <h1>Welcome to Triv.io!</h1>
            <p style={{ fontSize: '1.2rem', maxWidth: 500, textAlign: 'center' }}>
                This is your trivia and learning hub. Sign in to get started, explore quizzes, and track your progress. Enjoy your journey!
            </p>
            <button
                onClick={() => loginWithRedirect()}
                style={{ padding: '10px 24px', background: '#2d72d9', color: '#fff', borderRadius: 6, border: 'none', cursor: 'pointer' }}  
            >
                Get Started
            </button>
        </div>
    );
};

export default WelcomePage;