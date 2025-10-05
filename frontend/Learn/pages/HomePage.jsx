
import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: '#f9f9f9' }}>
			<h1 style={{ color: '#2d72d9' }}>Welcome to Triv.io!</h1>
			<p style={{ fontSize: '1.2rem', maxWidth: 500, textAlign: 'center', marginBottom: 32 }}>
				This is Home
			</p>
			<div style={{ display: 'flex', gap: 16 }}>
				<Link to="/quizzes" style={{ padding: '10px 24px', background: '#2d72d9', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>Explore Quizzes</Link>
				<Link to="/profile" style={{ padding: '10px 24px', background: '#fff', color: '#2d72d9', border: '1px solid #2d72d9', borderRadius: 6, textDecoration: 'none' }}>My Profile</Link>
			</div>
		</div>
	);
};

export default HomePage;

