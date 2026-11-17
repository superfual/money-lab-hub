// Keep optional explanations available without displacing the current decision.
export function compactDecision(root,lang,s){if(!root)return;if(s?.started){const month=Math.max(0,Math.min(12,Number(s.month)||0));const old=root.querySelector(':scope > .decision-month');if(old)old.remove();const badge=document.createElement('span');badge.className='decision-month';badge.textContent=(lang==='vi'?'Tháng ':'Month ')+month+' / 12';badge.setAttribute('aria-label',badge.textContent);const kicker=root.querySelector(':scope > .card-kicker');if(kicker)kicker.after(badge);else{const heading=root.querySelector(':scope > h2');if(heading)heading.before(badge);else root.prepend(badge);}}for(const el of root.querySelectorAll(':scope > .money-lesson,:scope > .monthly-portfolio')){if(el.tagName==='DETAILS')continue;const detail=document.createElement('details'),summary=document.createElement('summary');detail.className='decision-explanation';summary.textContent=lang==='vi'?'Bài học & chi tiết tháng':'Lesson & monthly details';el.before(detail);detail.append(summary,el);}}

// Call only after a user action has succeeded and its final render is complete.
// Re-query inside the frame because multiplayer polling can replace the panel.
export function revealDecision(selector='#decision, .play-columns > .decision, .match-results'){
 requestAnimationFrame(()=>{
  const root=document.querySelector('.handoff .decision')||document.querySelector(selector);if(!root)return;
  root.scrollTop=0;
  // A completed month can leave a long result above the next-roll control.
  // Target the control itself, including the scrollable desktop panel.
  const roll=root.querySelector('button:is([data-action="roll"],[data-action="game-roll"],[data-a="roll"],[data-a="act:roll"]):not(:disabled)');
  if(roll){roll.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});roll.focus({preventScroll:true});return;}
  root.scrollIntoView({block:'start',inline:'nearest',behavior:'instant'});
  const heading=root.querySelector(':scope > h2');
  if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
 });
}
