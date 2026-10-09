# ⚡ SparkFlow

> A modern, high-performance node flow canvas with physics-based electric arc snapping and laser border beam animations.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)

---

## ✨ Features (核心亮点)

1. **⚡ 物理级电弧闪电磁吸 (Electric Spark Snapping)**
   - 基于法向量扰动与正弦包络的高频抖动电弧算法；
   - 支持高压击穿空气时的随机次级分叉（Forked Sub-arcs）；
   - 电弧击中端口产生飞溅火花粒子（Ember Particulates）。

2. **🌈 动态平滑贝塞尔连线 (Smooth Bézier Splines)**
   - 随节点位移自适应调整张力与切线；
   - 拖拽与吸附时双层高斯模糊霓虹辉光；
   - 悬停支持一键剪断/断开。

3. **✨ 激光边框跑道与侧边通电晕染 (Border Beam & Port Aura)**
   - 贴合卡片圆角矩形的激光流光（Border Beam）；
   - 端口接通时在卡片边缘呈现对应通道的垂直霓虹光柱；
   - 端口锁定触发多重同心圆冲击波（Shockwave Ripple）。

4. **🔊 原生 Web Audio 拟真音效**
   - 零外部音频文件依赖，纯浏览器底层振荡器与白噪波带通滤波实时合成；
   - 电火花抽搐噼啪声、磁吸闭合锁定声、消磁拔出声；
   - 支持一键静音。

5. **🎛️ 实时参数微调工坊 (Playground Controls)**
   - 实时调节色彩通道、电弧抖动振幅、磁吸感应距离；
   - 支持一键通电、断开重置与原片自动演播。

---

## 🚀 Quick Start (快速开始)

```bash
# 1. 克隆仓库
git clone https://github.com/life2you/spark-flow.git
cd spark-flow

# 2. 安装依赖
npm install

# 3. 启动本地开发服务
npm run dev
```

在浏览器中打开 `http://localhost:5173` 即可体验。

---

## 🛠️ Tech Stack

- **Framework**: React 19 / TypeScript / Vite
- **Styling**: Tailwind CSS v4
- **Graphics**: HTML5 Canvas (Retina 缩放) + SVG Splines
- **Audio**: Web Audio API Synthesizer
- **Icons**: Lucide Icons

---

## 📄 License

[MIT License](LICENSE) © 2025 life2you
