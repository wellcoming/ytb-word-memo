import { CaptionProcessor } from './processor';
import { EventHandler } from './handler';
import { WordManager } from './manager';
import { Popup } from './popup';

class App {
    private popup: Popup;
    private wordManager: WordManager;
    private processor: CaptionProcessor;
    private handler: EventHandler;

    constructor() {
        this.popup = new Popup();
        this.wordManager = new WordManager();
        this.processor = new CaptionProcessor(this.wordManager);
        this.handler = new EventHandler(this.wordManager, this.popup);
    }

    public start(): void {
        this.startObserver();
    }

    private startObserver(): void {
        const targetNode = document.querySelector('.ytp-caption-window-container');
        if (!targetNode) {
            setTimeout(() => this.startObserver(), 500);
            return;
        }

        this.handler.attachTo(targetNode as HTMLElement);

        const observer = new MutationObserver(mutations => {
            this.handleMutations(targetNode as HTMLElement, mutations);
        });
        observer.observe(targetNode, { childList: true, subtree: true });
        console.log("YouTube字幕观察器已启动，喵~");
    }

    private handleMutations(targetNode: HTMLElement, mutations: MutationRecord[]): void {
        const captionWindow = targetNode.querySelector('.caption-window') as HTMLElement;
        if (!captionWindow?.lang?.startsWith('en')) return;

        const segments = this.collectSegments(mutations);
        segments.forEach(el => {
            el.dataset.processed = 'true';
            this.processor.processSegment(el);
        });
    }

    private collectSegments(mutations: MutationRecord[]): HTMLElement[] {
        const segments: HTMLElement[] = [];
        for (const mutation of mutations) {
            for (const node of Array.from(mutation.addedNodes)) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;
                const found = (node as HTMLElement).querySelectorAll('.ytp-caption-segment');
                segments.push(...Array.from(found).filter(
                    seg => !(seg as HTMLElement).dataset.processed
                ) as HTMLElement[]);
            }
        }
        return segments;
    }
}

export default App;
