import React, { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { addScore } from '../src/leaderboard';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../src/storage/profileStore';
// IMPORT THE CSS FILE
import '../styles/Quiz.css'; 

// 1. Question Data (Kept the same)
const questions = [
    {
        questionText: 'What is the capital of France?',
        answerOptions: [
            { answerText: 'Berlin', isCorrect: false },
            { answerText: 'Madrid', isCorrect: false },
            { answerText: 'Paris', isCorrect: true },
            { answerText: 'Rome', isCorrect: false },
        ],
    },
    {
        questionText: 'Which company developed React?',
        answerOptions: [
            { answerText: 'Google', isCorrect: false },
            { answerText: 'Facebook', isCorrect: true },
            { answerText: 'Amazon', isCorrect: false },
            { answerText: 'Microsoft', isCorrect: false },
        ],
    },
    {
        questionText: 'The iPhone was created by which company?',
        answerOptions: [
            { answerText: 'Apple', isCorrect: true },
            { answerText: 'Intel', isCorrect: false },
            { answerText: 'Samsung', isCorrect: false },
            { answerText: 'Nokia', isCorrect: false },
        ],
    },
    {
        questionText: 'What is the largest planet in our solar system?',
        answerOptions: [
            { answerText: 'Mars', isCorrect: false },
            { answerText: 'Jupiter', isCorrect: true },
            { answerText: 'Earth', isCorrect: false },
            { answerText: 'Saturn', isCorrect: false },
        ],
    },
    {
        questionText: 'What is the chemical symbol for water?',
        answerOptions: [
            { answerText: 'O2', isCorrect: false },
            { answerText: 'H2O', isCorrect: true },
            { answerText: 'CO2', isCorrect: false },
            { answerText: 'NaCl', isCorrect: false },
        ],
    },
    {
        questionText: 'How many continents are there?',
        answerOptions: [
            { answerText: '5', isCorrect: false },
            { answerText: '6', isCorrect: false },
            { answerText: '7', isCorrect: true },
            { answerText: '8', isCorrect: false },
        ],
    },
    {
        questionText: 'What is the highest mountain in the world?',
        answerOptions: [
            { answerText: 'K2', isCorrect: false },
            { answerText: 'Mount Everest', isCorrect: true },
            { answerText: 'Mount Fuji', isCorrect: false },
            { answerText: 'Matterhorn', isCorrect: false },
        ],
    },
    {
        questionText: 'Which language is React built on?',
        answerOptions: [
            { answerText: 'Python', isCorrect: false },
            { answerText: 'Java', isCorrect: false },
            { answerText: 'JavaScript', isCorrect: true },
            { answerText: 'C#', isCorrect: false },
        ],
    },
    {
        questionText: 'What is 8 * 9?',
        answerOptions: [
            { answerText: '64', isCorrect: false },
            { answerText: '72', isCorrect: true },
            { answerText: '81', isCorrect: false },
            { answerText: '63', isCorrect: false },
        ],
    },
    {
        questionText: 'What does HTML stand for?',
        answerOptions: [
            { answerText: 'Hyper Text Markup Language', isCorrect: true },
            { answerText: 'High Tech Modern Language', isCorrect: false },
            { answerText: 'Hyperlink and Text Markup', isCorrect: false },
            { answerText: 'Home Tool Markup Language', isCorrect: false },
        ],
    },
];

const Quiz = () => {
    const { user, isAuthenticated, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(() => getProfile(user));
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [startedAt, setStartedAt] = useState(() => Date.now());

    useEffect(() => {
        setProfile(getProfile(user));
    }, [user]);

    useEffect(() => {
        setStartedAt(Date.now());
    }, []);

    const handleAnswerOptionClick = (isCorrect) => {
        if (isCorrect) {
            setScore(score + 1);
        }

        const nextQuestion = currentQuestion + 1;

        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
        } else {
            setShowScore(true);
        }
    };

    return (
        <div className="app">
            {showScore ? (
                /* -------------------
                * 1. SCORE SECTION (Uses className="score-section")
                * ------------------- */
                <div className="score-section">
                    <div style={{ marginBottom: 12 }}>
                        You scored {score} out of {questions.length}
                    </div>
                    <button
                      className="answer-button"
                      onClick={() => {
                        const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
                        addScore({
                          score,
                          total: questions.length,
                          difficulty: 'Practice',
                          durationSeconds,
                        }, isAuthenticated ? user : undefined);
                        if (!isAuthenticated && loginWithRedirect) {
                          const wantLogin = confirm('Score saved locally. Log in to sync it to your profile?');
                          if (wantLogin) {
                            loginWithRedirect({ screen_hint: 'login' }).catch(() => {});
                            return;
                          }
                        }
                        navigate('/leaderboard');
                      }}
                    >
                      Save Score to Leaderboard
                    </button>
                </div>
            ) : (
                /* -------------------
                * 2. QUESTION SECTION (Uses classNames for layout and elements)
                * ------------------- */
                <>
                    {/* The question container is structured to allow flex styling */}
                    <div className="question-section">
                        <div className="question-count">
                            <span>Question {currentQuestion + 1}</span>/{questions.length}
                        </div>
                        <div className="question-text">
                            {questions[currentQuestion].questionText}
                        </div>
                    </div>

                    <div className="answer-section">
                        {/* Map over the answer options for the current question */}
                        {questions[currentQuestion].answerOptions.map((answerOption, index) => (
                            <button
                                key={index}
                                // Uses className="answer-button"
                                className="answer-button"
                                onClick={() => handleAnswerOptionClick(answerOption.isCorrect)}
                            >
                                {answerOption.answerText}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Quiz;
