#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { rmSync, mkdirSync, writeFileSync } from 'node:fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9225;
const PROFILE_DIR = `/tmp/chrome-inspector-profile-${Date.now()}`;

// Parse args
const args = process.argv.slice(2);
let width = 1440;
let height = 900;
let url = 'http://127.0.0.1:3000/index.html#tucontu';
let screenshotPath = '/tmp/inspector-capture.jpg';

for (const arg of args) {
  if (arg.startsWith('--size=')) {
    const [w, h] = arg.replace('--size=', '').split('x').map(Number);
    if (w && h) { width = w; height = h; }
  } else if (arg.startsWith('--url=')) {
    url = arg.replace('--url=', '');
  } else if (arg.startsWith('--out=')) {
    screenshotPath = arg.replace('--out=', '');
  }
}

try {
  mkdirSync(PROFILE_DIR, { recursive: true });
} catch (e) {}

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE_DIR}`,
  `--window-size=${width},${height}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  '--hide-scrollbars',
  url
], { stdio: 'ignore' });

function cleanup() {
  try { chrome.kill('SIGTERM'); } catch (e) {}
  try { rmSync(PROFILE_DIR, { recursive: true, force: true }); } catch (e) {}
}

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForCdp() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const tabs = await res.json();
      const pageTab = tabs.find(t => t.type === 'page');
      if (pageTab && pageTab.webSocketDebuggerUrl) {
        return pageTab.webSocketDebuggerUrl;
      }
    } catch (e) {}
    await sleep(100);
  }
  throw new Error('CDP target did not become ready');
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    try { this.ws.close(); } catch (e) {}
  }
}

async function run() {
  try {
    const wsUrl = await waitForCdp();
    const cdp = new CdpClient(wsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');

    // Wait for fonts & rendering
    await sleep(1200);

    // Measure layout metrics across all 6 slides in DOM
    const evalResult = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const round = n => Math.round(n * 10) / 10;
        const rectOf = el => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { top: round(r.top), bottom: round(r.bottom), height: round(r.height), left: round(r.left), right: round(r.right), width: round(r.width) };
        };

        const view = document.querySelector('#tucontu.view');
        const header = document.querySelector('.site-header');
        const viewRect = rectOf(view);
        const headerRect = rectOf(header);

        const stepper = document.querySelector('.concept-stepper');
        const stepperTrack = document.querySelector('.concept-stepper-track');
        const stepperNodes = Array.from(document.querySelectorAll('.concept-stepper-node'));
        const lastNode = stepperNodes[stepperNodes.length - 1];

        const visual = document.querySelector('.tucontu-visual');
        const photo = document.querySelector('.tucontu-piece-photo.is-cover-photo');
        const videoBtn = document.querySelector('.tucontu-video-trigger');

        const vpHeight = window.innerHeight;
        const vpWidth = window.innerWidth;

        const nodeTops = stepperNodes.map(n => round(n.getBoundingClientRect().top));
        const nodeGaps = [];
        for (let i = 1; i < nodeTops.length; i++) {
          nodeGaps.push(round(nodeTops[i] - nodeTops[i-1]));
        }

        // Measure all 6 slides by clicking each node
        const slidesData = [];
        const slides = Array.from(document.querySelectorAll('.concept-slide'));

        for (let i = 0; i < stepperNodes.length; i++) {
          const node = stepperNodes[i];
          node.click();
          await new Promise(r => setTimeout(r, 120));
          const slide = slides[i];
          const slideRect = rectOf(slide);
          
          // Find the lowest rendered visible element inside the slide
          const allEls = Array.from(slide.querySelectorAll('*'));
          let maxBottom = slideRect ? slideRect.bottom : 0;
          for (const el of allEls) {
            const r = el.getBoundingClientRect();
            if (r.height > 0 && r.bottom > maxBottom) {
              maxBottom = r.bottom;
            }
          }
          maxBottom = round(maxBottom);
          
          slidesData.push({
            index: i + 1,
            id: slide?.id,
            title: slide?.querySelector('h3')?.textContent?.trim() || '',
            height: slideRect ? slideRect.height : 0,
            bottomEdge: maxBottom,
            clearanceToVpBottom: round(vpHeight - maxBottom),
            isClipped: maxBottom > vpHeight,
            overflowPixels: Math.max(0, round(maxBottom - vpHeight))
          });
        }

        // Return to slide 1
        stepperNodes[0].click();
        await new Promise(r => setTimeout(r, 120));

        return {
          viewport: { width: vpWidth, height: vpHeight },
          header: headerRect,
          view: viewRect,
          stepper: {
            containerHeight: rectOf(stepper)?.height,
            trackHeight: rectOf(stepperTrack)?.height,
            lastNodeBottom: rectOf(lastNode)?.bottom,
            nodeGaps,
            clearanceToVpBottom: round(vpHeight - lastNode.getBoundingClientRect().bottom)
          },
          slides: slidesData,
          visual: {
            photoRect: rectOf(photo),
            imgRect: rectOf(document.querySelector('#tucontu-home-photo')),
            imgNaturalWidth: document.querySelector('#tucontu-home-photo')?.naturalWidth,
            imgNaturalHeight: document.querySelector('#tucontu-home-photo')?.naturalHeight,
            imgSrc: document.querySelector('#tucontu-home-photo')?.currentSrc,
            imgFit: getComputedStyle(document.querySelector('#tucontu-home-photo') || document.body).objectFit,
            imgPos: getComputedStyle(document.querySelector('#tucontu-home-photo') || document.body).objectPosition,
            photoBottom: rectOf(photo)?.bottom,
            videoBtnBottom: rectOf(videoBtn)?.bottom,
            clearanceToVpBottom: round(vpHeight - (videoBtn ? videoBtn.getBoundingClientRect().bottom : photo.getBoundingClientRect().bottom))
          }
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    const metrics = evalResult.result.value;

    // Capture lightweight screenshot (JPEG 75% quality for small token size)
    const screenshot = await cdp.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 75
    });

    // Auto-generate markdown artifact in the brain conversation directory
    const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '/Users/psicoandino/.gemini/antigravity/brain/01911b68-bf43-46a9-b566-fa1d2bd23201';
    const reportArtifactPath = `${ARTIFACT_DIR}/reporte-telemetria-geometria.md`;
    const artifactImgPath = `${ARTIFACT_DIR}/layout-telemetry-auto.jpg`;

    try {
      writeFileSync(artifactImgPath, Buffer.from(screenshot.data, 'base64'));
      writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));

      let alertCount = 0;
      const rows = metrics.slides.map(s => {
        let statusIcon = '✅ OK';
        if (s.isClipped) {
          statusIcon = `🚨 CORTADO (${s.overflowPixels}px)`;
          alertCount++;
        } else if (s.clearanceToVpBottom < 45) {
          statusIcon = `⚠️ Ajustado (${s.clearanceToVpBottom}px)`;
          alertCount++;
        } else {
          statusIcon = `✅ Holgado (${s.clearanceToVpBottom}px)`;
        }
        return `| **Slide ${s.index} · ${s.title.slice(0, 26)}** | ${s.bottomEdge} px | ${s.clearanceToVpBottom} px | ${statusIcon} |`;
      }).join('\n');

      const alertBanner = alertCount > 0 
        ? `> [!WARNING]\n> Se detectaron **${alertCount} elementos que requieren atención** (riesgo de corte o desborde).`
        : `> [!NOTE]\n> **Composición equilibrada y validada**: Todas las 6 láminas se adaptan al viewport sin cortes ni desbordes.`;

      const mdReport = `# Reporte Automatizado de Telemetría y Geometría

${alertBanner}

### Datos del Viewport
- **Resolución evaluada**: ${metrics.viewport.width} × ${metrics.viewport.height} px
- **Altura de Cabecera**: ${metrics.header.height} px
- **Columna Derecha (Foto + Video)**: Termina en Y = ${metrics.visual.videoBtnBottom} px (Colchón de seguridad: ${metrics.visual.clearanceToVpBottom} px)
- **Stepper (Índice 01 a 06)**: Termina en Y = ${metrics.stepper.lastNodeBottom} px (Colchón de seguridad: ${metrics.stepper.clearanceToVpBottom} px, Intervalo: ${metrics.stepper.nodeGaps[0]} px)

---

### Diagnóstico Lámina por Lámina

| Lámina | Fin Inferior (Y) | Distancia al Suelo | Estado |
| :--- | :---: | :---: | :---: |
${rows}

---

### Captura Visual Automatizada
![Telemetría Visual](${artifactImgPath})
`;

      writeFileSync(reportArtifactPath, mdReport, 'utf8');
      console.log(`\n📄 Reporte Markdown autogenerado en: ${reportArtifactPath}`);
    } catch (err) {
      console.warn('Could not auto-write artifact:', err.message);
    }

    cdp.close();
    cleanup();

    // Print analysis report
    console.log('=== COMPOSITION & GEOMETRY REPORT ===');
    console.log(`Viewport: ${metrics.viewport.width} x ${metrics.viewport.height} px`);
    console.log(`Header Height: ${metrics.header.height} px`);
    console.log(`Photo Frame: ${metrics.visual.photoRect?.width} x ${metrics.visual.photoRect?.height} px`);
    console.log(`Image Element: ${metrics.visual.imgRect?.width} x ${metrics.visual.imgRect?.height} px (Natural: ${metrics.visual.imgNaturalWidth} x ${metrics.visual.imgNaturalHeight} px)`);
    console.log(`Image Fit: ${metrics.visual.imgFit} | Position: ${metrics.visual.imgPos}`);
    console.log(`Image Source: ${metrics.visual.imgSrc}`);
    console.log(`Video Button Bottom: Y = ${metrics.visual.videoBtnBottom} px`);
    console.log(`Right Column Clearance to Floor: ${metrics.visual.clearanceToVpBottom} px`);
    
    console.log(`\n--- Stepper (Left Column) ---`);
    console.log(`Stepper Track Height: ${metrics.stepper.trackHeight} px (in container of ${metrics.stepper.containerHeight} px)`);
    console.log(`Last Node (06 Camino) Bottom: Y = ${metrics.stepper.lastNodeBottom} px`);
    console.log(`Stepper Clearance to Floor: ${metrics.stepper.clearanceToVpBottom} px`);
    console.log(`Node Intervals: ${metrics.stepper.nodeGaps.join(', ')} px`);

    console.log(`\n--- Content Slides (Center Column) ---`);
    for (const s of metrics.slides) {
      const status = s.isClipped ? `🚨 CLIPPED by ${s.overflowPixels}px!` : `✅ OK (Clearance: ${s.clearanceToVpBottom}px)`;
      console.log(`Slide ${s.index} [${s.id}]: "${s.title.slice(0, 32)}..." -> Bottom: Y = ${s.bottomEdge} px | ${status}`);
    }
    console.log(`\nScreenshot saved: ${screenshotPath}`);
  } catch (err) {
    cleanup();
    console.error('Error during inspection:', err);
    process.exit(1);
  }
}

run();
