import {LEVELS} from './levels.mjs';
import {score} from './engine.mjs';
export function stageResult(game){const l=LEVELS[game.difficulty];if(!l)throw Error('INVALID_LEVEL');const points=score(game).total,survived=game.month===12&&game.shortfall===0,won=survived&&points>=l.target,reward=won?l.rewardBase+Math.floor((points-l.target)/5)*l.rewardStep:0;return {level:game.difficulty,points,survived,won,bond:l.bond,refund:won?l.bond:0,loss:won?0:l.bond,reward};}
