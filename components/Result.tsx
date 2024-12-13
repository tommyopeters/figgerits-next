import React from 'react';

interface ResultProps {
    correct: boolean;
    quote: string;
    info: string;
    onNext: () => void;
    onBack: () => void;
    onReset: () => void;
}

function Result(props: ResultProps) {
    return (
        <div className="result">
            <div className="result-container">
                <h1>{props.correct ? 'Correct!' : 'Oops, you missed something 🤭'}</h1>
                {props.correct && <h3><strong>{props.quote}</strong></h3>}
                {props.correct && <p>{props.info}</p>}

                {props.correct ? (
                    <button onClick={props.onNext} className="action-button next">Next Puzzle</button>
                ) : (
                    <div className="button-group">
                        <button onClick={props.onBack} className="action-button back">Go back</button>
                        <button onClick={props.onReset} className="action-button reset">Reset</button>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Result