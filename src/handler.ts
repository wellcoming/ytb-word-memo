import { translate } from './translate';
import { Popup } from './popup';
import { WordManager } from './manager';

export class EventHandler {
    private pendingTranslation: number | null = null;

    constructor(
        private wordManager: WordManager,
        private popup: Popup
    ) { }

    public attachTo(container: HTMLElement): void {
        container.addEventListener('click', this.handleClick.bind(this));
        container.addEventListener('mouseover', this.handleMouseover.bind(this));
        container.addEventListener('mouseout', this.handleMouseout.bind(this));
    }

    private handleClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.classList.contains('ytb-word-memo-word')) return;

        event.stopPropagation();

        const wordBase = target.dataset.wordBase;
        if (!wordBase) return;

        const newKnownState = !this.wordManager.isWordKnown(wordBase);
        this.wordManager[newKnownState ? 'addWord' : 'removeWord'](wordBase);
        this.wordManager.saveWords();

        this.updateWordStyles(wordBase, newKnownState);
        this.popup.hideImmediate();
    }

    private handleMouseover(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.classList.contains('ytb-word-memo-word')) return;

        this.popup.cancelHide();

        if (this.pendingTranslation) {
            clearTimeout(this.pendingTranslation);
        }

        const word = target.textContent || '';

        this.pendingTranslation = window.setTimeout(async () => {
            const result = await translate(word);
            this.popup.showWordResult(word, result, target);
            this.pendingTranslation = null;
        }, 150);
    }

    private handleMouseout(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.classList.contains('ytb-word-memo-word')) return;

        if (this.pendingTranslation) {
            clearTimeout(this.pendingTranslation);
            this.pendingTranslation = null;
        }

        this.popup.hideDelayed();
    }

    private updateWordStyles(wordBase: string, isKnown: boolean): void {
        const allWordSpans = document.querySelectorAll(
            `.ytb-word-memo-word[data-word-base="${wordBase}"]`
        );
        allWordSpans.forEach(span => {
            span.classList.toggle('unknown', !isKnown);
        });
    }
}

