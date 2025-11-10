import { stemmer } from 'stemmer';

export function getWordBase(word: string): string {
    return stemmer(word);
}
