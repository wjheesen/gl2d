import Template from 'gulp-structify/template';
import ColorF from './colorf';
import { randomInt, ArgbRegex, pad } from "./util"

/**
  * An 8-bit (r,g,b,a) color.
  */
class Color extends Template<Uint8Array>{
    /**
     * The red component of this Color.
     */
    r: number;
    /**
     * The green component of this Color.
     */
    g: number;
    /**
     * The blue component of this Color.
     */
    b: number;
    /**
     * The alpha component of this Color.
     */
    a: number;

    /**
     * Checks if this Color is fully opaque. 
     */
    isOpaque() {
        return this.a === 0xff;
    }

    /**
     * Checks if this Color is fully transparent.
     */
    isTransparent() {
        return this.a === 0;
    }

    /**
      * Randomly sets the (r,g,b) components of this color.
      */
    setRandom() {
        this.r = randomInt(0, 0xff);
        this.g = randomInt(0, 0xff);
        this.b = randomInt(0, 0xff);
    }

    /**
    * Extracts the (r,g,b,a) components of the specified ColorF into this color.
    */
    setFromColorF(src: ColorF) {
        this.r = src.r * 0xff;
        this.g = src.g * 0xff;
        this.b = src.b * 0xff;
        this.a = src.a * 0xff;
    }

    /**
     * Extracts the (r,g,b,a) components of the specified ARGB string into this Color.
     * @param argb hexadecimal string of the form #aarrggbb.
     */
    setFromArgbString(argb: string) {
        let result = ArgbRegex.exec(argb);
        this.a = parseInt(result[1], 16);
        this.r = parseInt(result[2], 16);
        this.g = parseInt(result[3], 16);
        this.b = parseInt(result[4], 16);
    }

    /**
     * Creates an ARGB string from this Color's (r,g,b,a) components.
     * @returns string of the form #aarrggbb
     */
    toArgbString(this: Color) {
        let r = pad(this.r.toString(16)); // rr
        let g = pad(this.g.toString(16)); // gg
        let b = pad(this.b.toString(16)); // bb
        let a = pad(this.a.toString(16)); // aa
        return '#' + a + r + g + b; // #aarrggbb
    }

    /**
     * Extracts the (r,g,b,a) components of the specified RGBA int into this color.
     * @param rgba integer of the form 0xrrggbbaa.
     */
    setFromRgbaInt(rgba: number) {
        this.r = (rgba >> 24) & 0xff;
        this.g = (rgba >> 16) & 0xff;
        this.b = (rgba >> 8) & 0xff;
        this.a = (rgba >> 0) & 0xff;
    }

    /**
     * Creates an RGBA int with this Color's (r,g,b,a) components.
     * @returns int of the form 0xrrggbbaa
     */
    toRgbaInt() {
        let r = this.r << 24;
        let g = this.g << 16;
        let b = this.b << 8;
        let a = this.a << 0;
        return (r | g | b | a) >>> 0; // Convert to unsigned
    }

    /**
     * Blends the source color into this color using (src.alpha, 1-src.alpha) blend mode.
     */
    blend(src: Color) {
        // Compute alpha and alpha inverse
        let alpha = src.a + 1, invAlpha = 256 - src.a;
        // Compute rgba components of result
        this.r = (alpha * src.r + invAlpha * this.r) >> 8; // divide by 2^8
        this.g = (alpha * src.g + invAlpha * this.g) >> 8;
        this.b = (alpha * src.b + invAlpha * this.b) >> 8;
    }
}