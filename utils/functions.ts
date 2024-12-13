
export const splitWords = (quote: string): string[][] => {
    const wordsArray = quote.split(' ');
    const charactersArray = [];
    for (const word of wordsArray) {
        const characters = word.split('');
        charactersArray.push(characters);
    }
    return charactersArray;
};

export const getUniqueCharacters = (quote: string): string[] => {
    const uniqueCharacters: string[] = [];
    const characters: string[] = quote.toLowerCase().match(/[a-z]/g) || [];

    for (const char of characters) {
        if (!uniqueCharacters.includes(char)) {
            uniqueCharacters.push(char);
        }
    }

    return uniqueCharacters;
};

export const encodeLetters = (quote: string): { [key: string]: number } => {
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
