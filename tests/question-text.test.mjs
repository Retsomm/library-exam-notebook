import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const bank=JSON.parse(readFileSync(new URL('../data/bank.json',import.meta.url)));
test('new professional question text remains available on small screens',()=>{for(const q of bank.questions.filter(q=>q.subjectIndex>1)){assert.ok(q.stem.trim(),q.id);for(const option of q.options)assert.ok(option.text.trim(),q.id+option.letter);}});
