// Keep economic outcomes while removing a former member's personal journal/label.
export async function estatePrivacyStatements(db,id,remove,guard,args){
 const exists=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='moneylab_estate_rooms'").first();if(!exists)return [];
 const rows=await db.prepare('SELECT code,state FROM moneylab_estate_rooms WHERE instr(state,?)>0').bind(id).all(),statements=[];
 for(const row of rows.results){const r=JSON.parse(row.state),seats=[];for(let i=0;i<(r.game?.players.length||0);i++){const p=r.game.players[i];if(p.id!==id)continue;seats.push(i);p.last=null;if(remove){p.name='Deleted investor';p.id=null;}}
 if(remove){for(const m of r.members)if(m.id===id){m.name='Deleted investor';m.id=null;}r.seen=r.seen.filter(s=>s.id!==id);}
 if(r.game)r.game.log=r.game.log.filter(x=>!seats.includes(x.seat));
 statements.push(db.prepare(`UPDATE moneylab_estate_rooms SET state=?,revision=revision+1 WHERE code=? AND state=? AND ${guard}`).bind(JSON.stringify(r),row.code,row.state,...args));
 }return statements;
}
