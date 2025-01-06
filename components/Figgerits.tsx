'use client';

import Keyboard from "@/components/Keyboard";
import clsx from "clsx";
import { useCallback, useEffect, useState, useTransition } from "react";
import Result from './Result';
import { PuzzleData } from '@/utils/types';
import { getPuzzleData, updatePuzzleProgress, completePuzzle } from "@/app/actions/puzzleActions";

type ElementType = string | number | undefined;

interface UserInput {
    [key: number]: string | null
}

interface ActionThreadItem {
    previousCharacter: string | null;
    character: string | null;
    active: number | null;
    currentElement: CurrentElement;
}


interface CurrentElement {
    type: ElementType,
    index: ElementType,
    ind: ElementType
}

interface Encoding {
    [key: string]: number;

}

function Figgerits() {


    const [isPending, startTransition] = useTransition();
    const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);

    useEffect(() => {
        startTransition(() => {
            getPuzzleData()
                .then((data) => {
                    setPuzzleData(data);
                    console.log(data)
                })
                .catch((error) => {
                    console.error('Error fetching puzzle data:', error);
                });
        });
    }, [startTransition]);

    const [quote, setQuote] = useState('');
    const [info, setInfo] = useState('');
    const [words, setWords] = useState<string[][] | null>([]);
    const [clues, setClues] = useState<{ word: string; clue: string }[]>([]);
    const [gameState, setGameState] = useState<{ complete: boolean, correct: boolean }>({ complete: false, correct: false });
    const [encoding, setEncoding] = useState<Encoding>({});
    const [active, setActive] = useState<number | null>(null);
    const [highlighted, setHighlighted] = useState<number | null>(null);
    const [actionThread, setActionThread] = useState<ActionThreadItem[]>([]);
    const [userInput, setUserInput] = useState<UserInput>({});
    const [currentElement, setCurrentElement] = useState<CurrentElement>({ type: '', index: 0, ind: 0 });

    const [initialUserInputLoaded, setInitialUserInputLoaded] = useState(false);


    function setFullHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    const startGame = useCallback((quoteString: string, gameClues: { word: string, clue: string }[], infoString: string, encoding: Encoding, savedUserInput: UserInput | null) => {
        
        setActive(null);
        setActionThread([]);

        if (!quoteString || !gameClues || !infoString || !encoding) {
            return;
        }
        setQuote(quoteString);
        setWords(splitWords(quoteString));
        setEncoding(encoding);
        if (savedUserInput) {
            setUserInput(savedUserInput);
        } else {
            const initialUserInput: { [key: number]: string | null } = {};
            Object.keys(encoding).forEach((key) => {
                initialUserInput[encoding[key]] = null;
            });
            setUserInput(initialUserInput);
        }
        setClues(gameClues);
        setInfo(infoString);
    }, []);

    useEffect(() => {

        if (puzzleData) {
            console.log(puzzleData);
            startGame(puzzleData.quote, puzzleData.clues, puzzleData.info, puzzleData.encoding, puzzleData?.userInput);
        }

    }, [puzzleData, startGame]);



    // PURE FUNCTIONS -------------------------------------------------

    const splitWords = (quote: string): string[][] => {
        const wordsArray = quote.split(' ');
        const charactersArray = [];
        for (const word of wordsArray) {
            const characters = word.split('');
            charactersArray.push(characters);
        }
        return charactersArray;
    };

    // IMPURE FUNCTIONS -------------------------------------------------

    const hasValue = (num: number): boolean => {
        // 
        return !!userInput[num];
    };

    const getValue = (num: number): string | null => {
        return (userInput as { [key: number]: string | null })[num];
    };

    const isEncoded = (char: string): boolean => {
        return !!encoding[char.toLowerCase()];
    };

    const activate = (event: React.MouseEvent<HTMLButtonElement>, char: number, type: string) => {
        setActive(char);
        const targetElement = event.target as HTMLElement;
        const currentAnswerBox = targetElement.classList.contains('answer-box') ? targetElement : targetElement.closest('.answer-box') as HTMLElement;
        const index = currentAnswerBox.dataset.index;
        const ind = currentAnswerBox.dataset.ind;
        setCurrentElement({
            index,
            ind,
            type
        });

    };

    const handleDelete = () => {
        console.log("delete")
        if (active !== null) {
            actionThread.push({
                previousCharacter: userInput[active],
                character: null,
                active: active,
                currentElement: currentElement
            });
            //   (userInput as { [key: number]: string | null })[active] = null;
            setUserInput({ ...userInput, [active]: null });
        }
    };

    const handleUndo = () => {
        console.log("undo")
        if (actionThread.length > 0) {
            const lastAction = actionThread.pop();
            if (lastAction) {
                const { previousCharacter, active, currentElement: { index, ind, type } } = lastAction;
                setUserInput({ ...userInput, [active!]: previousCharacter });
                setActive(active);
                setCurrentElement({
                    index,
                    ind,
                    type
                });
            }
        }
    }

    const handleKeyboardInput = useCallback((character: string) => {
        setGameState({
            complete: false,
            correct: false
        });

        if (active !== null) {
            setActionThread([...actionThread, {
                previousCharacter: userInput[active],
                character,
                active: active,
                currentElement: currentElement
            }]);
            // (userInput.value as { [key: number]: string | null })[active.value] = character.toLowerCase();
            setUserInput({ ...userInput, [active]: character.toLowerCase() });

            if (!gameState.complete) {
                saveProgress(gameState.complete, false, 0, 0, 0, userInput, actionThread);
            }
        }
    }, [active, actionThread, currentElement, userInput]);

    const saveProgress = async (completed: boolean, skipped: boolean, hintsUsed: number, attempts: number, timeTaken: number, userInput: object, actionThread: ActionThreadItem[]) => {
        const puzzleId = puzzleData!._id;
        console.log(puzzleId + " is the puzzle id")
        const progressData = {
            completed: gameState.complete,
            skipped: false,
            hintsUsed: 0,
            attempts: 0,
            timeTaken: 0,
            userInput,
            actionThread,
        };

        try {
            const result = await updatePuzzleProgress(puzzleId, progressData);
            console.log('Puzzle progress updated successfully:', result);
        } catch (error) {
            console.error('Error updating puzzle progress:', error);
        }
    };


    useEffect(() => {
        // make sure the game has started before checking for completion
        if (!initialUserInputLoaded) {
            setInitialUserInputLoaded(true);
            return;
        }
        // added quote to the condition to prevent the function from running before the quote is set
        if (Object.values(userInput).every((value) => value !== null) && quote) {
            handleAllCharactersFilled();
        } else if (active && userInput[active] !== null) {
            handleIncompleteCharacters();
        } else {
            console.log('No active element');
        }
    }, [userInput]);

    // useEffect(() => {
    //     if (gameState.complete) {
    //         console.log('Puzzle complete!');

    //         saveProgress(gameState.complete, false, 0, 0, 0, userInput, actionThread);
    //     }
    // }, [gameState]);

    const handleNextPuzzle = () => {
        setGameState({
            complete: false,
            correct: false
        });
        // setQuote('');
        // setWords([]);
        // setClues([]);
        // setInfo('');
        // setEncoding({});
        // setActive(null);
        // setHighlighted(null);
        // setActionThread([]);
        // setUserInput({});
        setCurrentElement({
            type: '',
            index: 0,
            ind: 0
        });

        startTransition(() => {
            getPuzzleData()
                .then((data) => {
                    setPuzzleData(data);
                    console.log(data)
                })
                .catch((error) => {
                    console.error('Error fetching puzzle data:', error);
                });
        });
    }

    const handleAllCharactersFilled = () => {
        console.log('All characters are filled!');
        const isCorrect = Object.keys(encoding).every((char) => {
            return userInput[encoding[char]] === char;
        });

        if (isCorrect) {
            console.log('------------------------------------------------------')
            console.log('IS CORRECT!!!!!')
            const puzzleId = puzzleData!._id;
            const progressData = {
                skipped: false,
                hintsUsed: 0,
                attempts: 0,
                timeTaken: 0,
                userInput,
                actionThread,
            };
            completePuzzle(puzzleId, progressData).then(data => {
                console.log(data, "Response")
                setGameState({
                    complete: true,
                    correct: isCorrect
                });
            });
        } else {
            setGameState({
                complete: true,
                correct: isCorrect
            });
        }
    };

    const handleIncompleteCharacters = () => {
        const answerBoxes = document.querySelectorAll('.answer-box');
        const activeElements = document.querySelectorAll('.active');
        const currentAnswerBox = document.querySelector('.current');
        const activeElement = currentAnswerBox || (activeElements.length > 0 ? activeElements[0] : null);

        if (activeElement !== null) {
            let i = Array.from(answerBoxes).indexOf(activeElement) + 1;
            while (true) {
                if (i === answerBoxes.length) {
                    i = 0;
                    console.log('turning around');
                }
                const encodingElement = answerBoxes[i].querySelector('.encoding');
                const encoding = encodingElement?.textContent ? Number(encodingElement.textContent) : null;
                if (!!encoding && !hasValue(encoding)) {
                    setActive(encoding);
                    setCurrentElement({
                        index: (answerBoxes[i] as HTMLElement).dataset.index,
                        ind: (answerBoxes[i] as HTMLElement).dataset.ind,
                        type: (answerBoxes[i] as HTMLElement).dataset.type,
                    });
                    break;
                }
                i++;
            }
        }
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (active === null) return;

        if (/^[a-zA-Z]$/.test(event.key)) {
            handleKeyboardInput(event.key.toLowerCase());
        } else if (event.key === 'Backspace') {
            handleDelete();
        } else if (event.key === 'Enter') {
            // handleAllCharactersFilled();
            console.log("Enter")
        }
        // else if (event.key === 'ArrowLeft') {
        //     if (active !== null) {
        //         const answerBoxes = document.querySelectorAll('.answer-box');
        //         const activeElement = document.querySelector('.active');
        //         const currentAnswerBox = document.querySelector('.current');
        //         const activeIndex = Array.from(answerBoxes).indexOf(activeElement as HTMLElement);
        //         const currentIndex = Array.from(answerBoxes).indexOf(currentAnswerBox as HTMLElement);
        //         let i = activeIndex - 1;
        //         if (i < 0) {
        //             i = answerBoxes.length - 1;
        //         }
        //         setActive(Number((answerBoxes[i] as HTMLElement).querySelector('.encoding')?.textContent));
        //         setCurrentElement({
        //             index: (answerBoxes[i] as HTMLElement).dataset.index,
        //             ind: (answerBoxes[i] as HTMLElement).dataset.ind,
        //             type: (answerBoxes[i] as HTMLElement).dataset.type,
        //         });
        //     }
        // } else if (event.key === 'ArrowRight') {
        //     if (active !== null) {
        //         const answerBoxes = document.querySelectorAll('.answer-box');
        //         const activeElement = document.querySelector('.active');
        //         const currentAnswerBox = document.querySelector('.current');
        //         const activeIndex = Array.from(answerBoxes).indexOf(activeElement as HTMLElement);
        //         const currentIndex = Array.from(answerBoxes).indexOf(currentAnswerBox as HTMLElement);
        //         let i = activeIndex + 1;
        //         if (i === answerBoxes.length) {
        //             i = 0;
        //         }
        //         setActive(Number((answerBoxes[i] as HTMLElement).querySelector('.encoding')?.textContent));
        //         setCurrentElement({
        //             index: (answerBoxes[i] as HTMLElement).dataset.index,
        //             ind: (answerBoxes[i] as HTMLElement).dataset.ind,
        //             type: (answerBoxes[i] as HTMLElement).dataset.type,
        //         });
        //     }
        // }
    }, [active, handleKeyboardInput]);



    useEffect(() => {
        window.addEventListener('resize', setFullHeight);
        window.addEventListener('orientationchange', setFullHeight);
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('DOMContentLoaded', setFullHeight);

        return () => {
            window.removeEventListener('resize', setFullHeight);
            window.removeEventListener('orientationchange', setFullHeight);
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('DOMContentLoaded', setFullHeight);
        };
    }, [active, userInput, currentElement, actionThread, highlighted, encoding, gameState, clues, words, info, quote, handleKeyDown]);
    if (isPending) {
        return <div>Loading...</div>;
    }
    return (
        <div className="figgerits">
            <div className="quote">
                <ul className="words">
                    {words?.map((word, index) => (
                        <li key={word.join('') + index}>
                            <ul className="letters">
                                {
                                    word.map((char, ind) => (
                                        <li key={char + ind}>
                                            {isEncoded(char) ?
                                                <button
                                                    data-index={index}
                                                    data-ind={ind}
                                                    data-type="quote"
                                                    className={clsx('answer-box', {
                                                        current: currentElement.type == 'quote' && currentElement.index == index && currentElement.ind == ind,
                                                        hover: highlighted === encoding[char.toLowerCase()],
                                                        active: active === encoding[char.toLowerCase()],
                                                    }
                                                    )}
                                                    onClick={(e) => activate(e, encoding[char.toLowerCase()], 'quote')}
                                                    onMouseEnter={() => setHighlighted(encoding[char.toLowerCase()])}
                                                    onMouseLeave={() => setHighlighted(null)}
                                                >
                                                    <span className="user-input">
                                                        {hasValue(encoding[char.toLowerCase()]) ? getValue(encoding[char.toLowerCase()]) : '?'}
                                                    </span>
                                                    <span className="divider"></span>
                                                    <span className="encoding">
                                                        {encoding[char.toLowerCase()]}
                                                    </span>
                                                </button>
                                                :
                                                (char === ' ' ?
                                                    <div className="space" >
                                                        {char}
                                                    </div>
                                                    :
                                                    <div className="non-char" >
                                                        {char}
                                                    </div>)
                                            }
                                        </li>
                                    ))
                                }
                            </ul>
                        </li>
                    ))}
                </ul >

            </div >

            <div className="clues">
                <h3>Definition & words</h3>
                <ul>
                    {clues.map((clue, index) => (
                        <li key={clue.word}>
                            <div className="clue">
                                {clue.clue}
                            </div>
                            <div className="word">
                                <ul className="letters">
                                    {
                                        clue.word.split('').map((char, ind) => (
                                            <li className="" key={`${char}-${ind}`}>
                                                {isEncoded(char) &&
                                                    <button
                                                        data-index={index}
                                                        data-ind={ind}
                                                        data-type="clue"
                                                        className={clsx('answer-box', {
                                                            current: currentElement.type == 'clue' && currentElement.index == index && currentElement.ind == ind,
                                                            hover: highlighted === encoding[char.toLowerCase()],
                                                            active: active === encoding[char.toLowerCase()],
                                                        }
                                                        )}
                                                        onClick={(e) => activate(e, encoding[char.toLowerCase()], 'clue')}
                                                        onMouseEnter={() => setHighlighted(encoding[char.toLowerCase()])}
                                                        onMouseLeave={() => setHighlighted(null)}
                                                    //   :data-index="index" :data-ind="ind" @click="activate($event, encoding[char.toLowerCase()], 'clue')"
                                                    //   @mouseenter="highlight(encoding[char.toLowerCase()])" @mouseleave="highlight(null)"
                                                    >
                                                        <span className="user-input">
                                                            {hasValue(encoding[char.toLowerCase()]) ? getValue(encoding[char.toLowerCase()]) : '?'}
                                                        </span>
                                                        <span className="divider"></span>
                                                        <span className="encoding">
                                                            {encoding[char.toLowerCase()]}
                                                        </span>
                                                    </button>}
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* <Result v-if="gameState.complete" :correct="gameState.correct" :quote="quote" :info="info" @next="handleNextPuzzle"
                @back="handleBack" @reset="handleReset"></Result>*/}
            {gameState.complete &&
                <Result
                    correct={gameState.correct}
                    quote={quote}
                    info={info}
                    onBack={() => console.log('back')}
                    onNext={() => handleNextPuzzle()}
                    onReset={() => console.log('reset')}
                />}
            <Keyboard handleKeyboardInput={handleKeyboardInput} handleDelete={handleDelete} handleUndo={handleUndo}></Keyboard>
        </div >
    )
}
export default Figgerits