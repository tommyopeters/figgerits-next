import { CornerDownLeft, Delete } from "lucide-react"

interface KeyboardProps {
    handleKeyboardInput: (letter: string) => void;
    handleDelete: () => void;
    handleUndo: () => void;
}

function Keyboard({handleKeyboardInput, handleDelete, handleUndo}: KeyboardProps) {

    const handleClick = (letter: string) => {
        handleKeyboardInput(letter);
    }

    return (
        <div className="keyboard">
            <div className="row">
                <button onClick={() => handleClick('q')}>Q</button>
                <button onClick={() => handleClick('w')}>W</button>
                <button onClick={() => handleClick('e')}>E</button>
                <button onClick={() => handleClick('r')}>R</button>
                <button onClick={() => handleClick('t')}>T</button>
                <button onClick={() => handleClick('y')}>Y</button>
                <button onClick={() => handleClick('u')}>U</button>
                <button onClick={() => handleClick('i')}>I</button>
                <button onClick={() => handleClick('o')}>O</button>
                <button onClick={() => handleClick('p')}>P</button>
            </div>
            <div className="row">
                <button onClick={() => handleClick('a')}>A</button>
                <button onClick={() => handleClick('s')}>S</button>
                <button onClick={() => handleClick('d')}>D</button>
                <button onClick={() => handleClick('f')}>F</button>
                <button onClick={() => handleClick('g')}>G</button>
                <button onClick={() => handleClick('h')}>H</button>
                <button onClick={() => handleClick('j')}>J</button>
                <button onClick={() => handleClick('k')}>K</button>
                <button onClick={() => handleClick('l')}>L</button>
            </div>
            <div className="row">
                <button onClick={() => handleUndo()} className="action-button undo"><CornerDownLeft width="30" height="30" /></button>
                <button onClick={() => handleClick('z')}>Z</button>
                <button onClick={() => handleClick('x')}>X</button>
                <button onClick={() => handleClick('c')}>C</button>
                <button onClick={() => handleClick('v')}>V</button>
                <button onClick={() => handleClick('b')}>B</button>
                <button onClick={() => handleClick('n')}>N</button>
                <button onClick={() => handleClick('m')}>M</button>
                <button onClick={() => handleDelete()} className="action-button delete"><Delete width="30" height="30" /></button>
            </div>
        </div>
    )
}
export default Keyboard