import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const component=readFileSync(new URL('../components/answer-explanation.tsx',import.meta.url),'utf8');
const practice=readFileSync(new URL('../components/question-practice.tsx',import.meta.url),'utf8');
const styles=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');

test('explanation option labels and their text share one responsive row',()=>{
 assert.match(component,/className="option-explanation-letter"/);
 assert.match(component,/className="option-explanation-text"/);
 assert.match(styles,/\.option-explanations dt\{[^}]*display:grid;[^}]*grid-template-columns:max-content minmax\(0,1fr\)/);
 assert.match(styles,/\.option-explanation-text>p\{margin:0\}/);
});

test('explanation prose uses natural Chinese wrapping',()=>{
 assert.match(styles,/\.answer-explanation\{[^}]*overflow-wrap:break-word;word-break:normal;line-break:auto/);
 assert.doesNotMatch(styles,/\.answer-explanation\{[^}]*overflow-wrap:anywhere/);
 assert.match(styles,/\.answer-explanation p\{text-wrap:wrap\}/);
});

test('inline code in explanations receives code styling instead of visible backticks',()=>{
 assert.match(component,/const ExplanationText=/);
 assert.match(component,/className="explanation-inline-code"/);
 assert.match(styles,/\.explanation-inline-code\{/);
});

test('structured explanation diagrams are responsive and accessible',()=>{
 const diagram=readFileSync(new URL('../components/explanation-diagram.tsx',import.meta.url),'utf8');
 assert.match(diagram,/<svg[^>]*role="img"[^>]*aria-label=/);
 assert.match(diagram,/<title>/);
 assert.match(diagram,/diagram\.sequence\.join\('，'\)/);
 assert.match(styles,/\.explanation-diagram svg\{[^}]*width:100%;height:auto/);
});

test('reading passages use the selected reading size without a framed small-text box',()=>{
 assert.match(practice,/className="question-passage" style=\{\{fontSize\}\}/);
 assert.match(practice,/className="question-stem" style=\{\{fontSize\}\}/);
 assert.doesNotMatch(practice,/q\.passage && <section className="passage"/);
 assert.match(styles,/\.question-passage\{[^}]*padding:0;[^}]*border:0;[^}]*background:transparent;[^}]*line-height:1\.95/);
});

test('dialog prose stretches in a flex column and uses paragraphs instead of preserved PDF line breaks',()=>{
 assert.match(styles,/\.explanation-dialog-content\{display:flex;flex-direction:column;align-items:stretch;min-width:0;padding:20px 24px/);
 assert.match(styles,/\.explanation-dialog-content>\*\{flex-shrink:0;min-width:0;max-width:100%/);
 assert.match(styles,/\.explanation-dialog \.explanation-summary\{white-space:normal;text-wrap:wrap/);
 assert.match(component,/<div className="explanation-summary">/);
 assert.doesNotMatch(styles,/text-wrap:pretty/);
});
