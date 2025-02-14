
import {EditorView} from 'codemirror'
import {EditorState, type Extension} from '@codemirror/state'
import {HighlightStyle, syntaxHighlighting, indentUnit, indentOnInput, bracketMatching, foldKeymap, codeFolding} from '@codemirror/language'
import {keymap, ViewPlugin, ViewUpdate, Decoration, DecorationSet, crosshairCursor, highlightSpecialChars, drawSelection, rectangularSelection, dropCursor, highlightActiveLine, highlightActiveLineGutter, lineNumbers} from '@codemirror/view'
import {defaultKeymap, history, historyKeymap, indentWithTab} from '@codemirror/commands'
import {searchKeymap, highlightSelectionMatches} from '@codemirror/search';
import {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from '@codemirror/autocomplete'
import {lintKeymap} from '@codemirror/lint'
// import {vim} from '@replit/codemirror-vim'
// import {emacs} from '@replit/codemirror-emacs'
import {tags, type Tag} from '@lezer/highlight'
import {JSX} from './jsx';
import {type Settings, DEFAULT_SETTINGS, extractCommentData} from './settings';
void JSX;


export interface Config {
    lang: Extension;
    settings?: Settings;
    value?: string;
    readOnly?: boolean;
    onChange?: (value: string, viewUpdate: ViewUpdate) => void;
}

export interface DualConfig extends Config {
    oldValue?: string;
    showChanges?: boolean;
}


/* This function was created by Erik Newland (https://github.com/eriknewland/) and modified by speedydelete.
It is licensed under the MIT license (https://choosealicense.com/licenses/mit/) */
function bracketPairColorization(colors: string[]): Extension[] {
    return [
        ViewPlugin.fromClass(class {
            decorations: DecorationSet;
            openingBrackets: string[] = ['(', '[', '{'];
            closingBrackets: string[] = [')', ']', '}'];
            matchingBrackets: {[key: string]: string} = {')': '(', ']': '[', '}': '{'}
            constructor(view: EditorView) {
                this.decorations = this.getBracketDecorations(view);
            }
            update(update: ViewUpdate): void {
                if (update.docChanged || update.selectionSet || update.viewportChanged) {
                    this.decorations = this.getBracketDecorations(update.view);
                }
            }
            getBracketDecorations(view: EditorView): DecorationSet {
                const {doc} = view.state;
                const decorations: any[] = [];
                const stack: {type: string, from: number}[] = [];
                for (let pos = 0; pos < doc.length; pos++) {
                    const char = doc.sliceString(pos, pos + 1);
                    if (this.openingBrackets.includes(char)) {
                        stack.push({type: char, from: pos});
                    } else if (this.closingBrackets.includes(char)) {
                        const open = stack.pop();
                        if (open && open.type === this.matchingBrackets[char]) {
                            const colorNum = stack.length % colors.length;
                            decorations.push(
                                Decoration.mark({ class: `cm-bpc-${colorNum}` }).range(open.from, open.from + 1),
                                Decoration.mark({ class: `cm-bpc-${colorNum}` }).range(pos, pos + 1),
                            );
                        }
                    }
                }
                decorations.sort((a, b) => a.from - b.from || a.startSide - b.startSide);
                return Decoration.set(decorations);
            }
        }, {decorations: (v) => v.decorations}),
        EditorView.theme(Object.fromEntries(colors.map((x, i) => ['.cm-bpc-' + i, {color: x}]))),
    ]
}


const TAG_VALUES = new Map<string, Tag>();
const TAG_FUNCTIONS = new Map<string, (tag: Tag) => Tag>();
for (const [key, value] of Object.entries(tags)) {
    if (typeof value === 'function') {
        TAG_FUNCTIONS.set(key, value);
    } else {
        TAG_VALUES.set(key, value);
    }
}

function runTagLiteral(key: string): Tag[] {
    key = key.replaceAll(' ', '').replaceAll(')', '');
    return key.split(',').map(key => {
        const parts = key.split('(');
        let out = TAG_VALUES.get(parts.at(-1));
        if (out === undefined) {
            throw new TypeError(`${parts[parts.length - 1]} is not a valid identifier in a tag literal`);
        }
        for (let i = parts.length - 2; i >= 0; i--) {
            const func = TAG_FUNCTIONS.get(parts[i]);
            if (func === undefined) {
                throw new TypeError(`${parts[i]} is not a valid function in a tag literal`);
            }
            out = func(out);
        }
        return out;
    });
}

export function CodeEditor({lang, settings = DEFAULT_SETTINGS, value = '', readOnly = false, onChange}: Config): HTMLDivElement & {view: EditorView} {
    const commentData = extractCommentData(settings.theme);
    let extensions: Extension[] = [
        highlightActiveLine(),
        EditorState.tabSize.of(settings.tabSize),
        indentUnit.of(' '.repeat(settings.tabSize)),
        (readOnly ? [EditorView.editable.of(false), EditorState.readOnly.of(true)] : []),
    ];
    if (onChange) {
        extensions.push(EditorView.updateListener.of(update => {
            if (update.docChanged) {
                onChange(update.view.state.doc.toString(), update);
            }
        }));
    }
    extensions.push(EditorView.theme({}, {dark: commentData.dark}));
    if (settings.syntaxHighlighting) {
        if (lang !== undefined) {
            extensions.push(lang);
        }
        let tokenSettings: {tag: Tag[], [key: string]: unknown}[] = [];
        for (const [key, value] of commentData.tokens) {
            const tag = runTagLiteral(key);
            if (value.includes('{')) {
                tokenSettings.push({tag: tag, ...JSON.parse(value)});
            } else {
                tokenSettings.push({tag: tag, color: value});
            }
        }
        console.log(tokenSettings, commentData);
        extensions.push(syntaxHighlighting(HighlightStyle.define(tokenSettings)));
    }
    // if (settings.vim && !settings.emacs) extensions.push(vim());
    // if (settings.emacs && !settings.vim) extensions.push(emacs());
    extensions.push(keymap.of(defaultKeymap));
    if (settings.lineWrapping) extensions.push(EditorView.lineWrapping);
    if (settings.highlightSpecialChars) extensions.push(highlightSpecialChars());
    if (settings.drawSelection) extensions.push(drawSelection());
    if (settings.multipleSelections) extensions.push(EditorState.allowMultipleSelections.of(true));
    if (settings.rectangularSelection) extensions.push([rectangularSelection(), crosshairCursor()]);
    if (settings.dropCursor) extensions.push(dropCursor());
    if (settings.highlightSelectionMatches) extensions.push(highlightSelectionMatches());
    if (settings.lineNumbers) extensions.push(lineNumbers());
    if (settings.highlightActiveLineGutter) extensions.push(highlightActiveLineGutter());
    if (settings.history) extensions.push([history(), keymap.of(historyKeymap)]);
    if (settings.indentOnInput) extensions.push(indentOnInput());
    if (settings.bracketMatching) extensions.push(bracketMatching());
    if (settings.closeBrackets) extensions.push([closeBrackets(), keymap.of(closeBracketsKeymap)]);
    if (settings.autocompletion) extensions.push([autocompletion(), keymap.of(completionKeymap)]);
    if (settings.codeFolding) {
        extensions.push([codeFolding({placeholderText: commentData.foldText}), keymap.of(foldKeymap)]);
    }
    if (settings.bracketPairColorization && settings.syntaxHighlighting && commentData.bracketColors) {
        extensions.push(bracketPairColorization(commentData.bracketColors));
    }
    if (settings.search) extensions.push(keymap.of(searchKeymap));
    if (settings.indentWithTab) extensions.push(keymap.of([indentWithTab]));
    if (settings.lint) extensions.push(keymap.of(lintKeymap));
    let elt = <div class="editor"></div>;
    elt.view = new EditorView({
        doc: value,
        parent: elt,
        extensions: extensions,
    });
    return elt;
}
