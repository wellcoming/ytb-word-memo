import { WordManager } from './manager';
import { getWordBase } from './utils';

export class CaptionProcessor {
    private static readonly WORD_SPLIT_REGEX = /([\w-']+)/;
    private static readonly WORD_TEST_REGEX = /^[a-zA-Z]+(?:['-][a-zA-Z]+)*$/;

    constructor(private wordManager: WordManager) { }

    public processSegment(segment: HTMLElement): void {
        const originalText = segment.textContent || '';
        segment.textContent = '';

        const parts = originalText.split(CaptionProcessor.WORD_SPLIT_REGEX);

        parts.forEach(part => {
            segment.appendChild(this.createNode(part));
        });
    }

    private createNode(part: string): Node {
        if (CaptionProcessor.WORD_TEST_REGEX.test(part)) {
            return this.createWordSpan(part);
        }
        return document.createTextNode(part);
    }

    private createWordSpan(word: string): HTMLElement {
        const span = document.createElement('span');
        span.className = 'ytb-word-memo-word';

        const wordBase = getWordBase(word.toLowerCase());
        span.dataset.wordBase = wordBase;

        const isKnown = this.wordManager.isWordKnown(wordBase);
        span.classList.toggle('unknown', !isKnown);
        span.textContent = word;

        return span;
    }
}

