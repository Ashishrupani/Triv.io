import { use, useState } from 'react';
import '../styles/Quiz.css';
import { useLocation } from "react-router-dom";

const sampleQuestions = [
  { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HyperText Machine Language', 'HighText Markdown Language', 'None of the above'], answer: 0 },
  { question: 'Which programming language is used for web apps?', options: ['Python', 'JavaScript', 'C++', 'All of the above'], answer: 1 },
  { question: 'What year was JavaScript created?', options: ['1991', '1995', '2000', '1989'], answer: 1 },
  { question: 'CSS is used for?', options: ['Structure', 'Styling', 'Database', 'Logic'], answer: 1 },
  { question: 'React is maintained by?', options: ['Google', 'Facebook (Meta)', 'Microsoft', 'Twitter'], answer: 1 },
  { question: 'Which of these is a JavaScript framework?', options: ['Laravel', 'Django', 'React', 'Flask'], answer: 2 },
  { question: 'Which tag is used for inserting a line break in HTML?', options: ['<lb>', '<break>', '<br>', '<hr>'], answer: 2 },
  { question: 'Which keyword is used to define a constant in JavaScript?', options: ['let', 'var', 'const', 'constant'], answer: 2 },
  { question: 'In CSS, which property is used to change text color?', options: ['font-color', 'color', 'text-color', 'fgcolor'], answer: 1 },
  { question: 'What does API stand for?', options: ['Application Programming Interface', 'Applied Programming Internet', 'App Performance Interface', 'Application Program Input'], answer: 0 }
];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  const location = useLocation();
  let { quiz } = location.state;
  let quizzes = quiz.message;

  // If quizzes is a string, extract the array and parse it
  if (typeof quizzes === "string") {
    // Extract the array part from the string
    const arrMatch = quizzes.match(/\[.*\]/s);
    let arrStr = quizzes;
    if (arrMatch) arrStr = arrMatch[0];
    try {
      quizzes = JSON.parse(arrStr.replace(/'/g, '"'));
    } catch {
      quizzes = sampleQuestions;
    }
  }

  if (!Array.isArray(quizzes)) {
    quizzes = sampleQuestions;
  }

  console.log("Quiz data:", quizzes);

  const handleNext = () => {
    if (selected === quizzes[current].answer) {
      setScore(score + 1);
    }
    if (current + 1 < quizzes.length) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };


  return (
    <div className="quiz-container">
      <div className="quiz-card">
        {finished ? (
          <div className="quiz-complete">
            <h2>Quiz Complete 🎉</h2>
            <p className="score-text">Your Score: {score} / {quizzes.length}</p>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${(score / quizzes.length) * 100}%` }}></div></div>
            <button className="next-btn" onClick={() => window.location.reload()}>Retake Quiz</button>
          </div>
        ) : (
          <div key={current}>
            <h2>Question {current + 1} / {quizzes.length}</h2>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${((current + 1) / quizzes.length) * 100}%` }}></div></div>
            <h3 className="quiz-question">{quizzes[current].question}</h3>
            <div className="quiz-options">
              {quizzes[current].options.map((opt, i) => (
                <button
                  key={i}
                  className={`quiz-option ${selected === i ? 'selected' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={selected === null} className="next-btn">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
