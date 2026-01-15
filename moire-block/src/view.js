// Moiré Block Frontend View Script
// Initializes canvas animation for each block instance on the frontend

class MoireCanvas {
    constructor(canvas, settings) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.settings = settings;
        this.time = 0;
        this.animationId = null;
        this.customImages = { 1: null, 2: null };
        this.prevSvgs = { 1: '', 2: '' };
    }

    updateSettings(settings) {
        this.settings = settings;
    }

    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    animate() {
        if (this.settings.animationEnabled) {
            this.time += this.settings.reverseDirection ? -0.016 : 0.016;
        }
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    getMovementOffset() {
        const m = this.settings;
        const t = this.time * m.moveSpeed * 0.5;
        const ratio = m.xyRatio;
        let dx = 0, dy = 0;

        switch (m.movementType) {
            case 'rotation':
                break;
            case 'swing':
                dx = Math.sin(t) * m.swingX;
                dy = Math.sin(t * ratio) * m.swingY;
                break;
            case 'linear':
                dx = ((t % 4) < 2 ? (t % 2) : (2 - t % 2)) * m.swingX - m.swingX;
                dy = (((t * ratio) % 4) < 2 ? ((t * ratio) % 2) : (2 - (t * ratio) % 2)) * m.swingY - m.swingY;
                break;
            case 'circular':
                dx = Math.cos(t) * m.swingX;
                dy = Math.sin(t) * m.swingY;
                break;
            case 'lissajous':
                dx = Math.sin(t * 3) * m.swingX;
                dy = Math.sin(t * ratio * 2) * m.swingY;
                break;
        }

        if (m.moveAxis === 'x') dy = 0;
        if (m.moveAxis === 'y') dx = 0;

        return { dx, dy };
    }

    getAnimatedScale() {
        const s = this.settings;
        if (!s.scaleAnimEnabled) return 1;
        const t = this.time * s.scaleSpeed * 0.3;
        const range = s.scaleMax - s.scaleMin;
        const scale = s.scaleMin + (Math.sin(t) * 0.5 + 0.5) * range;
        return scale / 100;
    }

    render() {
        const { ctx, canvas, settings } = this;
        const { width, height } = canvas;

        this.checkCustomSvgs(); // Check if we need to load new SVG images

        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Apply global rotation if set
        ctx.save();
        if (settings.canvasRotation && settings.canvasRotation !== 0) {
            const cx = width / 2;
            const cy = height / 2;
            ctx.translate(cx, cy);
            ctx.rotate(settings.canvasRotation * Math.PI / 180);
            ctx.translate(-cx, -cy);
        }

        const mode = settings.mode;
        if (mode === 'svg') this.renderSvgMode();
        else if (mode === 'geometric') this.renderGeometricMode();
        else if (mode === 'text') this.renderTextMode();
        else if (mode === 'line') this.renderLineMode();
        else if (mode === 'shape') this.renderShapeMode();

        ctx.restore();
    }

    renderSvgMode() {
        const s = this.settings;
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const cx = width / 2;
        const cy = height / 2;
        const { dx, dy } = this.getMovementOffset();
        const animScale = this.getAnimatedScale();

        ctx.save();
        const baseCutoffX = (s.cutoffBase / 100) * width;
        ctx.beginPath();
        ctx.rect(0, 0, baseCutoffX, height);
        ctx.clip();
        ctx.globalAlpha = s.svgOpacity1 / 100;
        ctx.translate(cx, cy);
        ctx.rotate(s.svgRotation1 * Math.PI / 180);
        ctx.scale(s.svgScale1 / 100, s.svgScale1 / 100);
        this.drawPattern(s.svgPattern1, s.foregroundColor, s.svgStrokeWidth1, 1);
        ctx.restore();

        ctx.save();
        const revealCutoffX = width - (s.cutoffReveal / 100) * width;
        ctx.beginPath();
        ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        ctx.clip();
        ctx.globalAlpha = s.svgOpacity2 / 100;
        ctx.globalCompositeOperation = s.blendMode;
        ctx.translate(cx + s.svgOffsetX2 + dx, cy + s.svgOffsetY2 + dy);
        ctx.rotate((s.svgRotation2 + this.time * s.svgSpeed2 * 10) * Math.PI / 180);
        ctx.scale((s.svgScale2 / 100) * animScale, (s.svgScale2 / 100) * animScale);
        this.drawPattern(s.svgPattern2, s.foregroundColor, s.svgStrokeWidth2, 2);
        ctx.restore();
    }

    renderGeometricMode() {
        const s = this.settings;
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const cx = width / 2;
        const cy = height / 2;
        const { dx, dy } = this.getMovementOffset();
        const animScale = this.getAnimatedScale();

        ctx.save();
        const baseCutoffX = (s.cutoffBase / 100) * width;
        ctx.beginPath();
        ctx.rect(0, 0, baseCutoffX, height);
        ctx.clip();
        ctx.translate(cx, cy);
        this.drawGeometric(s.geoShape1, s.geoCount, s.geoSpacing, s.geoThickness);
        ctx.restore();

        ctx.save();
        const revealCutoffX = width - (s.cutoffReveal / 100) * width;
        ctx.beginPath();
        ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        ctx.clip();
        ctx.globalCompositeOperation = s.blendMode;
        ctx.translate(cx + s.geoOffsetX + dx, cy + s.geoOffsetY + dy);
        const geoRotSpeed = s.geoRotationSpeed !== undefined ? s.geoRotationSpeed : 10;
        ctx.rotate(this.time * geoRotSpeed * 0.1);
        ctx.scale((1 + s.geoScaleDiff / 100) * animScale, (1 + s.geoScaleDiff / 100) * animScale);
        this.drawGeometric(s.geoShape2, s.geoCount, s.geoSpacing, s.geoThickness);
        ctx.restore();
    }

    renderTextMode() {
        const s = this.settings;
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const cx = width / 2;
        const cy = height / 2;
        const { dx, dy } = this.getMovementOffset();
        const animScale = this.getAnimatedScale();

        ctx.save();
        const baseCutoffX = (s.cutoffBase / 100) * width;
        ctx.beginPath();
        ctx.rect(0, 0, baseCutoffX, height);
        ctx.clip();
        ctx.fillStyle = s.foregroundColor;
        ctx.font = `bold ${s.textSize}px ${s.textFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textWidth = ctx.measureText(s.textContent).width + s.textSpacing * s.textContent.length;
        const textHeight = s.textSize * 1.2;
        for (let y = 0; y < s.textRepeatY; y++) {
            for (let x = 0; x < s.textRepeatX; x++) {
                const px = (x - s.textRepeatX / 2 + 0.5) * textWidth + cx;
                const py = (y - s.textRepeatY / 2 + 0.5) * textHeight + cy;
                ctx.fillText(s.textContent, px, py);
            }
        }
        ctx.restore();

        ctx.save();
        const revealCutoffX = width - (s.cutoffReveal / 100) * width;
        ctx.beginPath();
        ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        ctx.clip();
        ctx.globalCompositeOperation = s.blendMode;
        ctx.translate(cx + s.textOffsetX + dx, cy + s.textOffsetY + dy);
        const rotSpeed = s.textRotationSpeed !== undefined ? s.textRotationSpeed : 5;
        ctx.rotate(this.time * rotSpeed * 0.1);
        ctx.scale(animScale, animScale);
        this.drawTextOverlay(s.textOverlay, s.textOverlaySpacing);
        ctx.restore();
    }

    renderLineMode() {
        const s = this.settings;
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const diagonal = Math.sqrt(width * width + height * height);
        const cx = width / 2;
        const cy = height / 2;
        const { dx, dy } = this.getMovementOffset();
        const animScale = this.getAnimatedScale();

        ctx.save();
        const baseCutoffX = (s.cutoffBase / 100) * width;
        ctx.beginPath();
        ctx.rect(0, 0, baseCutoffX, height);
        ctx.clip();
        ctx.globalAlpha = s.lineOpacityBase / 100;
        ctx.translate(cx, cy);
        this.drawLineLayer(s.linePeriodBase, s.lineThicknessBase, s.lineAngleBase, diagonal, 0, 0, false, 0, 0, 0);
        ctx.restore();

        ctx.save();
        const revealCutoffX = width - (s.cutoffReveal / 100) * width;
        ctx.beginPath();
        ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        ctx.clip();
        ctx.globalAlpha = s.lineOpacityReveal / 100;
        ctx.globalCompositeOperation = s.blendMode;
        ctx.translate(cx + dx, cy + dy);
        const lineRotSpeed = s.lineRotationSpeed !== undefined ? s.lineRotationSpeed : 0;
        ctx.rotate(this.time * lineRotSpeed * 0.1);
        ctx.scale(animScale, animScale);
        const curveTime = this.time * s.lineCurveSpeed * 0.1;
        this.drawLineLayer(
            s.linePeriodReveal, s.lineThicknessReveal, s.lineAngleReveal, diagonal,
            0, 0, s.lineCurveEnabled, s.lineCurveAmplitude, s.lineCurveFrequency, curveTime
        );
        ctx.restore();
    }

    renderShapeMode() {
        const s = this.settings;
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const { dx, dy } = this.getMovementOffset();

        const basePeriod = s.shapePeriodBase;
        const compressionFactor = s.shapeCompression;
        const compressedBlockHeight = basePeriod * compressionFactor;

        ctx.save();
        const baseCutoffX = (s.cutoffBase / 100) * width;
        ctx.beginPath();
        ctx.rect(0, 0, baseCutoffX, height);
        ctx.clip();
        ctx.fillStyle = s.foregroundColor;
        ctx.font = `bold ${s.shapeFontSize}px ${s.shapeFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textWidth = ctx.measureText(s.shapeText).width;
        const textRepeatWidth = textWidth * 1.3;
        const numVerticalBlocks = Math.ceil(height / compressedBlockHeight) + 2;

        for (let rep = 0; rep < s.shapeRepeatX; rep++) {
            const baseX = (rep - s.shapeRepeatX / 2 + 0.5) * textRepeatWidth + width / 2;
            for (let block = -1; block < numVerticalBlocks; block++) {
                const blockY = block * compressedBlockHeight;
                ctx.save();
                ctx.translate(baseX, blockY + compressedBlockHeight / 2);
                ctx.scale(1, 1 / compressionFactor);
                ctx.fillText(s.shapeText, 0, 0);
                ctx.restore();
            }
        }
        ctx.restore();

        ctx.save();
        const revealCutoffX = width - (s.cutoffReveal / 100) * width;
        ctx.beginPath();
        ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        ctx.clip();
        ctx.globalAlpha = s.shapeRevealOpacity / 100;
        const shapeRotSpeed = s.shapeRotationSpeed !== undefined ? s.shapeRotationSpeed : 0;
        ctx.translate(width / 2, height / 2);
        ctx.rotate(this.time * shapeRotSpeed * 0.1);
        ctx.translate(-width / 2, -height / 2);
        ctx.fillStyle = s.backgroundColor;
        const revealPeriod = s.shapePeriodReveal;
        const slitWidth = s.shapeSlitWidth;
        const opaqueWidth = revealPeriod - slitWidth;
        const numBars = Math.ceil(height / revealPeriod) + 2;
        for (let i = -1; i < numBars; i++) {
            const barY = i * revealPeriod + ((dy * 10) % revealPeriod) + slitWidth;
            ctx.fillRect(0, barY, width, opaqueWidth);
        }
        ctx.restore();
    }

    drawLineLayer(period, thickness, angle, size, offsetX, offsetY, curved, curveAmp, curveFreq, curveTime) {
        const { ctx, settings } = this;
        ctx.strokeStyle = settings.foregroundColor;
        ctx.lineWidth = thickness;

        const halfSize = size / 2 + 100;
        const baseAngleRad = angle * Math.PI / 180;
        const numLines = Math.ceil(size * 2 / period) + 10;
        const startOffset = -numLines * period / 2;

        for (let i = 0; i < numLines; i++) {
            const basePos = startOffset + i * period + (offsetY % period);
            ctx.beginPath();

            if (curved) {
                const steps = 100;
                for (let s = 0; s <= steps; s++) {
                    const x = -halfSize + (s / steps) * halfSize * 2 + offsetX;
                    const waveAngle = Math.sin((x / size) * Math.PI * curveFreq + curveTime) * curveAmp;
                    const localAngleRad = (angle + waveAngle) * Math.PI / 180;
                    const y = basePos + Math.tan(localAngleRad) * x;
                    if (s === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
            } else {
                const x1 = -halfSize + offsetX;
                const x2 = halfSize + offsetX;
                const y1 = basePos + Math.tan(baseAngleRad) * x1;
                const y2 = basePos + Math.tan(baseAngleRad) * x2;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.stroke();
        }
    }

    checkCustomSvgs() {
        const s = this.settings;

        // Layer 1
        if (s.svgPattern1 === 'custom' && s.svgCustom1 && s.svgCustom1 !== this.prevSvgs[1]) {
            this.prevSvgs[1] = s.svgCustom1;
            const img = new Image();
            img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(s.svgCustom1);
            this.customImages[1] = img;
        }

        // Layer 2
        if (s.svgPattern2 === 'custom' && s.svgCustom2 && s.svgCustom2 !== this.prevSvgs[2]) {
            this.prevSvgs[2] = s.svgCustom2;
            const img = new Image();
            img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(s.svgCustom2);
            this.customImages[2] = img;
        }
    }

    drawPattern(type, color, strokeWidth = 2, layerIndex = 1) {
        const size = Math.max(this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = strokeWidth;

        switch (type) {
            case 'circles': this.drawConcentricCircles(size); break;
            case 'spiral': this.drawSpiral(size); break;
            case 'radial': this.drawRadialLines(size); break;
            case 'grid': this.drawGrid(size); break;
            case 'hexagon': this.drawHexPattern(size); break;
            case 'waves': this.drawWaves(size); break;
            case 'checkers': this.drawCheckers(size); break;
            case 'fibonacci': this.drawFibonacci(size); break;
            case 'custom':
                const img = this.customImages[layerIndex];
                if (img && img.complete && img.naturalWidth > 0) {
                    // Draw centered
                    const aspect = img.naturalWidth / img.naturalHeight;
                    let drawW = size;
                    let drawH = size / aspect;
                    if (drawH < size) {
                        drawH = size;
                        drawW = size * aspect;
                    }
                    this.ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
                }
                break;
        }
    }

    drawConcentricCircles(size) {
        for (let r = 10; r < size; r += 12) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, r, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    drawSpiral(size) {
        this.ctx.beginPath();
        for (let a = 0; a < 50; a += 0.05) {
            const r = a * 8;
            const x = r * Math.cos(a);
            const y = r * Math.sin(a);
            if (a === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    }

    drawRadialLines(size) {
        for (let a = 0; a < 360; a += 3) {
            const rad = a * Math.PI / 180;
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(Math.cos(rad) * size, Math.sin(rad) * size);
            this.ctx.stroke();
        }
    }

    drawGrid(size) {
        const step = 20;
        for (let i = -size; i < size; i += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, -size);
            this.ctx.lineTo(i, size);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(-size, i);
            this.ctx.lineTo(size, i);
            this.ctx.stroke();
        }
    }

    drawHexPattern(size) {
        const r = 30;
        const h = r * Math.sqrt(3);
        for (let row = -size / h; row < size / h; row++) {
            for (let col = -size / (r * 1.5); col < size / (r * 1.5); col++) {
                const x = col * r * 1.5;
                const y = row * h + (col % 2 ? h / 2 : 0);
                this.ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    const px = x + r * Math.cos(angle);
                    const py = y + r * Math.sin(angle);
                    if (i === 0) this.ctx.moveTo(px, py);
                    else this.ctx.lineTo(px, py);
                }
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
    }

    drawWaves(size) {
        for (let y = -size; y < size; y += 15) {
            this.ctx.beginPath();
            for (let x = -size; x < size; x += 5) {
                const py = y + Math.sin(x * 0.05) * 20;
                if (x === -size) this.ctx.moveTo(x, py);
                else this.ctx.lineTo(x, py);
            }
            this.ctx.stroke();
        }
    }

    drawCheckers(size) {
        const step = 30;
        this.ctx.fillStyle = this.settings.foregroundColor;
        for (let y = -size; y < size; y += step) {
            for (let x = -size; x < size; x += step) {
                if ((Math.floor(x / step) + Math.floor(y / step)) % 2 === 0) {
                    this.ctx.fillRect(x, y, step, step);
                }
            }
        }
    }

    drawFibonacci(size) {
        let a = 1, b = 1;
        this.ctx.beginPath();
        let angle = 0;
        for (let i = 0; i < 15; i++) {
            const scale = 5;
            this.ctx.arc(0, 0, a * scale, angle, angle + Math.PI / 2);
            const next = a + b;
            a = b;
            b = next;
            angle += Math.PI / 2;
        }
        this.ctx.stroke();
    }

    drawGeometric(type, count, spacing, thickness) {
        this.ctx.strokeStyle = this.settings.foregroundColor;
        this.ctx.lineWidth = thickness;
        const size = Math.max(this.canvas.width, this.canvas.height);

        switch (type) {
            case 'circles':
                for (let i = 1; i <= count; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, i * spacing, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                break;
            case 'radialLines':
                for (let i = 0; i < count; i++) {
                    const a = (i / count) * Math.PI * 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    this.ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
                    this.ctx.stroke();
                }
                break;
            case 'rectangularGrid':
                for (let i = -count; i <= count; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(i * spacing, -size);
                    this.ctx.lineTo(i * spacing, size);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(-size, i * spacing);
                    this.ctx.lineTo(size, i * spacing);
                    this.ctx.stroke();
                }
                break;
            case 'hexGrid':
                this.drawHexPattern(size);
                break;
            case 'triangles':
                for (let i = 1; i <= count; i++) {
                    this.ctx.beginPath();
                    for (let j = 0; j < 3; j++) {
                        const a = (j / 3) * Math.PI * 2 - Math.PI / 2;
                        const r = i * spacing;
                        const x = Math.cos(a) * r;
                        const y = Math.sin(a) * r;
                        if (j === 0) this.ctx.moveTo(x, y);
                        else this.ctx.lineTo(x, y);
                    }
                    this.ctx.closePath();
                    this.ctx.stroke();
                }
                break;
            case 'dots':
                this.ctx.fillStyle = this.settings.foregroundColor;
                for (let y = -count; y <= count; y++) {
                    for (let x = -count; x <= count; x++) {
                        this.ctx.beginPath();
                        this.ctx.arc(x * spacing, y * spacing, thickness, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
                break;
        }
    }

    drawTextOverlay(type, spacing) {
        const { ctx, canvas, settings } = this;
        const size = Math.max(canvas.width, canvas.height);
        ctx.strokeStyle = settings.foregroundColor;
        ctx.lineWidth = 1;

        switch (type) {
            case 'lines':
                for (let y = -size; y < size; y += spacing) {
                    ctx.beginPath();
                    ctx.moveTo(-size, y);
                    ctx.lineTo(size, y);
                    ctx.stroke();
                }
                break;
            case 'verticalLines':
                for (let x = -size; x < size; x += spacing) {
                    ctx.beginPath();
                    ctx.moveTo(x, -size);
                    ctx.lineTo(x, size);
                    ctx.stroke();
                }
                break;
            case 'grid':
                for (let i = -size; i < size; i += spacing) {
                    ctx.beginPath();
                    ctx.moveTo(i, -size);
                    ctx.lineTo(i, size);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(-size, i);
                    ctx.lineTo(size, i);
                    ctx.stroke();
                }
                break;
            case 'circles':
                for (let r = spacing; r < size; r += spacing) {
                    ctx.beginPath();
                    ctx.arc(0, 0, r, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
            case 'text':
                ctx.fillStyle = settings.foregroundColor;
                ctx.font = `bold ${settings.textSize}px ${settings.textFont}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const tw = ctx.measureText(settings.textContent).width + settings.textSpacing * settings.textContent.length;
                const th = settings.textSize * 1.2;
                for (let y = 0; y < settings.textRepeatY; y++) {
                    for (let x = 0; x < settings.textRepeatX; x++) {
                        const px = (x - settings.textRepeatX / 2 + 0.5) * tw;
                        const py = (y - settings.textRepeatY / 2 + 0.5) * th;
                        ctx.fillText(settings.textContent, px, py);
                    }
                }
                break;
        }
    }
}

// Helper to parse data attributes
function parseSettings(container) {
    const get = (attr, defaultVal, type = 'string') => {
        const val = container.dataset[attr];
        if (val === undefined || val === null || val === '') return defaultVal;
        if (type === 'number') return parseFloat(val);
        if (type === 'boolean') return val === 'true';
        return val;
    };

    return {
        mode: get('mode', 'svg'),
        aspectRatio: get('aspectRatio', '1'),
        // SVG
        svgPattern1: get('svgPattern1', 'circles'),
        svgScale1: get('svgScale1', 100, 'number'),
        svgRotation1: get('svgRotation1', 0, 'number'),
        svgOpacity1: get('svgOpacity1', 100, 'number'),
        svgStrokeWidth1: get('svgStrokeWidth1', 2, 'number'),
        svgCustom1: get('svgCustom1', ''),
        svgPattern2: get('svgPattern2', 'spiral'),
        svgScale2: get('svgScale2', 100, 'number'),
        svgRotation2: get('svgRotation2', 0, 'number'),
        svgSpeed2: get('svgSpeed2', 10, 'number'),
        svgOpacity2: get('svgOpacity2', 100, 'number'),
        svgStrokeWidth2: get('svgStrokeWidth2', 2, 'number'),
        svgOffsetX2: get('svgOffsetX2', 0, 'number'),
        svgOffsetY2: get('svgOffsetY2', 0, 'number'),
        svgCustom2: get('svgCustom2', ''),
        // Geometric
        geoShape1: get('geoShape1', 'circles'),
        geoShape2: get('geoShape2', 'circles'),
        geoCount: get('geoCount', 40, 'number'),
        geoThickness: get('geoThickness', 2, 'number'),
        geoSpacing: get('geoSpacing', 15, 'number'),
        geoScaleDiff: get('geoScaleDiff', 5, 'number'),
        geoOffsetX: get('geoOffsetX', 0, 'number'),
        geoOffsetY: get('geoOffsetY', 0, 'number'),
        geoRotationSpeed: get('geoRotationSpeed', 10, 'number'),
        // Text
        textContent: get('textContent', 'MOIRÉ'),
        textFont: get('textFont', 'Inter'),
        textSize: get('textSize', 80, 'number'),
        textSpacing: get('textSpacing', 0, 'number'),
        textRepeatX: get('textRepeatX', 5, 'number'),
        textRepeatY: get('textRepeatY', 5, 'number'),
        textOverlay: get('textOverlay', 'text'),
        textOverlaySpacing: get('textOverlaySpacing', 8, 'number'),
        textOffsetX: get('textOffsetX', 0, 'number'),
        textOffsetY: get('textOffsetY', 0, 'number'),
        textRotationSpeed: get('textRotationSpeed', 5, 'number'),
        // Line
        linePeriodBase: get('linePeriodBase', 8, 'number'),
        lineThicknessBase: get('lineThicknessBase', 3, 'number'),
        lineAngleBase: get('lineAngleBase', 0, 'number'),
        lineOpacityBase: get('lineOpacityBase', 100, 'number'),
        linePeriodReveal: get('linePeriodReveal', 9, 'number'),
        lineThicknessReveal: get('lineThicknessReveal', 3, 'number'),
        lineAngleReveal: get('lineAngleReveal', 0, 'number'),
        lineOpacityReveal: get('lineOpacityReveal', 100, 'number'),
        lineCurveEnabled: get('lineCurveEnabled', false, 'boolean'),
        lineCurveAmplitude: get('lineCurveAmplitude', 15, 'number'),
        lineCurveFrequency: get('lineCurveFrequency', 2, 'number'),
        lineCurveSpeed: get('lineCurveSpeed', 10, 'number'),
        lineRotationSpeed: get('lineRotationSpeed', 0, 'number'),
        // Shape
        shapeText: get('shapeText', 'HELLO'),
        shapeFont: get('shapeFont', 'Arial Black'),
        shapeFontSize: get('shapeFontSize', 60, 'number'),
        shapePeriodBase: get('shapePeriodBase', 8, 'number'),
        shapeCompression: get('shapeCompression', 8, 'number'),
        shapeRepeatX: get('shapeRepeatX', 3, 'number'),
        shapePeriodReveal: get('shapePeriodReveal', 9, 'number'),
        shapeSlitWidth: get('shapeSlitWidth', 2, 'number'),
        shapeRevealOpacity: get('shapeRevealOpacity', 100, 'number'),
        shapeRotationSpeed: get('shapeRotationSpeed', 0, 'number'),
        // Movement
        movementType: get('movementType', 'rotation'),
        moveAxis: get('moveAxis', 'both'),
        swingX: get('swingX', 50, 'number'),
        swingY: get('swingY', 50, 'number'),
        moveSpeed: get('moveSpeed', 10, 'number'),
        xyRatio: get('xyRatio', 10, 'number'),
        // Scale
        scaleAnimEnabled: get('scaleAnimEnabled', false, 'boolean'),
        scaleMin: get('scaleMin', 80, 'number'),
        scaleMax: get('scaleMax', 120, 'number'),
        scaleSpeed: get('scaleSpeed', 10, 'number'),
        // Layer clipping
        cutoffBase: get('cutoffBase', 100, 'number'),
        cutoffReveal: get('cutoffReveal', 100, 'number'),
        // Global
        foregroundColor: get('foregroundColor', '#ffffff'),
        backgroundColor: get('backgroundColor', '#0a0a0f'),
        blendMode: get('blendMode', 'difference'),
        animationEnabled: get('animationEnabled', true, 'boolean'),
        reverseDirection: get('reverseDirection', false, 'boolean'),
        canvasRotation: get('canvasRotation', 0, 'number'),
    };
}

// Initialize all moiré blocks on page load
function initMoireBlocks() {
    const blocks = document.querySelectorAll('.wp-block-moire-block-moire-group');

    blocks.forEach((container) => {
        const canvas = container.querySelector('.moire-block-canvas');
        if (!canvas) return;

        const settings = parseSettings(container);
        const moire = new MoireCanvas(canvas, settings);

        // Handle resize
        const resizeCanvas = () => {
            const width = container.clientWidth;
            let height;
            if (settings.aspectRatio && settings.aspectRatio !== '' && !isNaN(parseFloat(settings.aspectRatio))) {
                height = width / parseFloat(settings.aspectRatio);
            } else {
                height = container.clientHeight;
            }
            moire.resize(width, height);
        };

        // Use ResizeObserver for responsive sizing
        const observer = new ResizeObserver(() => {
            resizeCanvas();
        });
        observer.observe(container);

        // Initial resize and start
        resizeCanvas();
        moire.start();

        // Intersection observer for performance - pause when not visible
        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    moire.start();
                } else {
                    moire.stop();
                }
            });
        }, { threshold: 0 });
        intersectionObserver.observe(container);
    });
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMoireBlocks);
} else {
    initMoireBlocks();
}
