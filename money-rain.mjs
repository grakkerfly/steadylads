import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
export async function createMoneyRain(layer) {
  const model = (await new GLTFLoader().loadAsync(new URL('./assets/money.glb', import.meta.url).href)).scene;
  const box = new THREE.Box3().setFromObject(model), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
  model.position.sub(center);
  const template = new THREE.Group(); template.add(model); template.scale.setScalar(1 / Math.max(size.x,size.y,size.z));
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setClearColor(0,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  layer.append(renderer.domElement);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff,0x8c9a80,2.7));
  const light = new THREE.DirectionalLight(0xffffff,3); light.position.set(-2,4,6); scene.add(light);
  const camera = new THREE.OrthographicCamera(); camera.position.z=1000;
  let width=innerWidth,height=innerHeight,frame=0,previous=0;
  const particles=[];
  function resize(){width=innerWidth;height=innerHeight;renderer.setSize(width,height);camera.left=-width/2;camera.right=width/2;camera.top=height/2;camera.bottom=-height/2;camera.near=.1;camera.far=2000;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  function tick(now){
    const dt=Math.min((now-previous)/1000,.04);previous=now;
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];if(now<p.start)continue;p.object.visible=true;p.velocity+=height*.16*dt;p.object.position.y-=p.velocity*dt;p.object.position.x+=Math.sin(now*.0018+p.seed)*28*dt;p.object.rotation.x+=p.spinX*dt;p.object.rotation.y+=p.spinY*dt;p.object.rotation.z+=p.spinZ*dt;if(p.object.position.y < -height/2-160){scene.remove(p.object);particles.splice(i,1);}}
    renderer.render(scene,camera);
    if(particles.length)frame=requestAnimationFrame(tick);else{frame=0;renderer.clear();}
  }
  function clear(){cancelAnimationFrame(frame);frame=0;for(const p of particles)scene.remove(p.object);particles.length=0;renderer.clear();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches)clear();});
  return {burst(){
    if(document.hidden)return;
    const now=performance.now(),count=Math.min(width<600?8:12, Math.max(0, 180-particles.length));
    for(let i=0;i<count;i++){
      const object=template.clone(true);object.scale.multiplyScalar((width<600?64:85)+Math.random()*40);object.position.set((Math.random()-.5)*width,height/2+100+Math.random()*60,Math.random()*80);object.rotation.set((Math.random()-.5)*.5,(Math.random()-.5)*1.3,(Math.random()-.5)*.7);object.visible=false;scene.add(object);
      particles.push({object,start:now+i*45,velocity:height*(.35+Math.random()*.18),seed:Math.random()*10,spinX:(Math.random()-.5)*1.2,spinY:(Math.random()-.5)*2.5,spinZ:(Math.random()-.5)*1.2});
    }
    if(!frame){previous=performance.now();frame=requestAnimationFrame(tick);}
  }};
}
