export const Particles={
  spawn(x,y,count,color){
    for(let i=0;i<count;i++){
      const p=document.createElement('div');
      p.className='particle';
      p.style.background=color;
      p.style.left=x+'px';
      p.style.top=y+'px';
      document.body.appendChild(p);
      const dx=(Math.random()-0.5)*4;
      const dy=(Math.random()-0.5)*4;
      let life=30;
      const interval=setInterval(()=>{
        p.style.left=parseFloat(p.style.left)+dx+'px';
        p.style.top=parseFloat(p.style.top)+dy+'px';
        life--; if(life<=0){ clearInterval(interval); p.remove(); }
      },16);
    }
  }
};
