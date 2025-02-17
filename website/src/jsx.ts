
import type {EnumHtmlAttributes} from 'html-element-attributes-typescript';


export type Node = HTMLElement | string | Text | DocumentFragment;

// @ts-ignore
type HTMLAttributesMap<T extends keyof HTMLElementTagNameMap> = (typeof EnumHtmlAttributes)[T];

type ReverseHTMLElementTagNameMap<T extends HTMLElement> = {[K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] extends T ? K : never}[keyof HTMLElementTagNameMap];


export function createElement<T extends HTMLElement | (keyof HTMLElementTagNameMap) | ((props: {children?: Node[], [key: string]: unknown}) => HTMLElement | DocumentFragment)>(type: T, props: {[key: string]: unknown} = {}, ...children: (Node | Node[])[]): HTMLElement | DocumentFragment {
    const flatChildren: Node[] = children.flat();
    if (typeof type === 'function') {  
        if (props.children === undefined) {
            if (children.length > 0) {
                props.children = flatChildren;
            } else {
                props.children = [];
            }
        }
        return type(props);
    } else {
        let elt: HTMLElement;
        if (typeof type === 'string') {
            elt = document.createElement(type);
        } else {
            elt = type;
        }
        for (const [key, value] of Object.entries(props)) {
            elt.setAttribute(key, String(value));
        }
        for (const child of flatChildren) {
            elt.append(child);
        }
        return elt;
    }
}

export function Fragment({children}: {children: Node[]}): Node {
    let out = document.createDocumentFragment();
    for (const child of children) {
        out.append(child);
    }
    return out;
}

export const JSX = {
    createElement,
    Fragment,
}


export function query(query: string): HTMLElement {
    const out = document.querySelector(query);
    if (out === null) {
        throw new TypeError(`missing query ${query}`);
    }
    return out as HTMLElement;
}

export function makeShowHideButton(button: HTMLElement, a: HTMLElement, b: HTMLElement, func?: (shown: boolean) => void): void {
    let aShown = true;
    const aDisplay = a.style.display;
    const bDisplay = b.style.display;
    b.style.display = 'none';
    button.addEventListener('click', () => {
        aShown = !aShown;
        if (aShown) {
            a.style.display = aDisplay;
            b.style.display = 'none';
        } else {
            a.style.display = 'none';
            b.style.display = bDisplay;
        }
        func(aShown);
    });
}

