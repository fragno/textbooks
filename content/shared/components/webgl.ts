// =============================================================================
// Fractal Component
// (c) Mathigon
// =============================================================================


import {Obj} from '@mathigon/core';
import {loadScript, $N, CanvasView, ElementView} from '@mathigon/boost';
import * as THREE from 'three';


const url = '/resources/shared/vendor/three-91.min.js';
const renderers: Obj<THREE.WebGLRenderer> = {};
let threePromise: Promise<{}>;

function loadTHREE() {
  if (!threePromise) threePromise = loadScript(url);
  return threePromise;
}

function getRenderer(width: number, height: number) {
  const id = [width, height].join(',');
  if (renderers[id]) return renderers[id];

  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.localClippingEnabled = true;
  renderer.setClearColor(0xffffff, 1);
  renderer.setSize(width, height);
  return renderers[id] = renderer;
}

export async function create3D($el: ElementView, fov: number, width: number,
                               height = width) {

  const $canvas = $N('canvas',
      {width, height, style: 'max-width: 100%'}, $el) as CanvasView;
  const context = $canvas.ctx;

  await loadTHREE();

  const scene = new THREE.Scene();
  const renderer = getRenderer(width, height);

  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
  scene.add(camera);

  const callbacks: (() => void)[] = [];

  const onDraw = (fn: () => void) => callbacks.push(fn);
  const add = (obj: THREE.Object3D) => scene.add(obj);

  const draw = () => {
    renderer.render(scene, camera);
    context.clearRect(0, 0, width, height);
    context.drawImage(renderer.domElement, 0, 0);
    for (let fn of callbacks) fn();
  };

  return {$canvas, camera, renderer, draw, onDraw, add};
}