function hexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function rgbToHex(r, g, b) {
    return ((Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16);
}

function calcColor(colors, percentage) {
    const numColors = colors.length;
    const rationalColorIndex = (numColors - 1) * percentage;

    const slot = [Math.floor(rationalColorIndex), Math.ceil(rationalColorIndex)];
    colors = [colors[slot[0]], colors[slot[1]]];

    const relativePercentage = percentage % (1 / (numColors - 1));

    colors = colors.map(color => hexToRgb(color))


    const color = {
        r: colors[0].r + (colors[1].r - colors[0].r) * relativePercentage,
        g: colors[0].g + (colors[1].g - colors[0].g) * relativePercentage,
        b: colors[0].b + (colors[1].b - colors[0].b) * relativePercentage
    };


    return rgbToHex(color.r, color.g, color.b)
}


export { hexToRgb, rgbToHex, calcColor };