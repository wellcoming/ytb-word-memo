import { GM_getValue, GM_setValue } from '$';
import { getWordBase } from './utils';

const DEFAULT_KNOWN_WORDS = ['i', 'you', 'are', 'is', 'a', 'the', 'to', 'in', 'on', 'of', 'and', 'for', 'it', 'me', 'my', 'your', 'he', 'she', 'it', 'we', 'they', 'him', 'her', 'us', 'them', 'this', 'that', 'these', 'those', 'have', 'has', 'had', 'do', 'does', 'did', 'not', 'can', 'could', 'will', 'would', 'should', 'may', 'might', 'must', 'about', 'just', 'more', 'what', 'where', 'when', 'why', 'how', 'one', 'two', 'three', 'four', 'five', 'get', 'go', 'come', 'make', 'take', 'see', 'look', 'want', 'need', 'like', 'love', 'know', 'think', 'say', 'tell', 'speak', 'talk'];

export class WordManager {
    private knownWords: Set<string>;

    constructor() {
        this.knownWords = new Set(GM_getValue('knownWords', DEFAULT_KNOWN_WORDS));
    }

    public isWordKnown(word: string): boolean {
        const lowerWord = word.toLowerCase();
        return this.knownWords.has(lowerWord) || this.knownWords.has(getWordBase(lowerWord));
    }

    public addWord(word: string) {
        this.knownWords.add(word);
    }

    public removeWord(word: string) {
        this.knownWords.delete(word);
    }

    public getWords(): Set<string> {
        return this.knownWords;
    }

    public setWords(words: Set<string>) {
        this.knownWords = words;
    }

    public saveWords() {
        GM_setValue('knownWords', Array.from(this.knownWords));
    }
}
