export const Particles = {
  spawn(el, count, color){
    const rect = el.getBoundingClientRect();
    for(let i=0; i<count; i++){
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.background = color;
      p.style.left = rect.left + rect.width/2 + (Math.random()-0.5)*50 + 'px';
      p.style.top = rect.top + rect.height/2 + (Math.random()-0.5)*50 + 'px';
      document.body.appendChild(p);
      const dx = (Math.random()-0.5)*4;
      const dy = (Math.random()-0.5)*4;
      let life = 30;
      const interval = setInterval(()=>{
        p.style.left = parseFloat(p.style.left) + dx + 'px';
        p.style.top = parseFloat(p.style.top) + dy + 'px';
        life--;
        if(life<=0){ clearInterval(interval); p.remove(); }
      },16);
    }
  }
};
