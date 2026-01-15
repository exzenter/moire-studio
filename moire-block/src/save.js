import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export default function save({ attributes }) {
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

    // Calculate container style
    const containerStyle = {
        position: 'relative',
        width: '100%',
    };

    if (aspectRatio && aspectRatio !== '' && !isNaN(parseFloat(aspectRatio))) {
        containerStyle.aspectRatio = aspectRatio;
    }

    const blockProps = useBlockProps.save({
        style: containerStyle,
        className: 'wp-block-moire-block-moire-group',
    });

    // Build data attributes for frontend script
    const dataAttributes = {
        'data-mode': mode,
        'data-aspect-ratio': aspectRatio,
        // SVG
        'data-svg-pattern1': svgPattern1,
        'data-svg-scale1': svgScale1,
        'data-svg-rotation1': svgRotation1,
        'data-svg-opacity1': svgOpacity1,
        'data-svg-stroke-width1': svgStrokeWidth1,
        'data-svg-pattern2': svgPattern2,
        'data-svg-scale2': svgScale2,
        'data-svg-rotation2': svgRotation2,
        'data-svg-speed2': svgSpeed2,
        'data-svg-opacity2': svgOpacity2,
        'data-svg-stroke-width2': svgStrokeWidth2,
        'data-svg-offset-x2': svgOffsetX2,
        'data-svg-offset-y2': svgOffsetY2,
        // Geometric
        'data-geo-shape1': geoShape1,
        'data-geo-shape2': geoShape2,
        'data-geo-count': geoCount,
        'data-geo-thickness': geoThickness,
        'data-geo-spacing': geoSpacing,
        'data-geo-scale-diff': geoScaleDiff,
        'data-geo-offset-x': geoOffsetX,
        'data-geo-offset-y': geoOffsetY,
        'data-geo-rotation-speed': geoRotationSpeed,
        // Text
        'data-text-content': textContent,
        'data-text-font': textFont,
        'data-text-size': textSize,
        'data-text-spacing': textSpacing,
        'data-text-repeat-x': textRepeatX,
        'data-text-repeat-y': textRepeatY,
        'data-text-overlay': textOverlay,
        'data-text-overlay-spacing': textOverlaySpacing,
        'data-text-offset-x': textOffsetX,
        'data-text-offset-y': textOffsetY,
        'data-text-rotation-speed': textRotationSpeed,
        // Line
        'data-line-period-base': linePeriodBase,
        'data-line-thickness-base': lineThicknessBase,
        'data-line-angle-base': lineAngleBase,
        'data-line-opacity-base': lineOpacityBase,
        'data-line-period-reveal': linePeriodReveal,
        'data-line-thickness-reveal': lineThicknessReveal,
        'data-line-angle-reveal': lineAngleReveal,
        'data-line-opacity-reveal': lineOpacityReveal,
        'data-line-curve-enabled': lineCurveEnabled,
        'data-line-curve-amplitude': lineCurveAmplitude,
        'data-line-curve-frequency': lineCurveFrequency,
        'data-line-curve-speed': lineCurveSpeed,
        'data-line-rotation-speed': lineRotationSpeed,
        // Shape
        'data-shape-text': shapeText,
        'data-shape-font': shapeFont,
        'data-shape-font-size': shapeFontSize,
        'data-shape-period-base': shapePeriodBase,
        'data-shape-compression': shapeCompression,
        'data-shape-repeat-x': shapeRepeatX,
        'data-shape-period-reveal': shapePeriodReveal,
        'data-shape-slit-width': shapeSlitWidth,
        'data-shape-reveal-opacity': shapeRevealOpacity,
        'data-shape-rotation-speed': shapeRotationSpeed,
        // Movement
        'data-movement-type': movementType,
        'data-move-axis': moveAxis,
        'data-swing-x': swingX,
        'data-swing-y': swingY,
        'data-move-speed': moveSpeed,
        'data-xy-ratio': xyRatio,
        // Scale
        'data-scale-anim-enabled': scaleAnimEnabled,
        'data-scale-min': scaleMin,
        'data-scale-max': scaleMax,
        'data-scale-speed': scaleSpeed,
        // Layer clipping
        'data-cutoff-base': cutoffBase,
        'data-cutoff-reveal': cutoffReveal,
        // Global
        'data-foreground-color': foregroundColor,
        'data-background-color': backgroundColor,
        'data-blend-mode': blendMode,
        'data-animation-enabled': animationEnabled,
        'data-reverse-direction': reverseDirection,
        'data-canvas-rotation': canvasRotation,
    };

    return (
        <div {...blockProps} {...dataAttributes}>
            <canvas
                className="moire-block-canvas"
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
                className="moire-block-content"
                style={{
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <InnerBlocks.Content />
            </div>
        </div>
    );
}
