import CryptoJS from 'crypto-js';
import { GM_xmlhttpRequest } from '$';

const BASE_URL = 'https://dict.youdao.com/jsonapi_s?doctype=json&jsonversion=4';

const translationCache = new Map<string, TranslateResult>();

type QueryPayload = Record<'q' | 'keyfrom' | 'sign' | 'client' | 't', string>;

interface YoudaoResponse {
    ec?: {
        word?: EcWord;
        web_trans?: string[];
        return_phrase: string;
    };
}

interface EcWord {
    usphone?: string;
    usspeech?: string;
    ukphone?: string;
    ukspeech?: string;
    trs?: Explain[];
}

export interface Phonetics {
    us?: string;
    uk?: string;
    usSpeechUrl?: string;
    ukSpeechUrl?: string;
}

export interface Explain {
    pos: string;
    tran: string;
}

export interface TranslateResult {
    text: string;
    phonetics: Phonetics;
    explains: Explain[];
    translations: string[];
}

export async function translate(text: string): Promise<TranslateResult> {
    const normalized = text.trim().toLowerCase();

    if (translationCache.has(normalized)) {
        return translationCache.get(normalized)!;
    }

    if (!normalized) {
        return {
            text: normalized,
            phonetics: {},
            explains: [],
            translations: [],
        };
    }

    const payload = createQueryPayload(normalized);
    const data = await requestDefinition(payload);
    const result = parseResponse(data);
    translationCache.set(normalized, result);
    return result;
}

function createQueryPayload(text: string): QueryPayload {
    const keyfrom = 'webdict';
    const client = 'web';
    const secret = 'Mk6hqtUp33DGGtoS63tTJbMUYjRrG1Lu';
    const base = `${text}${keyfrom}`;
    const time = base.length % 10;
    const baseHash = md5(base);
    const sign = md5(`${client}${text}${time}${secret}${baseHash}`);

    return {
        q: text,
        keyfrom,
        sign,
        client,
        t: String(time),
    };
}

function md5(value: string): string {
    return CryptoJS.MD5(value).toString(CryptoJS.enc.Hex);
}

async function requestDefinition(payload: QueryPayload): Promise<YoudaoResponse> {
    const body = new URLSearchParams(payload).toString();

    return new Promise<YoudaoResponse>((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'POST',
            url: BASE_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': 'https://dict.youdao.com/',
            },
            data: body,
            responseType: 'json',
            onload: response => {
                if (response.status >= 200 && response.status < 300) {
                    const payload = response.response ?? response.responseText;
                    try {
                        const json = typeof payload === 'string' ? JSON.parse(payload) : payload;
                        resolve(json as YoudaoResponse);
                    } catch (error) {
                        reject(new Error('Failed to parse Youdao response as JSON'));
                    }
                } else {
                    reject(new Error(`Youdao request failed with status ${response.status}`));
                }
            },
            onerror: () => {
                reject(new Error('Youdao request failed due to a network error'));
            },
            ontimeout: () => {
                reject(new Error('Youdao request timed out'));
            },
        });
    });
}

function parseResponse(data: YoudaoResponse): TranslateResult {
    const word = data.ec?.word;

    const phonetics: Phonetics = {
        us: word?.usphone,
        uk: word?.ukphone,
        usSpeechUrl: word?.usspeech ? buildSpeechUrl(word.usspeech) : undefined,
        ukSpeechUrl: word?.ukspeech ? buildSpeechUrl(word.ukspeech) : undefined,
    };

    const explains: Explain[] = word?.trs ?? []
    // .filter(item => Boolean(item.tran))
    const translations = data.ec?.web_trans ?? [];
    const text = data.ec?.return_phrase ?? '';

    return {
        text,
        phonetics,
        explains,
        translations,
    };
}

function buildSpeechUrl(value: string): string {
    return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(value)}`;
}

