
export interface Settings {
    version: number,
    tabSize: number,
    theme: string,
    vim: boolean,
    emacs: boolean,
    syntaxHighlighting: boolean,
    collapseUnchanged: boolean,
    lineWrapping: boolean,
    highlightSpecialChars: boolean,
    drawSelection: boolean,
    multipleSelections: boolean,
    rectangularSelection: boolean,
    dropCursor: boolean,
    highlightSelectionMatches: boolean,
    lineNumbers: boolean,
    highlightActiveLineGutter: boolean,
    history: boolean,
    indentOnInput: boolean,
    bracketMatching: boolean,
    closeBrackets: boolean,
    autocompletion: boolean,
    indentWithTab: boolean,
    bracketPairColorization: boolean,
    codeFolding: boolean,
    search: boolean,
    lint: boolean,
}

export type SettingsKey = keyof Settings;
export type SettingsValue = Settings[SettingsKey];


const DEFAULT_THEME = `/*
    * @wildeast-type dark
    * @wildeast-token heading {"fontWeight": "bold"}
    * @wildeast-token strong {"fontWeight": "bold"}
    * @wildeast-token emphasis {"fontWeight": "italic"}
    * @wildeast-token strikethrough {"textDecoration": "line-through"}
    * @wildeast-token link {"color": "#6a9955", "textDecoration": "underline"}
    * @wildeast-token comment #69aa55
    * @wildeast-token invalid #f44747
    * @wildeast-token variableName #9cdcfe
    * @wildeast-token typeName #5c9cd6
    * @wildeast-token propertyName #9cdcfe
    * @wildeast-token className #4ec9b0
    * @wildeast-token constant(name) #4fc1ff
    * @wildeast-token function(name) #dcdcaa
    * @wildeast-token string #ce9178
    * @wildeast-token number #b5cea8
    * @wildeast-token bool #5c9cd6
    * @wildeast-token regexp #d16969
    * @wildeast-token escape #d7ba7d
    * @wildeast-token color #ce9178
    * @wildeast-token keyword #569cd6
    * @wildeast-token controlKeyword #c586c0
    * @wildeast-token moduleKeyword #c586c0
    * @wildeast-token self #569cd6
    * @wildeast-token null #569cd6
    * @wildeast-token atom #569cd6
    * @wildeast-token unit #569cd6
    * @wildeast-token operator #d4d4d4
    * @wildeast-token angleBracket #808080
    * @wildeast-token paren #569cd6
    * @wildeast-token brace #b267e6
    * @wildeast-token documentMeta #6a9955
    * @wildeast-token inserted #b5cea8
    * @wildeast-token deleted #ce9178
    * @wildeast-token changed #569cd6
    * @wildeast-bracket-colors #d7ba7d #b267e6 #5c9cd6
*/`;


export const DEFAULT_SETTINGS: Settings = {
    version: 1,
    tabSize: 4,
    theme: DEFAULT_THEME,
    vim: false,
    emacs: false,
    syntaxHighlighting: true,
    collapseUnchanged: true,
    lineWrapping: true,
    highlightSpecialChars: true,
    drawSelection: true,
    multipleSelections: true,
    rectangularSelection: true,
    dropCursor: true,
    highlightSelectionMatches: true,
    lineNumbers: true,
    highlightActiveLineGutter: true,
    history: true,
    indentOnInput: true,
    bracketMatching: true,
    closeBrackets: true,
    autocompletion: true,
    indentWithTab: true,
    bracketPairColorization: true,
    codeFolding: true,
    search: true,
    lint: true,
}


export function convertTabSize(value: string, oldSize: number, newSize: number): string {
    return value.replace(/\t/g, ' '.repeat(oldSize)).split('\n').map(
        (line) => {
            const extra: number = line.length - line.trimStart().length;
            return ' '.repeat(newSize * extra / oldSize) + line.slice(extra);
        }
    ).join('\n');
}


interface CommentData {
    name: string;
    title: string;
    dark: boolean;
    tokens: [string, string][];
    foldText: string;
    bracketColors: string[] | null;
}

export function extractCommentData(code: string): CommentData {
    let name = '';
    let title = null;
    let dark = false;
    let tokens: [string, string][] = [];
    let bracketColors = null;
    let foldText = '...';
    for (const match of code.matchAll(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g)) {
        const data = match[0].slice(2, -2);
        for (const match of data.matchAll(/\*\s?@wildeast-([^ \n]+) ([^\n]+)\n/g)) {
            const key = match[1];
            const value = match[2];
            if (key === 'name') {
                name = value;
            } else if (key === 'title') {
                title = value;
            } else if (key === 'type') {
                if (value === 'dark') {
                    dark = true;
                } else if (value === 'light') {
                    dark = false;
                }
            } else if (key === 'token') {
                const token = value.split(' ');
                tokens.push([token[0], token.slice(1).join(' ')]);
            } else if (key === 'bracket-colors') {
                bracketColors = value.split(' ');
            } else if (key === 'fold-text') {
                foldText = value;
            }
        }
    }
    title ??= name;
    return {name, title, dark, tokens, bracketColors, foldText};
}
