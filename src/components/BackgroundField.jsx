import { useEffect, useRef } from "react";

const vertexSource = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_scroll;
uniform float u_hover;
uniform vec3 u_base;
uniform vec3 u_deep;
uniform vec3 u_light;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 gradientVector(vec2 cell) {
  float angle = hash12(cell) * 6.28318530718;
  return vec2(cos(angle), sin(angle));
}

float gradientNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 blend = local * local * local * (local * (local * 6.0 - 15.0) + 10.0);

  float topLeft = dot(gradientVector(cell), local);
  float topRight = dot(gradientVector(cell + vec2(1.0, 0.0)), local - vec2(1.0, 0.0));
  float bottomLeft = dot(gradientVector(cell + vec2(0.0, 1.0)), local - vec2(0.0, 1.0));
  float bottomRight = dot(gradientVector(cell + vec2(1.0, 1.0)), local - vec2(1.0, 1.0));

  return mix(mix(topLeft, topRight, blend.x), mix(bottomLeft, bottomRight, blend.x), blend.y) * 1.35 + 0.5;
}

float fieldNoise(vec2 p) {
  float value = 0.0;
  float amplitude = 0.58;
  mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);

  for (int i = 0; i < 3; i++) {
    value += gradientNoise(p) * amplitude;
    p = turn * p * 1.85 + vec2(7.3, 4.1);
    amplitude *= 0.48;
  }

  return value;
}

void main() {
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 point = v_uv * 2.0 - 1.0;
  point.x *= aspect;

  float time = u_time * 0.065;
  vec2 flow = vec2(time * 0.5, -time * 0.32);
  vec2 pointer = vec2(u_pointer.x, 1.0 - u_pointer.y);
  vec2 pointerDelta = (pointer - v_uv) * vec2(aspect, 1.0);
  float pointerDistance = length(pointerDelta);
  float pointerInfluence =
    (1.0 - smoothstep(0.0, 0.62, pointerDistance)) * u_hover;

  vec2 warp = vec2(
    gradientNoise(point * 0.58 + flow * 0.6 + vec2(2.4, 6.1)),
    gradientNoise(point * 0.58 - flow * 0.5 + vec2(-5.3, 1.7))
  ) - 0.5;
  vec2 shaped = point + warp * 0.42;
  shaped += pointerDelta / max(pointerDistance, 0.001) * pointerInfluence * 0.07;

  float field = fieldNoise(shaped * 0.88 - flow * 0.35);
  float phase = field * 8.4 + time * 0.7 + pointerInfluence * 1.6 - u_scroll * 2.0;
  float wave = sin(phase);
  float lineWidth = max(fwidth(wave) * 2.6, 0.032);
  float line = 1.0 - smoothstep(0.0, lineWidth, abs(wave));
  float lineHalo = 1.0 - smoothstep(lineWidth, lineWidth * 5.0, abs(wave));
  float shade = smoothstep(0.38, 0.7, field);
  float highlight = smoothstep(0.45, 0.92, wave);
  float vignette = 1.0 - smoothstep(0.15, 1.25, length(point * vec2(0.55, 0.75)));

  vec3 color = mix(u_base, u_deep, shade * 0.36);
  color = mix(color, u_deep * 0.82, line * 0.5);
  color = mix(color, u_deep, lineHalo * 0.1);
  color = mix(color, u_light, highlight * 0.045 + pointerInfluence * 0.08);
  color *= 0.88 + vignette * 0.07;

  fragColor = vec4(color, 1.0);
}`;

const fallbackBase = [105 / 255, 111 / 255, 199 / 255];
const fallbackAccent = [255 / 255, 221 / 255, 230 / 255];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseColor(value, fallback) {
  const trimmed = value.trim();
  const hex = trimmed.match(/^#([\da-f]{3}|[\da-f]{6})$/i);

  if (hex) {
    const raw =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((character) => character + character)
            .join("")
        : hex[1];

    return [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16) / 255);
  }

  const rgb = trimmed.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i
  );

  if (rgb) {
    return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255];
  }

  return fallback;
}

function readColors() {
  if (typeof window === "undefined") {
    return {
      base: fallbackBase,
      deep: fallbackBase.map((channel) => channel * 0.6),
      light: fallbackAccent.map((channel) => channel * 0.88),
    };
  }

  const styles = window.getComputedStyle(document.documentElement);
  const base = parseColor(styles.getPropertyValue("--bg"), fallbackBase);
  const accent = parseColor(styles.getPropertyValue("--accent"), fallbackAccent);
  const deep = base.map((channel) => channel * 0.6);
  const light = base.map((channel, index) => channel * 0.78 + accent[index] * 0.12);

  return { base, deep, light };
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Unable to create shader");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createRenderer(canvas) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });

  if (!gl) return null;

  let vertexShader;
  let fragmentShader;
  let program;
  let buffer;

  try {
    vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    program = gl.createProgram();

    if (!program) {
      throw new Error("Unable to create WebGL program");
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program linking failed");
    }

    buffer = gl.createBuffer();

    if (!buffer) {
      throw new Error("Unable to create WebGL buffer");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]),
      gl.STATIC_DRAW
    );
  } catch (error) {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    console.error(error);
    return null;
  }

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const uniforms = {
    resolution: gl.getUniformLocation(program, "u_resolution"),
    pointer: gl.getUniformLocation(program, "u_pointer"),
    time: gl.getUniformLocation(program, "u_time"),
    scroll: gl.getUniformLocation(program, "u_scroll"),
    hover: gl.getUniformLocation(program, "u_hover"),
    base: gl.getUniformLocation(program, "u_base"),
    deep: gl.getUniformLocation(program, "u_deep"),
    light: gl.getUniformLocation(program, "u_light"),
  };
  const colors = readColors();
  const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const state = {
    animationFrame: 0,
    disposed: false,
    contextLost: false,
    hidden: document.hidden,
    time: 0,
    previousTime: performance.now(),
    scroll: 0,
    targetScroll: 0,
    pointer: {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      hover: 0,
      targetHover: 0,
    },
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round((canvas.clientWidth || window.innerWidth) * ratio));
    const height = Math.max(
      1,
      Math.round((canvas.clientHeight || window.innerHeight) * ratio)
    );

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    state.targetScroll = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
  };

  const onPointerMove = (event) => {
    if (!hoverCapable || event.pointerType === "touch") return;

    state.pointer.targetX = clamp(event.clientX / Math.max(window.innerWidth, 1), 0, 1);
    state.pointer.targetY = clamp(event.clientY / Math.max(window.innerHeight, 1), 0, 1);
    state.pointer.targetHover = 1;
  };

  const releasePointer = () => {
    state.pointer.targetHover = 0;
  };

  const onPointerOut = (event) => {
    if (!event.relatedTarget) releasePointer();
  };

  const onVisibilityChange = () => {
    state.hidden = document.hidden;

    if (state.hidden) {
      window.cancelAnimationFrame(state.animationFrame);
      state.animationFrame = 0;
      return;
    }

    state.previousTime = performance.now();
    schedule();
  };

  const onContextLost = (event) => {
    event.preventDefault();
    state.contextLost = true;
    window.cancelAnimationFrame(state.animationFrame);
    state.animationFrame = 0;
  };

  const render = (now) => {
    state.animationFrame = 0;

    if (state.disposed || state.contextLost || state.hidden) return;

    const delta = clamp((now - state.previousTime) / 1000, 0, 0.05);
    state.previousTime = now;
    state.time += delta;

    const pointerFollow = 1 - Math.exp(-delta * 7);
    const scrollFollow = 1 - Math.exp(-delta * 5);
    state.pointer.x += (state.pointer.targetX - state.pointer.x) * pointerFollow;
    state.pointer.y += (state.pointer.targetY - state.pointer.y) * pointerFollow;
    state.pointer.hover +=
      (state.pointer.targetHover - state.pointer.hover) * pointerFollow;
    state.scroll += (state.targetScroll - state.scroll) * scrollFollow;

    gl.useProgram(program);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(uniforms.pointer, state.pointer.x, state.pointer.y);
    gl.uniform1f(uniforms.time, state.time);
    gl.uniform1f(uniforms.scroll, state.scroll);
    gl.uniform1f(uniforms.hover, state.pointer.hover);
    gl.uniform3fv(uniforms.base, colors.base);
    gl.uniform3fv(uniforms.deep, colors.deep);
    gl.uniform3fv(uniforms.light, colors.light);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    schedule();
  };

  function schedule() {
    if (
      state.animationFrame ||
      state.disposed ||
      state.contextLost ||
      state.hidden
    ) {
      return;
    }

    state.animationFrame = window.requestAnimationFrame(render);
  }

  const start = () => {
    resize();
    updateScroll();
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("blur", releasePointer);
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    schedule();
  };

  const destroy = () => {
    if (state.disposed) return;

    state.disposed = true;
    window.cancelAnimationFrame(state.animationFrame);
    state.animationFrame = 0;
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", updateScroll);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerout", onPointerOut);
    window.removeEventListener("blur", releasePointer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    gl.deleteBuffer(buffer);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteProgram(program);
    canvas.width = 0;
    canvas.height = 0;
  };

  return { start, destroy };
}

export default function BackgroundField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer = null;

    const stop = () => {
      renderer?.destroy();
      renderer = null;
    };

    const start = () => {
      if (renderer || motionQuery.matches) return;
      renderer = createRenderer(canvas);
      renderer?.start();
    };

    const onMotionChange = () => {
      if (motionQuery.matches) {
        stop();
      } else {
        start();
      }
    };

    if (!motionQuery.matches) start();

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", onMotionChange);
    } else {
      motionQuery.addListener(onMotionChange);
    }

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener("change", onMotionChange);
      } else {
        motionQuery.removeListener(onMotionChange);
      }
      stop();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="background-field__canvas"
      aria-hidden="true"
      data-background-field="true"
    />
  );
}
