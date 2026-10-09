# ⚡ SparkFlow

> A modern, high-performance node flow canvas with physics-based electric arc snapping and laser border beam animations.
> 
> 🌐 **Live Demo (在线试玩)**: [https://life2you.github.io/spark-flow/](https://life2you.github.io/spark-flow/)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)
![NPM Version](https://img.shields.io/badge/npm-v0.1.0-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

---

## ✨ Features (核心亮点)

1. **⚡ 物理级电弧闪电磁吸 (Electric Spark Snapping)**
   - 纯正弦包络与法向量高频抖动电弧算法；
   - 支持高压击穿空气时的随机次级分叉（Forked Sub-arcs）；
   - 电弧击中端口产生带物理初速度衰减的微光火花粒子（Ember Particles）。

2. **🌈 动态平滑贝塞尔连线 (Smooth Bézier Splines)**
   - 随节点位移自适应调整张力与切线；
   - 拖拽与吸附时多层高斯模糊霓虹辉光；
   - 拖拽时线头严格跟随光标，末端带有白色发光活动手柄。

3. **✨ 激光边框跑道与侧边通电晕染 (Border Beam & Port Aura)**
   - 完美贴合卡片圆角矩形的激光流光（Border Beam）；
   - 端口接通时在卡片边缘呈现对应通道的垂直霓虹光柱；
   - 端口锁定触发同心圆冲击波（Shockwave Ripple）。

4. **🔊 原生 Web Audio 拟真音效**
   - 零外部音频文件依赖，纯浏览器底层振荡器与白噪波带通滤波实时合成；
   - 电火花抽搐噼啪声、磁吸闭合锁定声、消磁拔出声。

5. **🔌 双模生态：独立轻量画布 + React Flow 官方插件**
   - **独立轻量模式**：零重图库依赖，内置无限缩放平移画布；
   - **React Flow 插件**：无缝替换 `@xyflow/react` 的默认 Edge 和 Handle，3 行代码升级。

---

## 📦 Installation (安装)

```bash
npm install spark-flow
# or
pnpm add spark-flow
```

---

## 🛠️ Usage (使用方式)

### 选项 A：作为 React Flow (`@xyflow/react`) 插件使用 (推荐)

如果你已经在用 React Flow 开发 AI 工作流或编排画布，直接替换连线和手柄即可：

```tsx
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ElectricEdge, SparkFlowHandle, BorderBeamCard } from 'spark-flow/react-flow';

// 1. 注册电弧发光边缘类型
const edgeTypes = {
  electric: ElectricEdge,
};

// 2. 在自定义节点中使用发光卡片与增强 Handle
function PromptNode() {
  return (
    <BorderBeamCard title="Prompt" active={true} beamColor="#f59e0b">
      <div className="p-2 text-xs">A quiet world...</div>
      <SparkFlowHandle
        type="source"
        position="right"
        color="#f59e0b"
        glow="rgba(245, 158, 11, 0.65)"
      />
    </BorderBeamCard>
  );
}

// 3. 正常使用 ReactFlow
<ReactFlow
  edgeTypes={edgeTypes}
  nodes={nodes}
  edges={edges}
/>
```

---

### 选项 B：独立轻量组件使用 (零外部依赖)

适合构建产品官网展示、轻量微交互 Demo 或独立 AI 管道组件：

```tsx
import { BezierWire, BorderBeam, SparkNode, soundFX } from 'spark-flow';

function StandaloneFlow() {
  return (
    <div className="relative w-full h-screen bg-[#0c0d10]">
      <SparkNode id="prompt" title="Prompt" position={{ x: 100, y: 100 }}>
        <div>Node content...</div>
      </SparkNode>
    </div>
  );
}
```

---

## 🚀 本地开发与试玩

```bash
git clone https://github.com/life2you/spark-flow.git
cd spark-flow

npm install
npm run dev
```

在浏览器中打开 `http://localhost:5173`，可在顶部无缝切换体验 **“原生轻量引擎”** 与 **“React Flow 插件模式”**。

---

## 📄 License

[MIT License](LICENSE) © 2025 life2you
