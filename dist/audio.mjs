export class Soundscape{
 constructor(){this.enabled=true;this.room='lounge';this.ctx=null;this.nodes=[];this.musicNodes=[];this.musicTimer=null;}
 start(){try{this.ctx??=new(window.AudioContext||window.webkitAudioContext)();this.ctx.resume().catch(()=>{});this.setRoom(this.room);this.startMusic();}catch{}}
 setEnabled(v){this.enabled=v;if(!v){this.stop();this.stopMusic();}else this.start();}
 stop(){for(const n of this.nodes){try{n.stop?.();n.disconnect();}catch{}}this.nodes=[];}
 setRoom(room){this.room=room;if(this.musicGain&&this.ctx)this.musicGain.gain.setTargetAtTime(room==='darkroom'?.008:.018,this.ctx.currentTime,1.5);if(!this.ctx)return;this.stop();if(!this.enabled)return;const c=this.ctx;const gain=c.createGain();gain.gain.value=room==='darkroom'?.009:.019;gain.connect(c.destination);this.nodes.push(gain);const o=c.createOscillator();o.frequency.value={lounge:62,server:48,archive:73,darkroom:42}[room];o.type='sine';o.connect(gain);o.start();this.nodes.push(o);const buffer=c.createBuffer(1,c.sampleRate*3,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()-.5)*.16;const noise=c.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=room==='lounge'?1500:room==='darkroom'?160:550;const ng=c.createGain();ng.gain.value=room==='lounge'?.18:.07;noise.connect(filter).connect(ng).connect(c.destination);noise.start();this.nodes.push(noise,filter,ng);}
 startMusic(){
  if(!this.ctx||!this.enabled||this.musicTimer)return;
  const c=this.ctx,g=c.createGain();g.gain.value=.018;g.connect(c.destination);this.musicGain=g;this.musicNodes.push(g);
  const chords=[[146.83,220,329.63,440],[130.81,196,293.66,392],[164.81,246.94,369.99,493.88],[130.81,220,329.63,440]];
  let bar=0;
  const note=(hz,at,length,level)=>{const o=c.createOscillator(),v=c.createGain();o.type='sine';o.frequency.value=hz;v.gain.setValueAtTime(0,at);v.gain.linearRampToValueAtTime(level,at+1.4);v.gain.exponentialRampToValueAtTime(.001,at+length);o.connect(v).connect(g);o.start(at);o.stop(at+length+.1);this.musicNodes.push(o,v);o.onended=()=>{o.disconnect();v.disconnect();this.musicNodes=this.musicNodes.filter(n=>n!==o&&n!==v);};};
  const schedule=()=>{if(c.state!=='running')return;const t=c.currentTime+.05,notes=chords[bar++%chords.length];notes.forEach((hz,i)=>note(hz,t,9,.16));note(notes[2]*2,t+2,4,.1);note(notes[1]*2,t+5,4,.07);};
  schedule();this.musicTimer=setInterval(schedule,8000);
 }
 stopMusic(){clearInterval(this.musicTimer);this.musicTimer=null;for(const n of this.musicNodes){try{n.stop?.();n.disconnect();}catch{}}this.musicNodes=[];}
 fx(type='click'){if(!this.enabled||!this.ctx)return;const c=this.ctx;const spec={click:[430,.04,.022],step:[100,.07,.017],door:[62,.45,.08],shutter:[135,.12,.09],success:[660,.22,.04],error:[140,.2,.035],paper:[850,.07,.02],glitch:[90,.32,.045]};const [hz,t,vol]=spec[type]||spec.click;const o=c.createOscillator(),g=c.createGain();o.type=['door','shutter','glitch'].includes(type)?'sawtooth':'sine';o.frequency.setValueAtTime(hz,c.currentTime);o.frequency.exponentialRampToValueAtTime(hz*.55,c.currentTime+t);g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+t);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+t);o.onended=()=>{o.disconnect();g.disconnect();};}
}
