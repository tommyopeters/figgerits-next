'use client';

// import { useAuth } from "@clerk/nextjs";
import clsx from "clsx";
import { use, useEffect, useState } from "react";

type ElementType = string | number | undefined;

interface CurrentElement {
    type: ElementType,
    index: ElementType,
    ind: ElementType
}

interface Encoding {
    [key: string]: number;

}

function Figgerits() {

    // const { isLoaded, userId } = useAuth();

    // useEffect(() => {
    //     if (!isLoaded) return;

    //     if (!userId) {
    //         // Redirect to homepage if not authenticated
    //         router.push('/');
    //       }
    // }, [isLoaded, userId, router]);


    const handleKeyDown = (event: KeyboardEvent) => {

        if (active === null) return;


        if (!/^[a-zA-Z]$/.test(event.key)) return;
        handleKeyboardInput(event.key.toLowerCase());
    };



    const [loading, setLoading] = useState(false);

    const [quote, setQuote] = useState('');
    const [info, setInfo] = useState('');
    const [words, setWords] = useState<string[][] | null>([]);
    const [clues, setClues] = useState<{ word: string; clue: string }[]>([]);
    const [gameState, setGameState] = useState<{ complete: boolean, correct: boolean }>({ complete: false, correct: false });
    const [encoding, setEncoding] = useState<Encoding>({});
    const [active, setActive] = useState<number | null>(null);
    const [highlighted, setHighlighted] = useState<number | null>(null);
    const [actionThread, setActionThread] = useState<{
        previousCharacter: string | null,
        character: string,
        active: number | null,
        currentElement: CurrentElement
    }[]>([]);
    const [userInput, setUserInput] = useState<{ [key: number]: string | null }>({});
    const [currentElement, setCurrentElement] = useState<CurrentElement>({ type: '', index: 0, ind: 0 });


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

    function setFullHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    useEffect(() => {
        setLoading(true);

        fetch('/api/puzzle')
            .then(response => response.json())
            .then(data => {


                if (data) {

                    startGame(data.quote, data.clues, data.info);
                    setLoading(false);
                }
                // setQuote(data.quote);
                // setInfo(data.info);
                // setWords(data.words);
                // setClues(data.clues);
                // setGameState({ correct: false, complete: false });
                // setEncoding({});
                // setActive('');
                // setHighlighted('');
                // setHistory([]);
                // setUserInput('');
                // setCurrentElement({ type: '', index: 0, ind: 0 });
            });

    }, []);

    const startGame = (quoteString: string, gameClues: { word: string, clue: string }[], infoString: string) => {
        const encodedLetters = encodeLetters(quoteString);
        setQuote(quoteString);
        setWords(splitWords(quoteString));
        setEncoding(encodedLetters);
        const initialUserInput: { [key: number]: string | null } = {};
        Object.keys(encodedLetters).forEach((key) => {
            initialUserInput[encodedLetters[key]] = null;
        });
        setUserInput(initialUserInput);
        setClues(gameClues);
        setInfo(infoString);
    };



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

    const getUniqueCharacters = (quote: string): string[] => {
        const uniqueCharacters: string[] = [];
        const characters: string[] = quote.toLowerCase().match(/[a-z]/g) || [];

        for (const char of characters) {
            if (!uniqueCharacters.includes(char)) {
                uniqueCharacters.push(char);
            }
        }

        return uniqueCharacters;
    };

    const encodeLetters = (quote: string): { [key: string]: number } => {
        const uniqueCharacters = getUniqueCharacters(quote);

        const encodedLetters: { [key: string]: number } = {};

        for (const char of uniqueCharacters) {
            let randomNum;
            do {
                randomNum = Math.floor(Math.random() * uniqueCharacters.length + 1);
            } while (Object.values(encodedLetters).includes(randomNum));
            encodedLetters[char] = randomNum;
        }

        return encodedLetters;
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

    const handleKeyboardInput = (character: string) => {
        if (active !== null) {
            setActionThread([...actionThread, {
                previousCharacter: userInput[active],
                character,
                active: active,
                currentElement: currentElement
            }]);
            // (userInput.value as { [key: number]: string | null })[active.value] = character.toLowerCase();
            setUserInput({ ...userInput, [active]: character.toLowerCase() });
        }
    };

    useEffect(() => {
        if (Object.values(userInput).every((value) => value !== null)) {
            console.log('All characters are filled!');

            const isCorrect = (Object.keys(encoding).every((char) => {
                return userInput[encoding[char]] === char;
            }))

            setGameState({
                complete: true,
                correct: isCorrect
            });

            if (isCorrect) {
                // store.dispatch('completePuzzle')
            }
        } else {
            const answerBoxes = document.querySelectorAll('.answer-box');
            const activeElements = document.querySelectorAll('.active');
            // check if there is an element with 'current' classname
            const currentAnswerBox = document.querySelector('.current');

            let activeElement;
            if (currentAnswerBox) {
                activeElement = currentAnswerBox

            } else {
                activeElement = activeElements.length > 0 ? activeElements[0] : null;
            }



            if (activeElement !== null) {
                let i = Array.from(answerBoxes).indexOf(activeElement) + 1;

                while (true) {
                    if (i === answerBoxes.length) {
                        i = 0;
                        console.log('turning around')
                    }
                    const encodingElement = answerBoxes[i].querySelector('.encoding');
                    const encoding = encodingElement?.textContent ? Number(encodingElement.textContent) : null;
                    if (!!encoding && !hasValue(encoding)) {
                        setActive(encoding);
                        setCurrentElement({
                            index: (answerBoxes[i] as HTMLElement).dataset.index,
                            ind: (answerBoxes[i] as HTMLElement).dataset.ind,
                            type: (answerBoxes[i] as HTMLElement).dataset.type,
                        })
                        break;
                    }

                    i++;
                }
            }
        }
    }, [userInput]);

    return (
        loading ? <div>Loading...</div> :
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
                @back="handleBack" @reset="handleReset"></Result>
                <Keyboard @clicked="handleKeyboardInput" @delete="handleDelete" @undo="handleUndo"></Keyboard> */}
            </div >
    )
}
export default Figgerits