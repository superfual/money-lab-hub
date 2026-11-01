import test from 'node:test';import assert from 'node:assert/strict';
import {lessonHTML,tokenRoadmap} from '../dist/lessons.mjs';
import {QUESTIONS} from '../dist/events.mjs';
import {LEVELS} from '../dist/levels.mjs';import {hubCleared} from '../dist/competition.mjs';import {createGame,score} from '../dist/engine.mjs';
test('higher clear thresholds reject a solvent 55-point Easy year and accept 60',()=>{assert.deepEqual(Object.values(LEVELS).map(l=>l.target),[60,70,75]);const s=createGame();Object.assign(s,{month:12,phase:'finished',started:true,cash:14800,reserve:0});assert.equal(score(s).total,55);assert.equal(hubCleared(s),false);s.reserve=600;assert.equal(score(s).total,60);assert.equal(hubCleared(s),true);s.shortfall=1;assert.equal(hubCleared(s),false);});
test('lessons cover every decision type in both languages without leaking multiplayer answers',()=>{for(const lang of ['vi','en']){for(const type of ['opportunity','expense','market','learn','salary','start']){const html=lessonHTML({type,choice:'skip',eventId:'unknown',bonus:600,change:-250},lang,false);assert.ok(html.includes('money-lesson'));assert.equal((html.match(/<p>/g)||[]).length,3);}assert.ok(tokenRoadmap(lang).includes('OKB'));}});

test('multiplayer lesson keeps exact quiz explanation private',()=>{const q=QUESTIONS[0];for(const lang of ['vi','en']){assert.ok(!lessonHTML({type:'learn',questionId:q.id},lang,false).includes(q[lang][3]));assert.ok(lessonHTML({type:'learn',questionId:q.id},lang,true).includes(q[lang][3]));}});
