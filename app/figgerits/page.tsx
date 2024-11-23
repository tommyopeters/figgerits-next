'use client';

import { useAuth } from "@clerk/nextjs";
import clsx from "clsx";
import { useEffect, useState } from "react";

function Figgerits() {

    const { isLoaded, userId } = useAuth();

    // useEffect(() => {
    //     if (!isLoaded) return;

    //     if (!userId) {
    //         // Redirect to homepage if not authenticated
    //         router.push('/');
    //       }
    // }, [isLoaded, userId, router]);

    // useEffect(() => {
    //     window.addEventListener('resize', setFullHeight);
    //     window.addEventListener('orientationchange', setFullHeight);
    //     // window.addEventListener('keydown', handleKeyDown);
    //     document.addEventListener('DOMContentLoaded', setFullHeight);
    // }, []);


    const [loading, setLoading] = useState(false);

    const [quote, setQuote] = useState('');
    const [info, setInfo] = useState('');
    const [words, setWords] = useState<string[][] | null>([]);
    const [clues, setClues] = useState<{ word: string; clue: string }[]>([]);
    const [gameState, setGameState] = useState<{ complete: boolean, correct: boolean }>({ complete: false, correct: false });
    const [encoding, setEncoding] = useState<{ [key: string]: number }>({});
    const [active, setActive] = useState<number | null>(null);
    const [highlighted, setHighlighted] = useState<number | null>(null);
    const [actionThread, setActionThread] = useState([]);
    const [userInput, setUserInput] = useState<{ [key: number]: string | null }>({});
    const [currentElement, setCurrentElement] = useState({ type: '', index: 0, ind: 0 });

    function setFullHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    useEffect(() => {
        setLoading(true);
        console.log("FETCING")
        fetch('/api/puzzle')
            .then(response => response.json())
            .then(data => {
                console.log(data)

                if (data) {
                    console.log("Starting game")
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
        setQuote(quoteString);
        setWords(splitWords(quoteString));
        setEncoding(encodeLetters(quoteString));
        Object.keys(encoding).map((i) => {
            // userInput[encoding[i]] = null;
            setUserInput({ ...userInput, [encoding[i]]: "" });
            setActionThread([]);
        });
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
        console.log(uniqueCharacters);
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
        console.log(userInput[num], !!userInput[num])
        return !!userInput[num];
    };

    const getValue = (num: number): string | null => {
        return (userInput as { [key: number]: string | null })[num];
    };

    const isEncoded = (char: string): boolean => {
        return !!encoding[char.toLowerCase()];
    };

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
                                                <div
                                                    className={clsx('answer-box', {
                                                        current: currentElement.type === 'quote' && currentElement.index === ind,
                                                        hover: highlighted === encoding[char.toLowerCase()],
                                                        active: active === encoding[char.toLowerCase()],
                                                    }
                                                    )}>
                                                    <span className="user-input">
                                                        {hasValue(encoding[char.toLowerCase()]) ? getValue(encoding[char.toLowerCase()]) : '?'}
                                                    </span>
                                                    <span className="divider"></span>
                                                    <span className="encoding">
                                                        {encoding[char.toLowerCase()]}
                                                    </span>
                                                </div>
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
                    {clues.map((clue) => (
                        <li key={clue.word}>
                            <div className="clue">
                                {clue.clue}
                            </div>
                            <div className="word">
                                <ul className="letters">
                                    {
                                        clue.word.split('').map((char, ind) => (
                                            <li className="" key={`${char}-${ind}`}>
                                                {isEncoded(char) && <div
                                                    className={clsx('answer-box', {
                                                        current: currentElement.type === 'clue' && currentElement.index === ind,
                                                        hover: highlighted === encoding[char.toLowerCase()],
                                                        active: active === encoding[char.toLowerCase()],
                                                    }
                                                    )}
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
                                                </div>}
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