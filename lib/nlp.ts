interface TrieNode {
    children: { [key: string]: TrieNode };
    end?: boolean;
}

export const dfs = (node: TrieNode, word: string, words: string[], characters: string[]): void => {
    if (node.end) {
        words.push(word);
    }
    for (const char of characters) {
        if (node.children[char]) {
            dfs(node.children[char], word + char, words, characters);
        }
    }
}

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

export const excludeWordsWithoutCharacters = (words: string[], characters: string[]): string[] => {
    return words.filter(word => [...word].every(char => characters.includes(char)));
}

export const excludeUsedWords = (words: string[], usedWords: string[]): string[] => {
    return words.filter(word => !usedWords.includes(word));
}

export const getUniqueWords = (quote: string): string[] => {
    const uniqueWords: string[] = [];
    const words: string[] = quote.toLowerCase().match(/[a-z]+/g) || [];

    for (const word of words) {
        if (!uniqueWords.includes(word)) {
            uniqueWords.push(word);
        }
    }

    return uniqueWords;
}


export function removeSecondaryFromPrimary(primary: Set<string>, secondary: Set<string>): Set<string> {
    return new Set([...primary].filter(alphabet => !secondary.has(alphabet)));
}

interface SelectWordsParams {
    words: string[];
    alphabets: string[];
}

export function selectWords({ words, alphabets }: SelectWordsParams): string[] {
    let remainingAlphabets: Set<string> = new Set(alphabets);
    const chosenWords: string[] = [];

    while (remainingAlphabets.size > 0) {
        words.sort((a, b) => {
            const countA: number = Array.from(a).filter(alphabet => remainingAlphabets.has(alphabet)).length;
            const countB: number = Array.from(b).filter(alphabet => remainingAlphabets.has(alphabet)).length;
            return countB - countA;
        });
        const chosenWord: string | undefined = words.shift();
        if (chosenWord) {
            chosenWords.push(chosenWord);

            const wordAlphabets: Set<string> = new Set(chosenWord);
            remainingAlphabets = removeSecondaryFromPrimary(remainingAlphabets, wordAlphabets);
        }
    }

    return chosenWords;
}