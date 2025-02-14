
import type {EnumHtmlAttributes} from 'html-element-attributes-typescript';


export type Node = HTMLElement | string | Text | DocumentFragment;

// @ts-ignore
type HTMLAttributesMap<T extends keyof HTMLElementTagNameMap> = (typeof EnumHtmlAttributes)[T];

type ReverseHTMLElementTagNameMap<T extends HTMLElement> = {[K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] extends T ? K : never}[keyof HTMLElementTagNameMap];


export function createElement<T extends HTMLElement | (keyof HTMLElementTagNameMap) | ((props: {children?: Node[], [key: string]: unknown}) => HTMLElement | DocumentFragment)>(type: T, props: {[key: string]: unknown} = {}, children: Node | Node[]): HTMLElement | DocumentFragment {
    if (!(children instanceof Array)) {
        children = [children];
    }
    if (typeof type === 'function') {  
        if (props.children === undefined) {
            if (children.length > 0) {
                props.children = children;
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
        for (const child of children) {
            // console.log('appending', elt, child);
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

export function query(query: string): HTMLElement {
    const out = document.querySelector(query);
    if (out === null) {
        throw new TypeError(`missing query ${query}`);
    }
    return out as HTMLElement;
}


export const JSX = {
    createElement,
    Fragment,
}

export default JSX;
