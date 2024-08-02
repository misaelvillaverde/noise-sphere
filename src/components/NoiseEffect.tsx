import { forwardRef, useMemo } from "react";
import { Uniform } from "three";
import { BlendFunction, Effect } from "postprocessing";

const fragmentShader = `
  uniform float amount;
  uniform sampler2D tDiffuse;
  float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }
  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec4 color = texture2D(tDiffuse, uv);
    vec3 noise = vec3(rand(uv), rand(uv + 0.1), rand(uv - 0.1)) * amount;
    outputColor = vec4(color.rgb + noise, color.a);
  }
`;

let _uAmount: number;

type NoiseEffectProps = {
  amount?: number;
  blendFunction?: BlendFunction;
};

class NoiseEffectImpl extends Effect {
  constructor({
    amount = 0.02,
    blendFunction = BlendFunction.OVERLAY,
  }: NoiseEffectProps = {}) {
    super("NoiseEffect", fragmentShader, {
      uniforms: new Map([["amount", new Uniform(amount)]]),
      blendFunction,
    });

    _uAmount = amount;
  }

  update() {
    if (!this.uniforms.get("amount")) return;
    this.uniforms.get("amount")!.value = _uAmount;
  }
}

export const NoiseEffect = forwardRef(
  ({ amount, blendFunction }: NoiseEffectProps, ref) => {
    const effect = useMemo(
      () => new NoiseEffectImpl({ amount, blendFunction }),
      [amount, blendFunction],
    );
    return <primitive ref={ref} object={effect} dispose={null} />;
  },
);
