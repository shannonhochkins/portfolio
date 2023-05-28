import React, { forwardRef, useMemo } from 'react';
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  UniformsUtils,
  Vector2,
  IUniform,
  Uniform
} from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { Effect } from 'postprocessing'

interface WaterShaderUniforms {
  byp: { value: number };
  tex: { type: string; value: Texture | null };
  time: { type: string; value: number };
  factor: { type: string; value: number };
  resolution: { type: string; value: Vector2 | null };
}

const WaterShader = {
  uniforms: {
    byp: { value: 0 },
    tex: { type: 't', value: null },
    time: { type: 'f', value: 0.0 },
    factor: { type: 'f', value: 0.0 },
    resolution: { type: 'v2', value: null },
  },

  vertexShader: `varying vec2 vUv;
    void main(){  
      vUv = uv; 
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition;
    }`,

  fragmentShader: `uniform int byp;
    uniform float time;
    uniform float factor;
    uniform vec2 resolution;
    uniform sampler2D tex;
    
    varying vec2 vUv;
    
    void main() {  
      if (byp<1) {
        vec2 uv1 = vUv;
        vec2 uv = gl_FragCoord.xy/resolution.xy;
        float frequency = 6.0;
        float amplitude = 0.015 * factor;
        float x = uv1.y * frequency + time * .7; 
        float y = uv1.x * frequency + time * .3;
        uv1.x += cos(x+y) * amplitude * cos(y);
        uv1.y += sin(x-y) * amplitude * cos(y);
        vec4 rgba = texture2D(tex, uv1);
        gl_FragColor = rgba;
      } else {
        gl_FragColor = texture2D(tex, vUv);
      }
    }`,
};

class WaterPass extends Pass {
  uniforms: {
    [uniform: string]: IUniform<any> | IUniform<any>
  };
  material: ShaderMaterial;
  camera: OrthographicCamera;
  scene: Scene;
  quad: Mesh;
  factor: number;
  time: number;

  constructor(dt_size: number) {
    super();
    
    if (WaterShader === undefined)
      console.error('WaterPass relies on WaterShader');

    const shader = WaterShader;
    this.uniforms = UniformsUtils.clone(shader.uniforms);

    if (dt_size === undefined) dt_size = 64;
    this.uniforms.resolution.value = new Vector2(dt_size, dt_size);
    console.log('this.uniforms', this.uniforms);
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });

    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new Scene();
    this.quad = new Mesh(new PlaneGeometry(2, 2), undefined);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    this.factor = 0;
    this.time = 0;
  }

  render(renderer: any, writeBuffer: any, readBuffer: any, deltaTime: any, maskActive: any) {
    const factor = Math.max(0, this.factor);
    this.uniforms.byp.value = factor ? 0 : 1;
    this.uniforms.tex.value = readBuffer.texture;
    this.uniforms.time.value = this.time;
    this.uniforms.factor.value = this.factor;
    this.time += 0.05;

    this.quad.material = this.material;
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.render(this.scene, this.camera);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      renderer.render(this.scene, this.camera);
    }
  }
}

export { WaterPass };

let _uParam

class WaterRippleImpl extends Effect {
  constructor({ param = 0.1 } = {}) {
    super('WaterRipple', WaterShader.fragmentShader, {
      uniforms: new Map([['param', new Uniform(param)]]),
    })

    _uParam = param
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('param').value = _uParam
  }
}

// Effect component
export const WaterRipple = forwardRef(({ param }, ref) => {
  const effect = useMemo(() => new WaterRippleImpl(param), [param])
  return <primitive ref={ref} object={effect} dispose={null} />
})