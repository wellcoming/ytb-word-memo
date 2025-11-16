import { CaptionProcessor } from './processor';
import { EventHandler } from './handler';
import { WordManager } from './manager';
import { Popup } from './popup';

class App {
    private popup: Popup;
    private wordManager: WordManager;
    private processor: CaptionProcessor;
    private handler: EventHandler;
    private currentTarget: Element | null = null;

    constructor() {
        this.popup = new Popup();
        this.wordManager = new WordManager();
        this.processor = new CaptionProcessor(this.wordManager);
        this.handler = new EventHandler(this.wordManager, this.popup);
    }

    public start(): void {
        setInterval(() => {
            if (!this.currentTarget || !document.contains(this.currentTarget)) {
                const target = document.querySelector('.ytp-caption-window-container');
                if (target) this.startObserver(target);
            }
        }, 500);
    }

    private startObserver(targetNode: Element): void {
        this.currentTarget = targetNode;
        this.handler.attachTo(targetNode as HTMLElement);
        new MutationObserver(mutations => this.handleMutations(mutations))
            .observe(targetNode, { childList: true, subtree: true });
        console.log("YouTube字幕观察器已启动，喵~", targetNode);
    }

    private handleMutations(mutations: MutationRecord[]): void {
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
