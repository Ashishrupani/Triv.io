import { useState } from 'react';
import '../styles/Quiz.css';

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

  const handleNext = () => {
    if (selected === sampleQuestions[current].answer) {
      setScore(score + 1);
    }
    if (current + 1 < sampleQuestions.length) {
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
            <p className="score-text">Your Score: {score} / {sampleQuestions.length}</p>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${(score / sampleQuestions.length) * 100}%` }}></div></div>
            <button className="next-btn" onClick={() => window.location.reload()}>Retake Quiz</button>
          </div>
        ) : (
          <div key={current}>
            <h2>Question {current + 1} / {sampleQuestions.length}</h2>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${((current + 1) / sampleQuestions.length) * 100}%` }}></div></div>
            <h3 className="quiz-question">{sampleQuestions[current].question}</h3>
            <div className="quiz-options">
              {sampleQuestions[current].options.map((opt, i) => (
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
