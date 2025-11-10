import { translate } from './translate';
import { WordManager } from './word-manager';
import { Popup } from './popup';
import { getWordBase } from './utils';

class App {
    private popup: Popup;
    private wordManager: WordManager;

    constructor() {
        this.popup = new Popup();
        this.wordManager = new WordManager();
    }
    public start() {
        this.startObserver();
    }

    private startObserver() {
        const targetNode = document.querySelector('.ytp-caption-window-container');
        if (!targetNode) {
            setTimeout(() => this.startObserver(), 500);
            return;
        }

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of Array.from(mutation.addedNodes)) {
                    if (node.nodeType !== 1) continue;
                    const segments = (node as HTMLElement).querySelectorAll('.ytp-caption-segment');
                    for (const segment of Array.from(segments)) {
                        const el = segment as HTMLElement;
                        if (el.dataset.processed) continue;
                        el.dataset.processed = 'true';
                        this.processCaptionSegment(el);
                    }
                }
            }
        });
        observer.observe(targetNode, { childList: true, subtree: true });
        console.log("YouTube字幕观察器已启动，喵~");
    }

    private processCaptionSegment(segment: HTMLElement) {
        const originalText = segment.textContent || '';
        segment.textContent = '';
        const parts = originalText.split(/([\w]+(?:['’-][\w]+)*)/);

        parts.forEach(part => {
            segment.appendChild(this.createNodeForPart(part));
        });
    }

    private createNodeForPart(part: string): Node {
        if (/^[a-zA-Z-’]+$/.test(part)) {
            return this.createWordSpan(part);
        }

        return document.createTextNode(part);
    }

    private createWordSpan(word: string): HTMLElement {
        const span = document.createElement('span');
        span.className = 'ytb-word-memo-word';

        const wordBase = getWordBase(word.toLowerCase());
        let currentKnownState = this.wordManager.isWordKnown(word);
        let translation = '';

        const updateDisplay = () => {
            span.classList.toggle('unknown', !currentKnownState);
            // span.textContent = !currentKnownState && translation ? translation : word;
            span.textContent = word;
        };

        updateDisplay();

        // 不认识的单词立即加载翻译
        // if (!currentKnownState) {
        //     translate(word).then(result => {
        //         translation = result.translations?.[0]?.trim() || '';
        //         updateDisplay();
        //     }).catch(() => { });
        // }

        span.addEventListener('click', (event) => {
            event.stopPropagation();
            currentKnownState = !currentKnownState;
            this.wordManager[currentKnownState ? 'addWord' : 'removeWord'](wordBase);
            this.wordManager.saveWords();
            updateDisplay();
            this.popup.hideImmediate();
        });

        span.addEventListener('mouseover', async (event) => {
            this.popup.cancelHide();
            const result = await translate(word);
            if (!translation) {
                translation = result.translations?.[0]?.trim() || '';
                updateDisplay();
            }
            this.popup.showWordResult(word, result, { x: event.clientX, y: event.clientY });
        });

        span.addEventListener('mouseout', () => {
            this.popup.hideDelayed();
        });

        return span;
    }
}

export default App;
