// Moiré Pattern Studio - Main Application
class MoireStudio {
    constructor() {
        this.canvas = document.getElementById('moireCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.mode = 'svg';
        this.animationId = null;
        this.time = 0;
        this.settings = this.getDefaultSettings();
        this.init();
    }

    getDefaultSettings() {
        return {
            svg: {
                pattern1: 'circles', scale1: 100, rotation1: 0, opacity1: 100, strokeWidth1: 2,
                pattern2: 'spiral', scale2: 100, rotation2: 0, speed2: 10, opacity2: 100, strokeWidth2: 2,
                offsetX2: 0, offsetY2: 0
            },
            geometric: {
                shape1: 'circles', shape2: 'circles', count: 40, thickness: 2, spacing: 15,
                scaleDiff: 5, offsetX: 0, offsetY: 0
            },
            text: {
                text: 'MOIRÉ', font: 'Inter', size: 80, spacing: 0,
                repeatX: 5, repeatY: 5, overlay: 'text', overlaySpacing: 8,
                offsetX: 0, offsetY: 0
            },
            line: {
                periodBase: 8, thicknessBase: 3, angleBase: 0, opacityBase: 100,
                periodReveal: 9, thicknessReveal: 3, angleReveal: 0, opacityReveal: 100,
                curveEnabled: false, curveAmplitude: 15, curveFrequency: 2, curveSpeed: 10
            },
            shape: {
                text: 'HELLO', font: 'Arial Black', fontSize: 60,
                periodBase: 8, compression: 8, repeatX: 3,
                periodReveal: 9, slitWidth: 2, revealOpacity: 100
            },
            global: {
                foreground: '#ffffff', background: '#0a0a0f',
                blendMode: 'difference', animationEnabled: true, reverse: false,
                cutoffBase: 100, cutoffReveal: 100
            },
            movement: {
                type: 'rotation', axis: 'both',
                swingX: 50, swingY: 50, speed: 10, xyRatio: 10
            },
            scale: {
                enabled: false, min: 80, max: 120, speed: 10
            }
        };
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.bindControls();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    bindControls() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
                document.querySelectorAll('.mode-controls').forEach(c => c.classList.add('hidden'));
                document.getElementById(`${this.mode}Controls`).classList.remove('hidden');
            });
        });

        // Toggle panel
        document.getElementById('togglePanel').addEventListener('click', () => {
            document.getElementById('settingsPanel').classList.toggle('hidden');
        });

        // SVG controls
        this.bindSlider('svg1Scale', v => { this.settings.svg.scale1 = v; }, '%');
        this.bindSlider('svg1Rotation', v => { this.settings.svg.rotation1 = v; }, '°');
        this.bindSlider('svg1Opacity', v => { this.settings.svg.opacity1 = v; }, '%');
        this.bindSlider('svg2Scale', v => { this.settings.svg.scale2 = v; }, '%');
        this.bindSlider('svg2Rotation', v => { this.settings.svg.rotation2 = v; }, '°');
        this.bindSlider('svg2Speed', v => { this.settings.svg.speed2 = v; }, '', 0.1);
        this.bindSlider('svg2Opacity', v => { this.settings.svg.opacity2 = v; }, '%');
        this.bindSlider('svg2OffsetX', v => { this.settings.svg.offsetX2 = v; });
        this.bindSlider('svg2OffsetY', v => { this.settings.svg.offsetY2 = v; });
        this.bindSelect('svg1Pattern', v => { this.settings.svg.pattern1 = v; });
        this.bindSelect('svg2Pattern', v => { this.settings.svg.pattern2 = v; });
        this.bindSlider('svg1StrokeWidth', v => { this.settings.svg.strokeWidth1 = v; }, 'px');
        this.bindSlider('svg2StrokeWidth', v => { this.settings.svg.strokeWidth2 = v; }, 'px');

        // Geometric controls
        this.bindSelect('geoShape', v => { this.settings.geometric.shape1 = v; });
        this.bindSelect('geoShape2', v => { this.settings.geometric.shape2 = v; });
        this.bindSlider('geoCount', v => { this.settings.geometric.count = v; });
        this.bindSlider('geoThickness', v => { this.settings.geometric.thickness = v; }, 'px');
        this.bindSlider('geoSpacing', v => { this.settings.geometric.spacing = v; }, 'px');
        this.bindSlider('geoScaleDiff', v => { this.settings.geometric.scaleDiff = v; }, '%');
        this.bindSlider('geoOffsetX', v => { this.settings.geometric.offsetX = v; });
        this.bindSlider('geoOffsetY', v => { this.settings.geometric.offsetY = v; });

        // Text controls
        document.getElementById('textInput').addEventListener('input', e => { this.settings.text.text = e.target.value; });
        this.bindSelect('textFont', v => { this.settings.text.font = v; });
        this.bindSelect('textOverlay', v => { this.settings.text.overlay = v; });
        this.bindSlider('textSize', v => { this.settings.text.size = v; }, 'px');
        this.bindSlider('textSpacing', v => { this.settings.text.spacing = v; }, 'px');
        this.bindSlider('textRepeatX', v => { this.settings.text.repeatX = v; });
        this.bindSlider('textRepeatY', v => { this.settings.text.repeatY = v; });
        this.bindSlider('textOverlaySpacing', v => { this.settings.text.overlaySpacing = v; }, 'px');
        this.bindSlider('textOffsetX', v => { this.settings.text.offsetX = v; });
        this.bindSlider('textOffsetY', v => { this.settings.text.offsetY = v; });

        // Movement animation controls
        this.bindSelect('movementType', v => { this.settings.movement.type = v; });
        this.bindSelect('moveAxis', v => { this.settings.movement.axis = v; });
        this.bindSlider('swingX', v => { this.settings.movement.swingX = v; }, 'px');
        this.bindSlider('swingY', v => { this.settings.movement.swingY = v; }, 'px');
        this.bindSlider('moveSpeed', v => { this.settings.movement.speed = v; }, '', 0.1);
        this.bindSlider('xyRatio', v => { this.settings.movement.xyRatio = v; }, '', 0.1);

        // Scale animation controls
        document.getElementById('scaleAnimEnabled').addEventListener('change', e => { this.settings.scale.enabled = e.target.checked; });
        this.bindSlider('scaleMin', v => { this.settings.scale.min = v; }, '%');
        this.bindSlider('scaleMax', v => { this.settings.scale.max = v; }, '%');
        this.bindSlider('scaleSpeed', v => { this.settings.scale.speed = v; }, '', 0.1);

        // Global controls
        document.getElementById('foregroundColor').addEventListener('input', e => { this.settings.global.foreground = e.target.value; });
        document.getElementById('backgroundColor').addEventListener('input', e => { this.settings.global.background = e.target.value; });
        this.bindSelect('blendMode', v => { this.settings.global.blendMode = v; });
        document.getElementById('animationEnabled').addEventListener('change', e => { this.settings.global.animationEnabled = e.target.checked; });
        document.getElementById('reverseDirection').addEventListener('change', e => { this.settings.global.reverse = e.target.checked; });
        this.bindSlider('cutoffBase', v => { this.settings.global.cutoffBase = v; }, '%');
        this.bindSlider('cutoffReveal', v => { this.settings.global.cutoffReveal = v; }, '%');

        // Actions
        document.getElementById('exportPng').addEventListener('click', () => this.exportPng());
        document.getElementById('resetSettings').addEventListener('click', () => this.reset());

        // Presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
        });

        // Line Moiré controls
        this.bindSlider('linePeriodBase', v => { this.settings.line.periodBase = v; }, 'px');
        this.bindSlider('lineThicknessBase', v => { this.settings.line.thicknessBase = v; }, 'px');
        this.bindSlider('lineAngleBase', v => { this.settings.line.angleBase = v; }, '°');
        this.bindSlider('lineOpacityBase', v => { this.settings.line.opacityBase = v; }, '%');
        this.bindSlider('linePeriodReveal', v => { this.settings.line.periodReveal = v; }, 'px');
        this.bindSlider('lineThicknessReveal', v => { this.settings.line.thicknessReveal = v; }, 'px');
        this.bindSlider('lineAngleReveal', v => { this.settings.line.angleReveal = v; }, '°');
        this.bindSlider('lineOpacityReveal', v => { this.settings.line.opacityReveal = v; }, '%');
        document.getElementById('lineCurveEnabled').addEventListener('change', e => { this.settings.line.curveEnabled = e.target.checked; });
        this.bindSlider('lineCurveAmplitude', v => { this.settings.line.curveAmplitude = v; }, '°');
        this.bindSlider('lineCurveFrequency', v => { this.settings.line.curveFrequency = v; });
        this.bindSlider('lineCurveSpeed', v => { this.settings.line.curveSpeed = v; }, '', 0.1);

        // Shape Moiré controls
        document.getElementById('shapeText').addEventListener('input', e => { this.settings.shape.text = e.target.value; });
        this.bindSelect('shapeFont', v => { this.settings.shape.font = v; });
        this.bindSlider('shapeFontSize', v => { this.settings.shape.fontSize = v; }, 'px');
        this.bindSlider('shapePeriodBase', v => { this.settings.shape.periodBase = v; }, 'px');
        this.bindSlider('shapeCompression', v => { this.settings.shape.compression = v; }, 'x');
        this.bindSlider('shapeRepeatX', v => { this.settings.shape.repeatX = v; });
        this.bindSlider('shapePeriodReveal', v => { this.settings.shape.periodReveal = v; }, 'px');
        this.bindSlider('shapeSlitWidth', v => { this.settings.shape.slitWidth = v; }, 'px');
        this.bindSlider('shapeRevealOpacity', v => { this.settings.shape.revealOpacity = v; }, '%');
    }

    bindSlider(id, callback, suffix = '', multiplier = 1) {
        const slider = document.getElementById(id);
        const display = document.getElementById(id + 'Value');
        if (!slider) return;
        const update = () => {
            const val = parseFloat(slider.value) * multiplier;
            callback(val);
            if (display) display.textContent = (multiplier !== 1 ? val.toFixed(1) : slider.value) + suffix;
        };
        slider.addEventListener('input', update);
        update();
    }

    bindSelect(id, callback) {
        const select = document.getElementById(id);
        if (!select) return;
        select.addEventListener('change', () => callback(select.value));
    }

    // Calculate movement offset based on animation type
    getMovementOffset() {
        const m = this.settings.movement;
        const t = this.time * m.speed * 0.5;
        const ratio = m.xyRatio;
        let dx = 0, dy = 0;

        switch (m.type) {
            case 'rotation':
                // No XY movement, only rotation
                break;
            case 'swing':
                // Sinusoidal oscillation
                dx = Math.sin(t) * m.swingX;
                dy = Math.sin(t * ratio) * m.swingY;
                break;
            case 'linear':
                // Linear back-and-forth
                dx = ((t % 4) < 2 ? (t % 2) : (2 - t % 2)) * m.swingX - m.swingX;
                dy = (((t * ratio) % 4) < 2 ? ((t * ratio) % 2) : (2 - (t * ratio) % 2)) * m.swingY - m.swingY;
                break;
            case 'circular':
                // Circular path
                dx = Math.cos(t) * m.swingX;
                dy = Math.sin(t) * m.swingY;
                break;
            case 'lissajous':
                // Lissajous curve (figure-8 and more complex patterns)
                dx = Math.sin(t * 3) * m.swingX;
                dy = Math.sin(t * ratio * 2) * m.swingY;
                break;
        }

        // Apply axis restriction
        if (m.axis === 'x') dy = 0;
        if (m.axis === 'y') dx = 0;

        return { dx, dy };
    }

    // Calculate animated scale
    getAnimatedScale() {
        const s = this.settings.scale;
        if (!s.enabled) return 1;
        const t = this.time * s.speed * 0.3;
        const range = s.max - s.min;
        const scale = s.min + (Math.sin(t) * 0.5 + 0.5) * range;
        return scale / 100;
    }

    animate() {
        if (this.settings.global.animationEnabled) {
            this.time += this.settings.global.reverse ? -0.016 : 0.016;
        }
        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    render() {
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        ctx.fillStyle = this.settings.global.background;
        ctx.fillRect(0, 0, width, height);

        if (this.mode === 'svg') this.renderSvgMode();
        else if (this.mode === 'geometric') this.renderGeometricMode();
        else if (this.mode === 'text') this.renderTextMode();
        else if (this.mode === 'line') this.renderLineMode();
        else if (this.mode === 'shape') this.renderShapeMode();
    }

    renderSvgMode() {
        const s = this.settings.svg;
        const g = this.settings.global;
        const { width, height } = this.canvas;
        const cx = width / 2;
        const cy = height / 2;
        const { dx, dy } = this.getMovementOffset();
        const animScale = this.getAnimatedScale();

        // Layer 1 (Base) with cutoff clipping
        this.ctx.save();
        const baseCutoffX = (g.cutoffBase / 100) * width;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, baseCutoffX, height);
        this.ctx.clip();
        this.ctx.globalAlpha = s.opacity1 / 100;
        this.ctx.translate(cx, cy);
        this.ctx.rotate(s.rotation1 * Math.PI / 180);
        this.ctx.scale(s.scale1 / 100, s.scale1 / 100);
        this.drawPattern(s.pattern1, g.foreground, s.strokeWidth1);
        this.ctx.restore();

        // Layer 2 (Reveal) with movement, scale animation, and cutoff clipping
        this.ctx.save();
        const revealCutoffX = width - (g.cutoffReveal / 100) * width;
        this.ctx.beginPath();
        this.ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        this.ctx.clip();
        this.ctx.globalAlpha = s.opacity2 / 100;
        this.ctx.globalCompositeOperation = g.blendMode;
        this.ctx.translate(cx + s.offsetX2 + dx, cy + s.offsetY2 + dy);
        this.ctx.rotate((s.rotation2 + this.time * s.speed2 * 10) * Math.PI / 180);
        this.ctx.scale((s.scale2 / 100) * animScale, (s.scale2 / 100) * animScale);
        this.drawPattern(s.pattern2, g.foreground, s.strokeWidth2);
        this.ctx.restore();
    }

    renderGeometricMode() {
        const geo = this.settings.geometric;
        const g = this.settings.global;
        const m = this.settings.movement;
        const { width, height } = this.canvas;
        const cx = width / 2;
        const cy = height / 2;
        const { dx, dy } = this.getMovementOffset();
        const animScale = this.getAnimatedScale();

        // Layer 1 (Base) with cutoff clipping
        this.ctx.save();
        const baseCutoffX = (g.cutoffBase / 100) * width;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, baseCutoffX, height);
        this.ctx.clip();
        this.ctx.translate(cx, cy);
        this.drawGeometric(geo.shape1, geo.count, geo.spacing, geo.thickness);
        this.ctx.restore();

        // Layer 2 (Reveal) with cutoff clipping
        this.ctx.save();
        const revealCutoffX = width - (g.cutoffReveal / 100) * width;
        this.ctx.beginPath();
        this.ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        this.ctx.clip();
        this.ctx.globalCompositeOperation = g.blendMode;
        this.ctx.translate(cx + geo.offsetX + dx, cy + geo.offsetY + dy);
        this.ctx.rotate(this.time * m.speed * 0.1);
        this.ctx.scale((1 + geo.scaleDiff / 100) * animScale, (1 + geo.scaleDiff / 100) * animScale);
        this.drawGeometric(geo.shape2, geo.count, geo.spacing, geo.thickness);
        this.ctx.restore();
    }

    renderTextMode() {
        const t = this.settings.text;
        const g = this.settings.global;
        const m = this.settings.movement;
        const { width, height } = this.canvas;
        const cx = width / 2;
        const cy = height / 2;
        const { dx, dy } = this.getMovementOffset();
        const animScale = this.getAnimatedScale();

        // Text layer (Base) with cutoff clipping
        this.ctx.save();
        const baseCutoffX = (g.cutoffBase / 100) * width;
        this.ctx.beginPath();
        this.ctx.rect(0, 0, baseCutoffX, height);
        this.ctx.clip();
        this.ctx.fillStyle = g.foreground;
        this.ctx.font = `bold ${t.size}px ${t.font}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.letterSpacing = t.spacing + 'px';
        const textWidth = this.ctx.measureText(t.text).width + t.spacing * t.text.length;
        const textHeight = t.size * 1.2;
        for (let y = 0; y < t.repeatY; y++) {
            for (let x = 0; x < t.repeatX; x++) {
                const px = (x - t.repeatX / 2 + 0.5) * textWidth + cx;
                const py = (y - t.repeatY / 2 + 0.5) * textHeight + cy;
                this.ctx.fillText(t.text, px, py);
            }
        }
        this.ctx.restore();

        // Overlay (Reveal) with movement, scale animation, and cutoff clipping
        this.ctx.save();
        const revealCutoffX = width - (g.cutoffReveal / 100) * width;
        this.ctx.beginPath();
        this.ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        this.ctx.clip();
        this.ctx.globalCompositeOperation = g.blendMode;
        this.ctx.translate(cx + t.offsetX + dx, cy + t.offsetY + dy);
        this.ctx.rotate(this.time * m.speed * 0.05);
        this.ctx.scale(animScale, animScale);
        this.drawTextOverlay(t.overlay, t.overlaySpacing);
        this.ctx.restore();
    }

    renderLineMode() {
        const l = this.settings.line;
        const g = this.settings.global;
        const { ctx, canvas } = this;
        const { width, height } = canvas;
        const diagonal = Math.sqrt(width * width + height * height);
        const cx = width / 2;
        const cy = height / 2;

        // Use global movement for offset
        const { dx, dy } = this.getMovementOffset();
        const animScale = this.getAnimatedScale();

        // Draw base layer with cutoff clipping
        ctx.save();
        const baseCutoffX = (g.cutoffBase / 100) * width;
        ctx.beginPath();
        ctx.rect(0, 0, baseCutoffX, height);
        ctx.clip();
        ctx.globalAlpha = l.opacityBase / 100;
        ctx.translate(cx, cy);
        this.drawLineLayer(l.periodBase, l.thicknessBase, l.angleBase, diagonal, 0, 0, false, 0, 0, 0);
        ctx.restore();

        // Draw revealing layer with global movement and cutoff clipping
        ctx.save();
        const revealCutoffX = width - (g.cutoffReveal / 100) * width;
        ctx.beginPath();
        ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        ctx.clip();
        ctx.globalAlpha = l.opacityReveal / 100;
        ctx.globalCompositeOperation = g.blendMode;
        ctx.translate(cx + dx, cy + dy);
        ctx.scale(animScale, animScale);

        const curveTime = this.time * l.curveSpeed * 0.1;

        this.drawLineLayer(
            l.periodReveal, l.thicknessReveal, l.angleReveal, diagonal,
            0, 0, l.curveEnabled, l.curveAmplitude, l.curveFrequency, curveTime
        );
        ctx.restore();
    }

    renderShapeMode() {
        const s = this.settings.shape;
        const g = this.settings.global;
        const { ctx, canvas } = this;
        const { width, height } = canvas;

        // Use global movement for offset
        const { dx, dy } = this.getMovementOffset();

        const basePeriod = s.periodBase;
        const compressionFactor = s.compression;

        // The full height of one compressed text block
        const compressedBlockHeight = basePeriod * compressionFactor;

        // Draw base layer with cutoff clipping: vertically compressed repeating text pattern
        ctx.save();
        const baseCutoffX = (g.cutoffBase / 100) * width;
        ctx.beginPath();
        ctx.rect(0, 0, baseCutoffX, height);
        ctx.clip();
        ctx.fillStyle = g.foreground;

        // Measure text at full size
        ctx.font = `bold ${s.fontSize}px ${s.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textWidth = ctx.measureText(s.text).width;
        const textRepeatWidth = textWidth * 1.3;

        // How many vertical repetitions of the compressed text block do we need?
        const numVerticalBlocks = Math.ceil(height / compressedBlockHeight) + 2;

        for (let rep = 0; rep < s.repeatX; rep++) {
            const baseX = (rep - s.repeatX / 2 + 0.5) * textRepeatWidth + width / 2;

            for (let block = -1; block < numVerticalBlocks; block++) {
                const blockY = block * compressedBlockHeight;

                ctx.save();
                // Translate to position, then apply vertical compression
                ctx.translate(baseX, blockY + compressedBlockHeight / 2);
                // Compress vertically: scale Y by 1/compressionFactor
                ctx.scale(1, 1 / compressionFactor);

                // Draw the text at full height - it will be compressed by the scale
                ctx.fillText(s.text, 0, 0);
                ctx.restore();
            }
        }
        ctx.restore();

        // Draw revealing layer with cutoff clipping: horizontal line grating that moves with global movement
        ctx.save();
        const revealCutoffX = width - (g.cutoffReveal / 100) * width;
        ctx.beginPath();
        ctx.rect(revealCutoffX, 0, width - revealCutoffX, height);
        ctx.clip();
        ctx.globalAlpha = s.revealOpacity / 100;
        ctx.fillStyle = g.background;

        const revealPeriod = s.periodReveal;
        const slitWidth = s.slitWidth;
        const opaqueWidth = revealPeriod - slitWidth;

        // Draw opaque bars (the slits between them reveal the base layer)
        // Use dy from global movement for vertical scrolling
        const numBars = Math.ceil(height / revealPeriod) + 2;
        for (let i = -1; i < numBars; i++) {
            const barY = i * revealPeriod + ((dy * 10) % revealPeriod) + slitWidth;
            ctx.fillRect(0, barY, width, opaqueWidth);
        }
        ctx.restore();
    }

    drawLineLayer(period, thickness, angle, size, offsetX, offsetY, curved, curveAmp, curveFreq, curveTime) {
        const { ctx } = this;
        ctx.strokeStyle = this.settings.global.foreground;
        ctx.lineWidth = thickness;

        const halfSize = size / 2 + 100; // Extra padding for rotation
        const baseAngleRad = angle * Math.PI / 180;

        // Calculate number of lines needed
        const numLines = Math.ceil(size * 2 / period) + 10;
        const startOffset = -numLines * period / 2;

        for (let i = 0; i < numLines; i++) {
            const basePos = startOffset + i * period + (offsetY % period);

            ctx.beginPath();

            if (curved) {
                // Draw curved/wavy lines
                const steps = 100;
                for (let s = 0; s <= steps; s++) {
                    const x = -halfSize + (s / steps) * halfSize * 2 + offsetX;

                    // Calculate varying angle based on x position (creates wave moiré)
                    const waveAngle = Math.sin((x / size) * Math.PI * curveFreq + curveTime) * curveAmp;
                    const localAngleRad = (angle + waveAngle) * Math.PI / 180;

                    // Apply shear transformation
                    const y = basePos + Math.tan(localAngleRad) * x;

                    if (s === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
            } else {
                // Draw straight inclined lines
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

    drawPattern(type, color, strokeWidth = 2) {
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
        this.ctx.fillStyle = this.settings.global.foreground;
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
        let x = 0, y = 0;
        for (let i = 0; i < 15; i++) {
            const scale = 5;
            this.ctx.arc(x, y, a * scale, angle, angle + Math.PI / 2);
            const next = a + b;
            a = b;
            b = next;
            angle += Math.PI / 2;
        }
        this.ctx.stroke();
    }

    drawGeometric(type, count, spacing, thickness) {
        this.ctx.strokeStyle = this.settings.global.foreground;
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
                this.ctx.fillStyle = this.settings.global.foreground;
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
        const size = Math.max(this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = this.settings.global.foreground;
        this.ctx.lineWidth = 1;

        switch (type) {
            case 'lines':
                for (let y = -size; y < size; y += spacing) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(-size, y);
                    this.ctx.lineTo(size, y);
                    this.ctx.stroke();
                }
                break;
            case 'verticalLines':
                for (let x = -size; x < size; x += spacing) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, -size);
                    this.ctx.lineTo(x, size);
                    this.ctx.stroke();
                }
                break;
            case 'grid':
                for (let i = -size; i < size; i += spacing) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(i, -size);
                    this.ctx.lineTo(i, size);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(-size, i);
                    this.ctx.lineTo(size, i);
                    this.ctx.stroke();
                }
                break;
            case 'circles':
                for (let r = spacing; r < size; r += spacing) {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, r, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                break;
            case 'text':
                const t = this.settings.text;
                this.ctx.fillStyle = this.settings.global.foreground;
                this.ctx.font = `bold ${t.size}px ${t.font}`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                const tw = this.ctx.measureText(t.text).width + t.spacing * t.text.length;
                const th = t.size * 1.2;
                for (let y = 0; y < t.repeatY; y++) {
                    for (let x = 0; x < t.repeatX; x++) {
                        const px = (x - t.repeatX / 2 + 0.5) * tw;
                        const py = (y - t.repeatY / 2 + 0.5) * th;
                        this.ctx.fillText(t.text, px, py);
                    }
                }
                break;
        }
    }

    applyPreset(preset) {
        const presets = {
            hypnotic: () => {
                this.mode = 'svg';
                document.querySelector('[data-mode="svg"]').click();
                this.settings.svg = { pattern1: 'circles', scale1: 100, rotation1: 0, opacity1: 100, pattern2: 'circles', scale2: 102, rotation2: 0, speed2: 5, opacity2: 100, offsetX2: 0, offsetY2: 0 };
                this.settings.global.blendMode = 'difference';
            },
            optical: () => {
                this.mode = 'geometric';
                document.querySelector('[data-mode="geometric"]').click();
                this.settings.geometric = { shape1: 'radialLines', shape2: 'radialLines', count: 60, thickness: 1, spacing: 15, scaleDiff: 0, offsetX: 5, offsetY: 5 };
                this.settings.movement.speed = 3;
            },
            zen: () => {
                this.mode = 'svg';
                document.querySelector('[data-mode="svg"]').click();
                this.settings.svg = { pattern1: 'waves', scale1: 100, rotation1: 0, opacity1: 100, pattern2: 'waves', scale2: 100, rotation2: 5, speed2: 2, opacity2: 100, offsetX2: 0, offsetY2: 5 };
            },
            chaos: () => {
                this.mode = 'svg';
                document.querySelector('[data-mode="svg"]').click();
                this.settings.svg = { pattern1: 'hexagon', scale1: 80, rotation1: 0, opacity1: 100, pattern2: 'grid', scale2: 90, rotation2: 15, speed2: 15, opacity2: 100, offsetX2: 0, offsetY2: 0 };
                this.settings.global.blendMode = 'exclusion';
            },
            minimal: () => {
                this.mode = 'geometric';
                document.querySelector('[data-mode="geometric"]').click();
                this.settings.geometric = { shape1: 'circles', shape2: 'circles', count: 20, thickness: 1, spacing: 25, scaleDiff: 3, offsetX: 0, offsetY: 0 };
                this.settings.movement.speed = 1;
            },
            psychedelic: () => {
                this.mode = 'svg';
                document.querySelector('[data-mode="svg"]').click();
                this.settings.svg = { pattern1: 'spiral', scale1: 100, rotation1: 0, opacity1: 100, pattern2: 'radial', scale2: 100, rotation2: 0, speed2: 20, opacity2: 100, offsetX2: 0, offsetY2: 0 };
                this.settings.global.blendMode = 'xor';
            },
            lineSpeedup: () => {
                this.mode = 'line';
                document.querySelector('[data-mode="line"]').click();
                this.settings.line = {
                    periodBase: 10, thicknessBase: 4, angleBase: 0, opacityBase: 100,
                    periodReveal: 11, thicknessReveal: 4, angleReveal: 0, opacityReveal: 100,
                    curveEnabled: false, curveAmplitude: 15, curveFrequency: 2, curveSpeed: 10
                };
                this.settings.movement = { type: 'linear', axis: 'y', swingX: 50, swingY: 100, speed: 5, xyRatio: 10 };
                this.settings.global.blendMode = 'difference';
            },
            lineWave: () => {
                this.mode = 'line';
                document.querySelector('[data-mode="line"]').click();
                this.settings.line = {
                    periodBase: 8, thicknessBase: 3, angleBase: 0, opacityBase: 100,
                    periodReveal: 9, thicknessReveal: 3, angleReveal: 0, opacityReveal: 100,
                    curveEnabled: true, curveAmplitude: 20, curveFrequency: 3, curveSpeed: 15
                };
                this.settings.movement = { type: 'linear', axis: 'y', swingX: 50, swingY: 100, speed: 8, xyRatio: 10 };
                this.settings.global.blendMode = 'difference';
            },
            lineTilt: () => {
                this.mode = 'line';
                document.querySelector('[data-mode="line"]').click();
                this.settings.line = {
                    periodBase: 12, thicknessBase: 5, angleBase: 10, opacityBase: 100,
                    periodReveal: 12, thicknessReveal: 5, angleReveal: 10, opacityReveal: 100,
                    curveEnabled: false, curveAmplitude: 15, curveFrequency: 2, curveSpeed: 10
                };
                this.settings.movement = { type: 'swing', axis: 'both', swingX: 30, swingY: 30, speed: 8, xyRatio: 10 };
                this.settings.global.blendMode = 'difference';
            },
            shapeMagnify: () => {
                this.mode = 'shape';
                document.querySelector('[data-mode="shape"]').click();
                this.settings.shape = {
                    text: 'HELLO', font: 'Arial Black', fontSize: 80,
                    periodBase: 10, compression: 10, repeatX: 3,
                    periodReveal: 11, slitWidth: 2, revealOpacity: 100
                };
                this.settings.movement = { type: 'linear', axis: 'y', swingX: 50, swingY: 100, speed: 8, xyRatio: 10 };
            }
        };
        if (presets[preset]) presets[preset]();
    }

    exportPng() {
        const link = document.createElement('a');
        link.download = 'moire-pattern.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    reset() {
        this.settings = this.getDefaultSettings();
        location.reload();
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => new MoireStudio());
