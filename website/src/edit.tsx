
import {html} from '@codemirror/lang-html';
import {JSX, query} from './jsx';
import {CodeEditor} from './code_editor';

query('#editor').append(<CodeEditor lang={html()} />);
