const header=document.querySelector('header');
if(header&&!document.querySelector('.world-tabs')){
 const nav=document.createElement('nav');nav.className='world-tabs';nav.setAttribute('aria-label','Money Lab Worlds');header.after(nav);
 const render=()=>{const world=location.pathname.endsWith('/world.html')?Number(new URL(location.href).searchParams.get('world')||2):1,vi=localStorage.getItem('moneyLabLanguage')!=='en';nav.innerHTML=[[1,'./',vi?'Nền tảng tài chính':'Financial foundations'],[2,'./world.html?world=2',vi?'Nhà đầu tư khu du lịch':'Tourism investor'],[3,'./world.html?world=3',vi?'Kiến tạo điểm đến':'Destination builder']].map(([n,url,title])=>`<a href="${url}" ${world===n?'aria-current="page"':''}><b>WORLD ${n}</b><span>${title}</span></a>`).join('');};render();new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
