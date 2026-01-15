import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    RangeControl,
    TextControl,
    TextareaControl,
    ToggleControl,
    ColorPicker,
    Button,
    ButtonGroup,
    __experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import MoireCanvas from './components/MoireCanvas';

export default function Edit({ attributes, setAttributes }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const moireRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    const {
        aspectRatio,
        mode,
        // SVG settings
        svgPattern1, svgScale1, svgRotation1, svgOpacity1, svgStrokeWidth1, svgCustom1,
        svgPattern2, svgScale2, svgRotation2, svgSpeed2, svgOpacity2, svgStrokeWidth2, svgOffsetX2, svgOffsetY2, svgCustom2,
        // Geometric settings
        geoShape1, geoShape2, geoCount, geoThickness, geoSpacing, geoScaleDiff, geoOffsetX, geoOffsetY, geoRotationSpeed,
        // Text settings
        textContent, textFont, textSize, textSpacing, textRepeatX, textRepeatY,
        textOverlay, textOverlaySpacing, textOffsetX, textOffsetY, textRotationSpeed,
        // Line settings
        linePeriodBase, lineThicknessBase, lineAngleBase, lineOpacityBase,
        linePeriodReveal, lineThicknessReveal, lineAngleReveal, lineOpacityReveal,
        lineCurveEnabled, lineCurveAmplitude, lineCurveFrequency, lineCurveSpeed, lineRotationSpeed,
        // Shape settings
        shapeText, shapeFont, shapeFontSize, shapePeriodBase, shapeCompression, shapeRepeatX,
        shapePeriodReveal, shapeSlitWidth, shapeRevealOpacity, shapeRotationSpeed,
        // Movement settings
        movementType, moveAxis, swingX, swingY, moveSpeed, xyRatio,
        // Scale settings
        scaleAnimEnabled, scaleMin, scaleMax, scaleSpeed,
        // Layer clipping
        cutoffBase, cutoffReveal,
        // Global settings
        foregroundColor, backgroundColor, blendMode, animationEnabled, reverseDirection, canvasRotation,
    } = attributes;

    // Build settings object for canvas
    const settings = {
        mode,
        svgPattern1, svgScale1, svgRotation1, svgOpacity1, svgStrokeWidth1, svgCustom1,
        svgPattern2, svgScale2, svgRotation2, svgSpeed2, svgOpacity2, svgStrokeWidth2, svgOffsetX2, svgOffsetY2, svgCustom2,
        geoShape1, geoShape2, geoCount, geoThickness, geoSpacing, geoScaleDiff, geoOffsetX, geoOffsetY, geoRotationSpeed,
        textContent, textFont, textSize, textSpacing, textRepeatX, textRepeatY,
        textOverlay, textOverlaySpacing, textOffsetX, textOffsetY, textRotationSpeed,
        linePeriodBase, lineThicknessBase, lineAngleBase, lineOpacityBase,
        linePeriodReveal, lineThicknessReveal, lineAngleReveal, lineOpacityReveal,
        lineCurveEnabled, lineCurveAmplitude, lineCurveFrequency, lineCurveSpeed, lineRotationSpeed,
        shapeText, shapeFont, shapeFontSize, shapePeriodBase, shapeCompression, shapeRepeatX,
        shapePeriodReveal, shapeSlitWidth, shapeRevealOpacity, shapeRotationSpeed,
        movementType, moveAxis, swingX, swingY, moveSpeed, xyRatio,
        scaleAnimEnabled, scaleMin, scaleMax, scaleSpeed,
        cutoffBase, cutoffReveal,
        foregroundColor, backgroundColor, blendMode, animationEnabled, reverseDirection, canvasRotation,
    };

    // Handle resize observer
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width } = entry.contentRect;
                let height;
                if (aspectRatio && aspectRatio !== '' && !isNaN(parseFloat(aspectRatio))) {
                    height = width / parseFloat(aspectRatio);
                } else {
                    height = entry.contentRect.height || 400;
                }
                setContainerSize({ width, height });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [aspectRatio]);

    // Effect 1: Initialize canvas and handle lifecycle
    useEffect(() => {
        const canvas = canvasRef.current;
        // If not ready, skip
        if (!canvas || containerSize.width === 0) return;

        // CRITICAL: If instance exists but points to a DIFFERENT canvas element (React replaced DOM),
        // we must destroy the old one and create a new one.
        if (moireRef.current && moireRef.current.canvas !== canvas) {
            moireRef.current.stop();
            moireRef.current = null;
        }

        // Initialize if needed
        if (!moireRef.current) {
            moireRef.current = new MoireCanvas(canvas, settings);
            moireRef.current.resize(containerSize.width, containerSize.height);
            moireRef.current.start();
        }
    }); // No dependency array: Check on EVERY render to catch DOM replacements

    // Effect 2: Cleanup on unmount only
    useEffect(() => {
        return () => {
            if (moireRef.current) {
                moireRef.current.stop();
                moireRef.current = null;
            }
        };
    }, []);

    // Effect 3: Update settings (Live)
    useEffect(() => {
        if (moireRef.current) {
            moireRef.current.updateSettings(settings);
        }
    }, [settings]); // Depend on the object itself (re-created on render is fine, updateSettings is cheap)

    // Effect 4: Handle Resize
    useEffect(() => {
        if (moireRef.current && containerSize.width > 0) {
            moireRef.current.resize(containerSize.width, containerSize.height);
        }
    }, [containerSize]);

    // Calculate container style
    const containerStyle = {
        position: 'relative',
        width: '100%',
    };

    if (aspectRatio && aspectRatio !== '' && !isNaN(parseFloat(aspectRatio))) {
        containerStyle.aspectRatio = aspectRatio;
    } else {
        containerStyle.minHeight = '200px';
    }

    const blockProps = useBlockProps({
        ref: containerRef,
        style: containerStyle,
    });

    // Pattern options
    const svgPatternOptions = [
        { label: 'Concentric Circles', value: 'circles' },
        { label: 'Spiral', value: 'spiral' },
        { label: 'Radial Lines', value: 'radial' },
        { label: 'Grid', value: 'grid' },
        { label: 'Hexagonal', value: 'hexagon' },
        { label: 'Waves', value: 'waves' },
        { label: 'Op-Art Checkers', value: 'checkers' },
        { label: 'Fibonacci Spiral', value: 'fibonacci' },
        { label: 'Custom SVG', value: 'custom' },
    ];

    const geoShapeOptions = [
        { label: 'Concentric Circles', value: 'circles' },
        { label: 'Radial Lines', value: 'radialLines' },
        { label: 'Rectangular Grid', value: 'rectangularGrid' },
        { label: 'Hexagonal Grid', value: 'hexGrid' },
        { label: 'Triangle Pattern', value: 'triangles' },
        { label: 'Dot Matrix', value: 'dots' },
    ];

    const fontOptions = [
        { label: 'Inter', value: 'Inter' },
        { label: 'Arial Black', value: 'Arial Black' },
        { label: 'Impact', value: 'Impact' },
        { label: 'Georgia', value: 'Georgia' },
        { label: 'Courier New', value: 'Courier New' },
        { label: 'Times New Roman', value: 'Times New Roman' },
    ];

    const movementOptions = [
        { label: 'Rotation Only', value: 'rotation' },
        { label: 'Swing (Oscillate)', value: 'swing' },
        { label: 'Linear Movement', value: 'linear' },
        { label: 'Circular Path', value: 'circular' },
        { label: 'Lissajous Curve', value: 'lissajous' },
    ];

    const axisOptions = [
        { label: 'Both X & Y', value: 'both' },
        { label: 'X Only', value: 'x' },
        { label: 'Y Only', value: 'y' },
    ];

    const blendModeOptions = [
        { label: 'Normal', value: 'source-over' },
        { label: 'Multiply', value: 'multiply' },
        { label: 'Screen', value: 'screen' },
        { label: 'Overlay', value: 'overlay' },
        { label: 'Difference', value: 'difference' },
        { label: 'Exclusion', value: 'exclusion' },
        { label: 'XOR', value: 'xor' },
    ];

    const textOverlayOptions = [
        { label: 'Same Text', value: 'text' },
        { label: 'Horizontal Lines', value: 'lines' },
        { label: 'Vertical Lines', value: 'verticalLines' },
        { label: 'Grid', value: 'grid' },
        { label: 'Circles', value: 'circles' },
    ];

    // Preset functions
    const applyPreset = (preset) => {
        const presets = {
            hypnotic: {
                mode: 'svg',
                svgPattern1: 'circles', svgScale1: 100, svgRotation1: 0, svgOpacity1: 100,
                svgPattern2: 'circles', svgScale2: 102, svgRotation2: 0, svgSpeed2: 5, svgOpacity2: 100,
                blendMode: 'difference',
            },
            optical: {
                mode: 'geometric',
                geoShape1: 'radialLines', geoShape2: 'radialLines', geoCount: 60, geoThickness: 1, geoSpacing: 15,
                geoScaleDiff: 0, geoOffsetX: 5, geoOffsetY: 5,
                moveSpeed: 3,
            },
            zen: {
                mode: 'svg',
                svgPattern1: 'waves', svgScale1: 100, svgRotation1: 0, svgOpacity1: 100,
                svgPattern2: 'waves', svgScale2: 100, svgRotation2: 5, svgSpeed2: 2, svgOpacity2: 100,
                svgOffsetX2: 0, svgOffsetY2: 5,
            },
            chaos: {
                mode: 'svg',
                svgPattern1: 'hexagon', svgScale1: 80, svgRotation1: 0, svgOpacity1: 100,
                svgPattern2: 'grid', svgScale2: 90, svgRotation2: 15, svgSpeed2: 15, svgOpacity2: 100,
                blendMode: 'exclusion',
            },
            minimal: {
                mode: 'geometric',
                geoShape1: 'circles', geoShape2: 'circles', geoCount: 20, geoThickness: 1, geoSpacing: 25,
                geoScaleDiff: 3, geoOffsetX: 0, geoOffsetY: 0,
                moveSpeed: 1,
            },
            psychedelic: {
                mode: 'svg',
                svgPattern1: 'spiral', svgScale1: 100, svgRotation1: 0, svgOpacity1: 100,
                svgPattern2: 'radial', svgScale2: 100, svgRotation2: 0, svgSpeed2: 20, svgOpacity2: 100,
                blendMode: 'xor',
            },
            lineSpeedup: {
                mode: 'line',
                linePeriodBase: 10, lineThicknessBase: 4, lineAngleBase: 0, lineOpacityBase: 100,
                linePeriodReveal: 11, lineThicknessReveal: 4, lineAngleReveal: 0, lineOpacityReveal: 100,
                lineCurveEnabled: false,
                movementType: 'linear', moveAxis: 'y', swingX: 50, swingY: 100, moveSpeed: 5,
                blendMode: 'difference',
            },
            lineWave: {
                mode: 'line',
                linePeriodBase: 8, lineThicknessBase: 3, lineAngleBase: 0, lineOpacityBase: 100,
                linePeriodReveal: 9, lineThicknessReveal: 3, lineAngleReveal: 0, lineOpacityReveal: 100,
                lineCurveEnabled: true, lineCurveAmplitude: 20, lineCurveFrequency: 3, lineCurveSpeed: 15,
                movementType: 'linear', moveAxis: 'y', swingX: 50, swingY: 100, moveSpeed: 8,
                blendMode: 'difference',
            },
            lineTilt: {
                mode: 'line',
                linePeriodBase: 12, lineThicknessBase: 5, lineAngleBase: 10, lineOpacityBase: 100,
                linePeriodReveal: 12, lineThicknessReveal: 5, lineAngleReveal: 10, lineOpacityReveal: 100,
                lineCurveEnabled: false,
                movementType: 'swing', moveAxis: 'both', swingX: 30, swingY: 30, moveSpeed: 8,
                blendMode: 'difference',
            },
            shapeMagnify: {
                mode: 'shape',
                shapeText: 'HELLO', shapeFont: 'Arial Black', shapeFontSize: 80,
                shapePeriodBase: 10, shapeCompression: 10, shapeRepeatX: 3,
                shapePeriodReveal: 11, shapeSlitWidth: 2, shapeRevealOpacity: 100,
                movementType: 'linear', moveAxis: 'y', swingX: 50, swingY: 100, moveSpeed: 8,
            },
        };

        if (presets[preset]) {
            setAttributes(presets[preset]);
        }
    };

    return (
        <>
            <InspectorControls>
                {/* Aspect Ratio */}
                <PanelBody title={__('Layout', 'moire-block')} initialOpen={true}>
                    <TextControl
                        label={__('Aspect Ratio', 'moire-block')}
                        help={__('Enter a number (e.g., 1 for square, 1.5 for wide). Leave empty for auto height based on content.', 'moire-block')}
                        value={aspectRatio}
                        onChange={(value) => setAttributes({ aspectRatio: value })}
                    />
                </PanelBody>

                {/* Mode Selector */}
                <PanelBody title={__('Mode', 'moire-block')} initialOpen={true}>
                    <ButtonGroup style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        <Button
                            variant={mode === 'svg' ? 'primary' : 'secondary'}
                            onClick={() => setAttributes({ mode: 'svg' })}
                        >
                            SVG Overlay
                        </Button>
                        <Button
                            variant={mode === 'geometric' ? 'primary' : 'secondary'}
                            onClick={() => setAttributes({ mode: 'geometric' })}
                        >
                            Geometric
                        </Button>
                        <Button
                            variant={mode === 'text' ? 'primary' : 'secondary'}
                            onClick={() => setAttributes({ mode: 'text' })}
                        >
                            Text Moiré
                        </Button>
                        <Button
                            variant={mode === 'line' ? 'primary' : 'secondary'}
                            onClick={() => setAttributes({ mode: 'line' })}
                        >
                            Line Moiré
                        </Button>
                        <Button
                            variant={mode === 'shape' ? 'primary' : 'secondary'}
                            onClick={() => setAttributes({ mode: 'shape' })}
                        >
                            Shape Moiré
                        </Button>
                    </ButtonGroup>
                </PanelBody>

                {/* SVG Mode Controls */}
                {mode === 'svg' && (
                    <>
                        <PanelBody title={__('Layer 1 (Base)', 'moire-block')} initialOpen={false}>
                            <SelectControl
                                label={__('Pattern', 'moire-block')}
                                value={svgPattern1}
                                options={svgPatternOptions}
                                onChange={(value) => setAttributes({ svgPattern1: value })}
                            />
                            {svgPattern1 === 'custom' && (
                                <TextareaControl
                                    label={__('Custom SVG Code', 'moire-block')}
                                    help={__('Paste full <svg> code here', 'moire-block')}
                                    value={svgCustom1}
                                    onChange={(value) => setAttributes({ svgCustom1: value })}
                                    rows={4}
                                />
                            )}
                            <RangeControl
                                label={__('Scale', 'moire-block')}
                                value={svgScale1}
                                onChange={(value) => setAttributes({ svgScale1: value })}
                                min={20}
                                max={300}
                            />
                            <RangeControl
                                label={__('Rotation', 'moire-block')}
                                value={svgRotation1}
                                onChange={(value) => setAttributes({ svgRotation1: value })}
                                min={0}
                                max={360}
                            />
                            <RangeControl
                                label={__('Opacity', 'moire-block')}
                                value={svgOpacity1}
                                onChange={(value) => setAttributes({ svgOpacity1: value })}
                                min={0}
                                max={100}
                            />
                            <RangeControl
                                label={__('Stroke Width', 'moire-block')}
                                value={svgStrokeWidth1}
                                onChange={(value) => setAttributes({ svgStrokeWidth1: value })}
                                min={1}
                                max={20}
                            />
                        </PanelBody>
                        <PanelBody title={__('Layer 2 (Overlay)', 'moire-block')} initialOpen={false}>
                            <SelectControl
                                label={__('Pattern', 'moire-block')}
                                value={svgPattern2}
                                options={svgPatternOptions}
                                onChange={(value) => setAttributes({ svgPattern2: value })}
                            />
                            {svgPattern2 === 'custom' && (
                                <TextareaControl
                                    label={__('Custom SVG Code', 'moire-block')}
                                    help={__('Paste full <svg> code here', 'moire-block')}
                                    value={svgCustom2}
                                    onChange={(value) => setAttributes({ svgCustom2: value })}
                                    rows={4}
                                />
                            )}
                            <RangeControl
                                label={__('Scale', 'moire-block')}
                                value={svgScale2}
                                onChange={(value) => setAttributes({ svgScale2: value })}
                                min={20}
                                max={300}
                            />
                            <RangeControl
                                label={__('Rotation', 'moire-block')}
                                value={svgRotation2}
                                onChange={(value) => setAttributes({ svgRotation2: value })}
                                min={0}
                                max={360}
                            />
                            <RangeControl
                                label={__('Rotation Speed', 'moire-block')}
                                value={svgSpeed2}
                                onChange={(value) => setAttributes({ svgSpeed2: value })}
                                min={0}
                                max={50}
                                step={0.1}
                            />
                            <RangeControl
                                label={__('Opacity', 'moire-block')}
                                value={svgOpacity2}
                                onChange={(value) => setAttributes({ svgOpacity2: value })}
                                min={0}
                                max={100}
                            />
                            <RangeControl
                                label={__('Stroke Width', 'moire-block')}
                                value={svgStrokeWidth2}
                                onChange={(value) => setAttributes({ svgStrokeWidth2: value })}
                                min={1}
                                max={20}
                            />
                            <RangeControl
                                label={__('Offset X', 'moire-block')}
                                value={svgOffsetX2}
                                onChange={(value) => setAttributes({ svgOffsetX2: value })}
                                min={-200}
                                max={200}
                            />
                            <RangeControl
                                label={__('Offset Y', 'moire-block')}
                                value={svgOffsetY2}
                                onChange={(value) => setAttributes({ svgOffsetY2: value })}
                                min={-200}
                                max={200}
                            />
                        </PanelBody>
                    </>
                )}

                {/* Geometric Mode Controls */}
                {mode === 'geometric' && (
                    <>
                        <PanelBody title={__('Shape Settings', 'moire-block')} initialOpen={false}>
                            <SelectControl
                                label={__('Shape Type', 'moire-block')}
                                value={geoShape1}
                                options={geoShapeOptions}
                                onChange={(value) => setAttributes({ geoShape1: value })}
                            />
                            <RangeControl
                                label={__('Line Count', 'moire-block')}
                                value={geoCount}
                                onChange={(value) => setAttributes({ geoCount: value })}
                                min={5}
                                max={100}
                            />
                            <RangeControl
                                label={__('Line Thickness', 'moire-block')}
                                value={geoThickness}
                                onChange={(value) => setAttributes({ geoThickness: value })}
                                min={1}
                                max={10}
                            />
                            <RangeControl
                                label={__('Spacing', 'moire-block')}
                                value={geoSpacing}
                                onChange={(value) => setAttributes({ geoSpacing: value })}
                                min={5}
                                max={50}
                            />
                        </PanelBody>
                        <PanelBody title={__('Overlay Layer', 'moire-block')} initialOpen={false}>
                            <SelectControl
                                label={__('Overlay Shape', 'moire-block')}
                                value={geoShape2}
                                options={geoShapeOptions}
                                onChange={(value) => setAttributes({ geoShape2: value })}
                            />
                            <RangeControl
                                label={__('Scale Difference', 'moire-block')}
                                value={geoScaleDiff}
                                onChange={(value) => setAttributes({ geoScaleDiff: value })}
                                min={-20}
                                max={20}
                            />
                            <RangeControl
                                label={__('Offset X', 'moire-block')}
                                value={geoOffsetX}
                                onChange={(value) => setAttributes({ geoOffsetX: value })}
                                min={-100}
                                max={100}
                            />
                            <RangeControl
                                label={__('Offset Y', 'moire-block')}
                                value={geoOffsetY}
                                onChange={(value) => setAttributes({ geoOffsetY: value })}
                                min={-100}
                                max={100}
                            />
                            <RangeControl
                                label={__('Rotation Speed', 'moire-block')}
                                value={geoRotationSpeed}
                                onChange={(value) => setAttributes({ geoRotationSpeed: value })}
                                min={0}
                                max={50}
                                step={0.1}
                            />
                        </PanelBody>
                    </>
                )}

                {/* Text Mode Controls */}
                {mode === 'text' && (
                    <>
                        <PanelBody title={__('Text Settings', 'moire-block')} initialOpen={false}>
                            <TextControl
                                label={__('Text', 'moire-block')}
                                value={textContent}
                                onChange={(value) => setAttributes({ textContent: value })}
                            />
                            <SelectControl
                                label={__('Font', 'moire-block')}
                                value={textFont}
                                options={fontOptions}
                                onChange={(value) => setAttributes({ textFont: value })}
                            />
                            <RangeControl
                                label={__('Font Size', 'moire-block')}
                                value={textSize}
                                onChange={(value) => setAttributes({ textSize: value })}
                                min={20}
                                max={200}
                            />
                            <RangeControl
                                label={__('Letter Spacing', 'moire-block')}
                                value={textSpacing}
                                onChange={(value) => setAttributes({ textSpacing: value })}
                                min={-20}
                                max={50}
                            />
                            <RangeControl
                                label={__('Repeat X', 'moire-block')}
                                value={textRepeatX}
                                onChange={(value) => setAttributes({ textRepeatX: value })}
                                min={1}
                                max={20}
                            />
                            <RangeControl
                                label={__('Repeat Y', 'moire-block')}
                                value={textRepeatY}
                                onChange={(value) => setAttributes({ textRepeatY: value })}
                                min={1}
                                max={20}
                            />
                        </PanelBody>
                        <PanelBody title={__('Overlay', 'moire-block')} initialOpen={false}>
                            <SelectControl
                                label={__('Overlay Type', 'moire-block')}
                                value={textOverlay}
                                options={textOverlayOptions}
                                onChange={(value) => setAttributes({ textOverlay: value })}
                            />
                            <RangeControl
                                label={__('Overlay Spacing', 'moire-block')}
                                value={textOverlaySpacing}
                                onChange={(value) => setAttributes({ textOverlaySpacing: value })}
                                min={2}
                                max={30}
                            />
                            <RangeControl
                                label={__('Offset X', 'moire-block')}
                                value={textOffsetX}
                                onChange={(value) => setAttributes({ textOffsetX: value })}
                                min={-100}
                                max={100}
                            />
                            <RangeControl
                                label={__('Offset Y', 'moire-block')}
                                value={textOffsetY}
                                onChange={(value) => setAttributes({ textOffsetY: value })}
                                min={-100}
                                max={100}
                            />
                            <RangeControl
                                label={__('Rotation Speed', 'moire-block')}
                                value={textRotationSpeed}
                                onChange={(value) => setAttributes({ textRotationSpeed: value })}
                                min={0}
                                max={50}
                                step={0.1}
                            />
                        </PanelBody>
                    </>
                )}

                {/* Line Mode Controls */}
                {mode === 'line' && (
                    <>
                        <PanelBody title={__('Base Layer', 'moire-block')} initialOpen={false}>
                            <RangeControl
                                label={__('Period', 'moire-block')}
                                value={linePeriodBase}
                                onChange={(value) => setAttributes({ linePeriodBase: value })}
                                min={2}
                                max={40}
                            />
                            <RangeControl
                                label={__('Line Thickness', 'moire-block')}
                                value={lineThicknessBase}
                                onChange={(value) => setAttributes({ lineThicknessBase: value })}
                                min={1}
                                max={20}
                            />
                            <RangeControl
                                label={__('Angle', 'moire-block')}
                                value={lineAngleBase}
                                onChange={(value) => setAttributes({ lineAngleBase: value })}
                                min={-45}
                                max={45}
                            />
                            <RangeControl
                                label={__('Opacity', 'moire-block')}
                                value={lineOpacityBase}
                                onChange={(value) => setAttributes({ lineOpacityBase: value })}
                                min={0}
                                max={100}
                            />
                        </PanelBody>
                        <PanelBody title={__('Revealing Layer', 'moire-block')} initialOpen={false}>
                            <RangeControl
                                label={__('Period', 'moire-block')}
                                value={linePeriodReveal}
                                onChange={(value) => setAttributes({ linePeriodReveal: value })}
                                min={2}
                                max={40}
                            />
                            <RangeControl
                                label={__('Line Thickness', 'moire-block')}
                                value={lineThicknessReveal}
                                onChange={(value) => setAttributes({ lineThicknessReveal: value })}
                                min={1}
                                max={20}
                            />
                            <RangeControl
                                label={__('Angle', 'moire-block')}
                                value={lineAngleReveal}
                                onChange={(value) => setAttributes({ lineAngleReveal: value })}
                                min={-45}
                                max={45}
                            />
                            <RangeControl
                                label={__('Opacity', 'moire-block')}
                                value={lineOpacityReveal}
                                onChange={(value) => setAttributes({ lineOpacityReveal: value })}
                                min={0}
                                max={100}
                            />
                        </PanelBody>
                        <PanelBody title={__('Curve Effect', 'moire-block')} initialOpen={false}>
                            <ToggleControl
                                label={__('Enable Wave Curves', 'moire-block')}
                                checked={lineCurveEnabled}
                                onChange={(value) => setAttributes({ lineCurveEnabled: value })}
                            />
                            <RangeControl
                                label={__('Wave Amplitude', 'moire-block')}
                                value={lineCurveAmplitude}
                                onChange={(value) => setAttributes({ lineCurveAmplitude: value })}
                                min={1}
                                max={40}
                            />
                            <RangeControl
                                label={__('Wave Frequency', 'moire-block')}
                                value={lineCurveFrequency}
                                onChange={(value) => setAttributes({ lineCurveFrequency: value })}
                                min={1}
                                max={10}
                            />
                            <RangeControl
                                label={__('Wave Speed', 'moire-block')}
                                value={lineCurveSpeed}
                                onChange={(value) => setAttributes({ lineCurveSpeed: value })}
                                min={0}
                                max={50}
                                step={0.1}
                            />
                            <RangeControl
                                label={__('Rotation Speed', 'moire-block')}
                                value={lineRotationSpeed}
                                onChange={(value) => setAttributes({ lineRotationSpeed: value })}
                                min={0}
                                max={50}
                                step={0.1}
                            />
                        </PanelBody>
                    </>
                )}

                {/* Shape Mode Controls */}
                {mode === 'shape' && (
                    <>
                        <PanelBody title={__('Hidden Shape (Base Layer)', 'moire-block')} initialOpen={false}>
                            <TextControl
                                label={__('Text to Reveal', 'moire-block')}
                                value={shapeText}
                                onChange={(value) => setAttributes({ shapeText: value })}
                            />
                            <SelectControl
                                label={__('Font', 'moire-block')}
                                value={shapeFont}
                                options={fontOptions}
                                onChange={(value) => setAttributes({ shapeFont: value })}
                            />
                            <RangeControl
                                label={__('Font Size', 'moire-block')}
                                value={shapeFontSize}
                                onChange={(value) => setAttributes({ shapeFontSize: value })}
                                min={20}
                                max={200}
                            />
                            <RangeControl
                                label={__('Base Period', 'moire-block')}
                                value={shapePeriodBase}
                                onChange={(value) => setAttributes({ shapePeriodBase: value })}
                                min={2}
                                max={30}
                            />
                            <RangeControl
                                label={__('Vertical Compression', 'moire-block')}
                                value={shapeCompression}
                                onChange={(value) => setAttributes({ shapeCompression: value })}
                                min={2}
                                max={20}
                            />
                            <RangeControl
                                label={__('Horizontal Repeat', 'moire-block')}
                                value={shapeRepeatX}
                                onChange={(value) => setAttributes({ shapeRepeatX: value })}
                                min={1}
                                max={10}
                            />
                        </PanelBody>
                        <PanelBody title={__('Revealing Layer', 'moire-block')} initialOpen={false}>
                            <RangeControl
                                label={__('Reveal Period', 'moire-block')}
                                value={shapePeriodReveal}
                                onChange={(value) => setAttributes({ shapePeriodReveal: value })}
                                min={2}
                                max={30}
                            />
                            <RangeControl
                                label={__('Slit Width', 'moire-block')}
                                value={shapeSlitWidth}
                                onChange={(value) => setAttributes({ shapeSlitWidth: value })}
                                min={1}
                                max={10}
                            />
                            <RangeControl
                                label={__('Opacity', 'moire-block')}
                                value={shapeRevealOpacity}
                                onChange={(value) => setAttributes({ shapeRevealOpacity: value })}
                                min={0}
                                max={100}
                            />
                            <RangeControl
                                label={__('Rotation Speed', 'moire-block')}
                                value={shapeRotationSpeed}
                                onChange={(value) => setAttributes({ shapeRotationSpeed: value })}
                                min={0}
                                max={50}
                                step={0.1}
                            />
                        </PanelBody>
                    </>
                )}

                {/* Movement Animation */}
                <PanelBody title={__('Movement Animation', 'moire-block')} initialOpen={false}>
                    <SelectControl
                        label={__('Movement Type', 'moire-block')}
                        value={movementType}
                        options={movementOptions}
                        onChange={(value) => setAttributes({ movementType: value })}
                    />
                    <SelectControl
                        label={__('Move Axis', 'moire-block')}
                        value={moveAxis}
                        options={axisOptions}
                        onChange={(value) => setAttributes({ moveAxis: value })}
                    />
                    <RangeControl
                        label={__('Swing X Distance', 'moire-block')}
                        value={swingX}
                        onChange={(value) => setAttributes({ swingX: value })}
                        min={0}
                        max={300}
                    />
                    <RangeControl
                        label={__('Swing Y Distance', 'moire-block')}
                        value={swingY}
                        onChange={(value) => setAttributes({ swingY: value })}
                        min={0}
                        max={300}
                    />
                    <RangeControl
                        label={__('Movement Speed', 'moire-block')}
                        value={moveSpeed}
                        onChange={(value) => setAttributes({ moveSpeed: value })}
                        min={0}
                        max={100}
                        step={0.1}
                    />
                    <RangeControl
                        label={__('X/Y Speed Ratio', 'moire-block')}
                        value={xyRatio}
                        onChange={(value) => setAttributes({ xyRatio: value })}
                        min={0.1}
                        max={30}
                        step={0.1}
                    />
                </PanelBody>

                {/* Scale Animation */}
                <PanelBody title={__('Scale Animation', 'moire-block')} initialOpen={false}>
                    <ToggleControl
                        label={__('Animate Scale', 'moire-block')}
                        checked={scaleAnimEnabled}
                        onChange={(value) => setAttributes({ scaleAnimEnabled: value })}
                    />
                    <RangeControl
                        label={__('Scale Min', 'moire-block')}
                        value={scaleMin}
                        onChange={(value) => setAttributes({ scaleMin: value })}
                        min={10}
                        max={100}
                    />
                    <RangeControl
                        label={__('Scale Max', 'moire-block')}
                        value={scaleMax}
                        onChange={(value) => setAttributes({ scaleMax: value })}
                        min={100}
                        max={300}
                    />
                    <RangeControl
                        label={__('Scale Speed', 'moire-block')}
                        value={scaleSpeed}
                        onChange={(value) => setAttributes({ scaleSpeed: value })}
                        min={0}
                        max={50}
                        step={0.1}
                    />
                </PanelBody>

                {/* Layer Clipping */}
                <PanelBody title={__('Layer Clipping', 'moire-block')} initialOpen={false}>
                    <RangeControl
                        label={__('Base Layer Cutoff', 'moire-block')}
                        value={cutoffBase}
                        onChange={(value) => setAttributes({ cutoffBase: value })}
                        min={0}
                        max={100}
                    />
                    <RangeControl
                        label={__('Reveal Layer Cutoff', 'moire-block')}
                        value={cutoffReveal}
                        onChange={(value) => setAttributes({ cutoffReveal: value })}
                        min={0}
                        max={100}
                    />
                </PanelBody>

                {/* Global Settings */}
                <PanelBody title={__('Global Settings', 'moire-block')} initialOpen={false}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>{__('Foreground Color', 'moire-block')}</label>
                        <ColorPicker
                            color={foregroundColor}
                            onChange={(value) => setAttributes({ foregroundColor: value })}
                            enableAlpha={false}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px' }}>{__('Background Color', 'moire-block')}</label>
                        <ColorPicker
                            color={backgroundColor}
                            onChange={(value) => setAttributes({ backgroundColor: value })}
                            enableAlpha={false}
                        />
                    </div>
                    <SelectControl
                        label={__('Blend Mode', 'moire-block')}
                        value={blendMode}
                        options={blendModeOptions}
                        onChange={(value) => setAttributes({ blendMode: value })}
                    />
                    <RangeControl
                        label={__('Canvas Rotation', 'moire-block')}
                        value={canvasRotation}
                        onChange={(value) => setAttributes({ canvasRotation: value })}
                        min={0}
                        max={360}
                    />
                    <ToggleControl
                        label={__('Animation', 'moire-block')}
                        checked={animationEnabled}
                        onChange={(value) => setAttributes({ animationEnabled: value })}
                    />
                    <ToggleControl
                        label={__('Reverse Direction', 'moire-block')}
                        checked={reverseDirection}
                        onChange={(value) => setAttributes({ reverseDirection: value })}
                    />
                </PanelBody>

                {/* Presets */}
                <PanelBody title={__('Presets', 'moire-block')} initialOpen={false}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        <Button variant="secondary" onClick={() => applyPreset('hypnotic')}>Hypnotic</Button>
                        <Button variant="secondary" onClick={() => applyPreset('optical')}>Op-Art</Button>
                        <Button variant="secondary" onClick={() => applyPreset('zen')}>Zen</Button>
                        <Button variant="secondary" onClick={() => applyPreset('chaos')}>Chaos</Button>
                        <Button variant="secondary" onClick={() => applyPreset('minimal')}>Minimal</Button>
                        <Button variant="secondary" onClick={() => applyPreset('psychedelic')}>Psychedelic</Button>
                        <Button variant="secondary" onClick={() => applyPreset('lineSpeedup')}>Line Speedup</Button>
                        <Button variant="secondary" onClick={() => applyPreset('lineWave')}>Line Wave</Button>
                        <Button variant="secondary" onClick={() => applyPreset('lineTilt')}>Line Tilt</Button>
                        <Button variant="secondary" onClick={() => applyPreset('shapeMagnify')}>Shape Magnify</Button>
                    </div>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0,
                    }}
                />
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <InnerBlocks />
                </div>
            </div>
        </>
    );
}
