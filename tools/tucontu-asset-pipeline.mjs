#!/usr/bin/env node
/**
 * tools/tucontu-asset-pipeline.mjs
 *
 * Automated Token-Efficient Asset Ingestion & Telemetry Pipeline for TuconTu
 * - Ingests raw uploaded images without burning LLM vision tokens on high-res duplicates
 * - Generates low-cost composite inspection contact sheets
 * - Crops and exports production-ready WebP & responsive display variants
 * - Calculates bandwidth, token economy, and visual telemetry
 * - Automatically produces the Markdown analysis report artifact
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BRAIN_DIR = '/Users/psicoandino/.gemini/antigravity/brain/01911b68-bf43-46a9-b566-fa1d2bd23201';
const UPLOAD_DIR = join(BRAIN_DIR, '.user_uploaded');
const ASSETS_PRODUCT_DIR = 'assets/tucontu/product';
const ASSETS_THUMBS_DIR = join(ASSETS_PRODUCT_DIR, 'thumbs');
const REPORT_PATH = join(BRAIN_DIR, 'reporte-analisis-activos-tucontu.md');

// Ensure output directories exist
mkdirSync(ASSETS_PRODUCT_DIR, { recursive: true });
mkdirSync(ASSETS_THUMBS_DIR, { recursive: true });

console.log('✨ [TuconTu Asset Pipeline] Iniciando procesamiento inteligente...');

// 1. Identify raw uploaded images
const RAW_FILES = {
  tag: join(UPLOAD_DIR, 'media_1792129547349_11f85523.jpg'),
  dossier: join(UPLOAD_DIR, 'media_1792129526319_9f814602.jpg'),
  rack: join(UPLOAD_DIR, 'media_1792129506239_9f98531a.jpg'),
  hanging: join(UPLOAD_DIR, 'media_1792129510856_a231c7a3.jpg')
};

// Verify presence
for (const [key, path] of Object.entries(RAW_FILES)) {
  if (!existsSync(path)) {
    console.error(`❌ Archivo faltante: ${key} -> ${path}`);
    process.exit(1);
  }
}

function getDimensions(filePath) {
  try {
    const out = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`, { encoding: 'utf-8' });
    const wMatch = out.match(/pixelWidth:\s*(\d+)/);
    const hMatch = out.match(/pixelHeight:\s*(\d+)/);
    return {
      width: wMatch ? parseInt(wMatch[1], 10) : 0,
      height: hMatch ? parseInt(hMatch[1], 10) : 0
    };
  } catch (e) {
    return { width: 0, height: 0 };
  }
}

function getFileSizeKb(filePath) {
  try {
    const stats = statSync(filePath);
    return (stats.size / 1024).toFixed(1);
  } catch (e) {
    return '0.0';
  }
}

// 2. Measure raw images telemetry
const telemetry = {};
let totalRawBytes = 0;

for (const [key, path] of Object.entries(RAW_FILES)) {
  const { width, height } = getDimensions(path);
  const size = statSync(path).size;
  totalRawBytes += size;
  telemetry[key] = {
    path,
    width,
    height,
    aspect: (width / height).toFixed(2),
    sizeKb: (size / 1024).toFixed(1)
  };
}

console.log('📊 Telemetría de archivos brutos recolectada.');
console.log(`   Peso total original: ${(totalRawBytes / 1024).toFixed(1)} KB (~${(totalRawBytes / (1024 * 1024)).toFixed(2)} MB)`);

// 3. Generate Token-Efficient Composite Contact Sheet
const contactSheetJpg = join(BRAIN_DIR, 'contact-sheet-tucontu.jpg');
const contactSheetWebp = join(BRAIN_DIR, 'contact-sheet-tucontu.webp');

console.log('🖼️ Generando mosaico de contacto 2x2 optimizado...');
const ffmpegContactCmd = `
/opt/homebrew/bin/ffmpeg -y \
  -i "${RAW_FILES.tag}" -i "${RAW_FILES.dossier}" -i "${RAW_FILES.rack}" -i "${RAW_FILES.hanging}" \
  -filter_complex "\
    [0:v]scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#202020[v0]; \
    [1:v]scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#202020[v1]; \
    [2:v]scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#202020[v2]; \
    [3:v]scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#202020[v3]; \
    [v0][v1]hstack=inputs=2[top]; \
    [v2][v3]hstack=inputs=2[bottom]; \
    [top][bottom]vstack=inputs=2[out]" \
  -map "[out]" -q:v 5 "${contactSheetJpg}" 2>/dev/null
`;
execSync(ffmpegContactCmd);

// Convert to WebP for maximum compression
execSync(`/opt/homebrew/bin/cwebp -q 75 "${contactSheetJpg}" -o "${contactSheetWebp}" 2>/dev/null`);
const contactSheetSizeKb = getFileSizeKb(contactSheetWebp);
console.log(`✅ Mosaico de contacto creado: ${contactSheetWebp} (${contactSheetSizeKb} KB)`);

// 4. Extract Precision Production Crops
console.log('✂️ Extrayendo cortes de alta fidelidad para producción...');

const crops = [
  {
    id: 'tucontu-tag-cover',
    desc: 'Etiqueta frontal marcapáginas con perfil de mujer, trenza artesanal y logotipo',
    src: RAW_FILES.tag,
    filter: 'crop=380:880:110:20',
    outWebp: join(ASSETS_PRODUCT_DIR, 'tucontu-tag-cover.webp'),
    responsive: true
  },
  {
    id: 'tucontu-tag-care',
    desc: 'Reverso de la etiqueta con consejos de cuidado artesanal y cariño',
    src: RAW_FILES.tag,
    filter: 'crop=460:880:540:20',
    outWebp: join(ASSETS_PRODUCT_DIR, 'tucontu-tag-care.webp'),
    responsive: false
  },
  {
    id: 'tucontu-rack-collection',
    desc: 'Expositor de madera con las 8 piezas artesanales mostrando diversidad cromática',
    src: RAW_FILES.rack,
    filter: 'crop=1024:935:0:0',
    outWebp: join(ASSETS_PRODUCT_DIR, 'tucontu-rack-collection.webp'),
    responsive: true
  },
  {
    id: 'tucontu-hanging-pieces',
    desc: 'Detalle vertical de 5 piezas colgadas revelando colet, espirales y embarrilados',
    src: RAW_FILES.hanging,
    filter: 'crop=683:1024:0:0',
    outWebp: join(ASSETS_PRODUCT_DIR, 'tucontu-hanging-pieces.webp'),
    responsive: true
  },
  {
    id: 'dossier-wearing-tucontu',
    desc: 'Fotografía de mujer de espaldas luciendo TuconTu real sobre coleta baja',
    src: RAW_FILES.dossier,
    filter: 'crop=350:500:0:0',
    outWebp: join(ASSETS_PRODUCT_DIR, 'dossier-wearing.webp'),
    responsive: false
  },
  {
    id: 'dossier-anatomy-schema',
    desc: 'Esquema anatómico técnico: colet, estructura de algodón, trenza, embarrilado, espiral',
    src: RAW_FILES.dossier,
    filter: 'crop=350:500:350:0',
    outWebp: join(ASSETS_PRODUCT_DIR, 'dossier-anatomy.webp'),
    responsive: false
  },
  {
    id: 'dossier-archetypes-lines',
    desc: 'Líneas y Arquetipos: Perséfone (30cm), Afrodita (60cm), Héstia (90cm)',
    src: RAW_FILES.dossier,
    filter: 'crop=702:524:0:500',
    outWebp: join(ASSETS_PRODUCT_DIR, 'dossier-archetypes.webp'),
    responsive: false
  }
];

const cropResults = [];
let totalProductionBytes = 0;

for (const c of crops) {
  const tmpJpg = `/tmp/${c.id}.jpg`;
  execSync(`/opt/homebrew/bin/ffmpeg -y -i "${c.src}" -filter:v "${c.filter}" "${tmpJpg}" 2>/dev/null`);
  execSync(`/opt/homebrew/bin/cwebp -q 85 "${tmpJpg}" -o "${c.outWebp}" 2>/dev/null`);

  const thumbWebp = join(ASSETS_THUMBS_DIR, `${c.id}-thumb.webp`);
  execSync(`/opt/homebrew/bin/cwebp -q 80 -resize 140 140 "${c.outWebp}" -o "${thumbWebp}" 2>/dev/null`);

  if (c.responsive) {
    const disp260 = join(ASSETS_PRODUCT_DIR, `${c.id}-display-260.jpg`);
    const disp940 = join(ASSETS_PRODUCT_DIR, `${c.id}-display-940.jpg`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${tmpJpg}" -vf "scale=260:-1" "${disp260}" 2>/dev/null`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${tmpJpg}" -vf "scale=940:-1" "${disp940}" 2>/dev/null`);
  }

  const pSize = statSync(c.outWebp).size;
  totalProductionBytes += pSize;
  const dims = getDimensions(c.outWebp);

  cropResults.push({
    id: c.id,
    desc: c.desc,
    file: c.outWebp,
    width: dims.width,
    height: dims.height,
    sizeKb: (pSize / 1024).toFixed(1)
  });
  console.log(`   ✓ ${c.id}: ${dims.width}x${dims.height} (${(pSize / 1024).toFixed(1)} KB)`);
}

// 5. Calculate Token Economy
const estimatedRawTokens = 4 * 1050; // ~1050 tokens per high-res 1024px image
const estimatedContactTokens = 350; // single low-res 2x2 grid
const tokenReductionPct = (((estimatedRawTokens - estimatedContactTokens) / estimatedRawTokens) * 100).toFixed(1);
const sizeReductionPct = (((totalRawBytes - statSync(contactSheetWebp).size) / totalRawBytes) * 100).toFixed(1);

// 6. Generate the Markdown Artifact Report
console.log('📝 Escribiendo reporte de análisis y telemetría de activos...');

const markdownContent = `# Reporte de Análisis y Telemetría de Activos TuconTu

**Fecha de ejecución:** ${new Date().toISOString()}  
**Sistema:** Antigravity Token-Efficient Asset Telemetry Pipeline  
**Objetivo:** Ingestión de alta fidelidad, compresión sin pérdida de detalle y arquitectura de activos reales para TuconTu.

---

## 1. Auditoría de Economía de Tokens y Ancho de Banda

| Métrica | Enfoque Bruto (4 imágenes crudas) | Enfoque Mosaico Telemetría (1 hoja de contacto) | Ahorro Logrado |
| :--- | :--- | :--- | :--- |
| **Peso Total** | ${(totalRawBytes / 1024).toFixed(1)} KB (~${(totalRawBytes / (1024 * 1024)).toFixed(2)} MB) | ${contactSheetSizeKb} KB | **${sizeReductionPct}% de reducción** |
| **Consumo Estimado de Tokens LLM** | ~${estimatedRawTokens} tokens | ~${estimatedContactTokens} tokens | **${tokenReductionPct}% de economía** |
| **Peticiones de Red** | 4 lecturas individuales pesadas | 1 lectura compacta unificada | **75% menos peticiones** |

> [!TIP]
> Al procesar las imágenes mediante el pipeline local de macOS (\`ffmpeg\` + \`cwebp\`), podemos inspeccionar y verificar la totalidad de los detalles físicos del producto consumiendo una fracción mínima de cuota de tokens.

---

## 2. Hoja de Contacto 2x2 Unificada

Archivo generado: [\`contact-sheet-tucontu.webp\`](file://${contactSheetWebp}) (1024×1024 px, ${contactSheetSizeKb} KB)

\`\`\`
+------------------------------------+------------------------------------+
| [01] ETIQUETA ARTESANAL KRAFT      | [02] DOSIER TÉCNICO OFICIAL        |
| - Marca: "TU, CON TU"              | - Foto real sobre coleta baja      |
| - Slogan: "la belleza de ser Tú"   | - Esquema anatómico de 7 partes    |
| - Ilustración mujer con trenza 3D  | - Líneas: Perséfone/Afrodita/Héstia|
+------------------------------------+------------------------------------+
| [03] EXPOSITOR DE TALLER (8 PIEZAS)| [04] PRIMER PLANO PIEZAS COLGADAS  |
| - Gama cromática completa          | - Colet de sujeción (blanco/negro) |
| - Paleta tierra, verdes y añil     | - Las 9 trenzas y embarrilados     |
+------------------------------------+------------------------------------+
\`\`\`

---

## 3. Catálogo de Cortes de Producción Extraídos

Los siguientes activos ya están exportados en formato WebP optimizado dentro de \`${ASSETS_PRODUCT_DIR}\`:

| Activo | Resolución | Peso | Destino en la Web |
| :--- | :--- | :--- | :--- |
| **\`tucontu-tag-cover.webp\`** | ${cropResults[0].width}×${cropResults[0].height} | ${cropResults[0].sizeKb} KB | **Portada / Arco Arquitectónico** (Reemplaza a Marcela recortada) |
| **\`tucontu-tag-care.webp\`** | ${cropResults[1].width}×${cropResults[1].height} | ${cropResults[1].sizeKb} KB | **Pestaña Historia / Modal Cuidado** |
| **\`tucontu-rack-collection.webp\`** | ${cropResults[2].width}×${cropResults[2].height} | ${cropResults[2].sizeKb} KB | **Galería de Autor / Muestra de Color** |
| **\`tucontu-hanging-pieces.webp\`** | ${cropResults[3].width}×${cropResults[3].height} | ${cropResults[3].sizeKb} KB | **Galería de Texturas y Caída** |
| **\`dossier-wearing.webp\`** | ${cropResults[4].width}×${cropResults[4].height} | ${cropResults[4].sizeKb} KB | **Galería / Cómo se usa en el pelo** |
| **\`dossier-anatomy.webp\`** | ${cropResults[5].width}×${cropResults[5].height} | ${cropResults[5].sizeKb} KB | **Pestaña Concepto / Ficha Técnica (Slide 01)** |
| **\`dossier-archetypes.webp\`** | ${cropResults[6].width}×${cropResults[6].height} | ${cropResults[6].sizeKb} KB | **Pestaña Concepto / Arquetipos (Slide 02)** |

---

## 4. Hallazgos Esenciales de la Verdad Física del Producto

A partir de la documentación oficial de Marcela, el producto **NO es un macramé genérico**, sino una creación con especificaciones exactas:

1. **El Sistema de Sujeción (Colet):**
   - Colet elástico suave disponible en **blanco** o **negro**.
   - Diseñado para engancharse limpiamente en una coleta o recogido natural.

2. **La Estructura de las 9 Trenzas:**
   - 9 cordones colgantes que simbolizan el recorrido de la vida y el movimiento.
   - Cada cordón tiene:
     - *Estructura base de algodón*: Suave y firme.
     - *Trenza*: Cuerpo, emoción y pensamiento.
     - *Cuerpo central*: Eje que sostiene.
     - *Embarrilado*: El hilo que envuelve la estructura.
     - *Espiral*: Movimiento de evolución.
     - *Borde final*: Terminación artesanal con flecos sutiles.

3. **Las Tres Líneas / Arquetipos de Longitud:**
   - **Perséfone (30 cm):** Infantil / Doncella / Juego y descubrimiento.
   - **Afrodita (60 cm):** Adulta estándar / Creadora / Presencia y creatividad.
   - **Héstia (90 cm):** Artesanal extra largo / Sacerdotisa / Centro y sabiduría interior.

4. **Identidad de Marca:**
   - **Nombre:** \`TU, CON TU\`
   - **Slogan:** *"la belleza de ser Tú"*
   - **Valores:** *"Hilos que cuentan historias, colores que acompañan caminos."*

---

## 5. Próximos Pasos Recomendados

1. **Actualizar la Portada (\`#tucontu\`):**
   - Configurar \`tucontu-tag-cover.webp\` como la imagen de portada por defecto en el marco en arco.
   - Esto confiere identidad de marca inmediata, calidez kraft y elimina el corte incómodo de la fotografía de Marcela.
2. **Reubicar las Fotografías en la Galería:**
   - Ubicar la fotografía de Marcela (\`img-3332.webp\`) en la galería interactiva donde se aprecia en su encuadre natural completo.
   - Integrar los 4 nuevos activos del producto real (\`tucontu-rack-collection.webp\`, \`tucontu-hanging-pieces.webp\`, \`dossier-wearing.webp\`, \`tucontu-tag-care.webp\`).
3. **Consolidar el Viaje de 3 Actos:**
   - *Acto 1: La Esencia (Portada + Arco de Marca)*
   - *Acto 2: El Concepto y Anatomía (Ficha técnica + 3 Arquetipos sin cajas)*
   - *Acto 3: El Taller y la Galería (Fotos reales y video de Marcela)*
`;

writeFileSync(REPORT_PATH, markdownContent, 'utf-8');
console.log(`✅ Reporte escrito con éxito en: ${REPORT_PATH}`);
