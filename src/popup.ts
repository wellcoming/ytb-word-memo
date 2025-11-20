import type { TranslateResult } from './translate';

export class Popup {
    private readonly element: HTMLElement;
    private hideTimer: number | null = null;

    constructor() {
        this.element = document.createElement('div');
        this.element.id = 'word-popup';
        document.body.appendChild(this.element);
    }

    public cancelHide() {
        if (this.hideTimer !== null) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }

    public hideDelayed(delay = 300) {
        this.cancelHide();
        this.hideTimer = window.setTimeout(() => {
            this.hideImmediate();
        }, delay);
    }

    public hideImmediate() {
        this.cancelHide();
        this.element.style.display = 'none';
    }

    public showWordResult(word: string, result: TranslateResult, wordElement: HTMLElement) {
        this.renderContent(word, result);
        this.element.style.display = 'block';
        this.positionAboveElement(wordElement);
    }

    private renderContent(word: string, result: TranslateResult) {
        this.clear();

        const fragment = document.createDocumentFragment();
        const card = this.createElement('div', 'popup-card');

        const title = this.createElement('h2', 'popup-title', result.text || word);
        card.appendChild(title);

        const phoneticsLine = this.buildPhoneticsLine(result);
        if (phoneticsLine) {
            const phonetics = this.createElement('p', 'popup-phonetics', phoneticsLine);
            card.appendChild(phonetics);
        }

        const sectionTitle = this.createElement('h3', 'popup-section-title', '基本释义:');
        card.appendChild(sectionTitle);
        card.appendChild(this.buildExplainList(result.explains));

        fragment.appendChild(card);
        this.element.appendChild(fragment);
    }

    private positionAboveElement(element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        const popupRect = this.element.getBoundingClientRect();

        // Horizontal: Center, clamp to window edges
        const left = Math.max(10, Math.min(
            rect.left + (rect.width - popupRect.width) / 2,
            window.innerWidth - popupRect.width - 10
        ));

        // Vertical: Default above (-10px). If too close to top (<10px), flip below
        // Subtitles usually at bottom, so 'above' is preferred and safe
        const topAbove = rect.top - popupRect.height - 10;
        const top = topAbove < 10 ? rect.bottom + 10 : topAbove;

        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;
    }

    private clear() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }

    private createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, className?: string, textContent?: string): HTMLElementTagNameMap[K] {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    }

    private buildExplainList(explains: TranslateResult['explains']): HTMLUListElement {
        const list = this.createElement('ul', 'popup-list');
        if (!explains || explains.length === 0) {
            const item = this.createElement('li', undefined, '暂无详细释义。');
            list.appendChild(item);
            return list;
        }

        explains.forEach(({ pos, tran }) => {
            const parts: string[] = [];
            if (pos) parts.push(pos);
            if (tran) parts.push(tran);
            const text = parts.length > 0 ? parts.join(' ') : '暂无释义详情。';
            const item = this.createElement('li', undefined, text);
            list.appendChild(item);
        });

        return list;
    }

    private buildPhoneticsLine(result: TranslateResult): string | null {
        const { phonetics } = result;
        if (!phonetics) return null;

        const { us, uk } = phonetics;
        if (!us && !uk) {
            return null;
        }

        const format = (label: string, value?: string) => `${label}: [${value || '-'}]`;
        const parts = [format('美', us || '-')];
        parts.push(format('英', uk || '-'));

        return parts.join('    ');
    }
}