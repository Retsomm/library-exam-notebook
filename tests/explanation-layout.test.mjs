import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const component=readFileSync(new URL('../components/answer-explanation.tsx',import.meta.url),'utf8');
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
 assert.match(styles,/\.answer-explanation p\{text-wrap:pretty\}/);
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
