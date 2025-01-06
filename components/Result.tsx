import React from 'react';
import { Button } from './ui/button';

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
                    <Button onClick={props.onNext} className="action-button next">Next Puzzle</Button>
                ) : (
                    <div className="button-group">
                        <Button onClick={props.onBack} className="action-button back">Go back</Button>
                        <Button onClick={props.onReset} className="action-button reset">Reset</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
export default Result