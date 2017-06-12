import { ColorLike } from './color';
import { ArgbRegex, pad } from './util';
import { Template } from 'gulp-structify/template';

/**
 * A 32-bit (r,g,b,a) color.
 */
class ColorF extends Template<Float32Array>{
    /**
     * The red component of this ColorF.
     */
    r: number;
    /**
     * The green component of this ColorF.
     */
    g: number;
    /**
     * The blue component of this ColorF.
     */
    b: number;
    /**
     * The alpha component of this ColorF.
     */
    a: number;

    /**
     * Checks if this ColorF is fully opaque. 
     */
    isOpaque() {
        return this.a === 1;
    }

    /**
     * Checks if this Color is fully transparent.
     */
    isTransparent() {
        return this.a === 0;
    }

    /**
      * Randomly sets the (r,g,b) components of this Color.
      */
    setRandom() {
        this.r = Math.random();
        this.g = Math.random();
        this.b = Math.random();
    }

    /**
     * Extracts the (r,g,b,a) components of the specified Color into this ColorF.
     */
    setFromColor(src: ColorLike){
        this.r = src.r / 0xff;
        this.g = src.g / 0xff;
        this.b = src.b / 0xff;
        this.a = src.a / 0xff;
    }

    /**
     * Extracts the (r,g,b,a) components of the specified ARGB string into this ColorF.
     * @param argb hexadecimal string of the form #aarrggbb.
     */
    setFromArgbString(argb: string) {
        let result = ArgbRegex.exec(argb);
        this.a = parseInt(result[1], 16) / 0xff;
        this.r = parseInt(result[2], 16) / 0xff;
        this.g = parseInt(result[3], 16) / 0xff;
        this.b = parseInt(result[4], 16) / 0xff;
    }

    /**
     * Creates an ARGB string from this specified ColorF's (r,g,b,a) components.
     * @returns string of the form #aarrggbb
     */
    toArgbString() {
        let r = pad((this.r * 0xff).toString(16)); // rr
        let g = pad((this.g * 0xff).toString(16)); // gg
        let b = pad((this.b * 0xff).toString(16)); // bb
        let a = pad((this.a * 0xff).toString(16)); // aa
        return '#' + a + r + g + b; // #aarrggbb
    }

    /**
     * Extracts the (r,g,b,a) components of the specified RGBA int into this ColorF.
     * @param rgba integer of the form 0xrrggbbaa.
     */
    setFromRgbaInt(rgba: number) {
        this.r = ((rgba >> 24) & 0xff) / 0xff;
        this.g = ((rgba >> 16) & 0xff) / 0xff;
        this.b = ((rgba >> 8) & 0xff) / 0xff;
        this.a = ((rgba >> 0) & 0xff) / 0xff;
    }

    /**
     * Creates an RGBA int with values extracted from this ColorF.
     * @returns int of the form 0xrrggbbaa
     */
    toRgbaInt() {
        let r = (this.r * 0xff) << 24;
        let g = (this.g * 0xff) << 16;
        let b = (this.b * 0xff) << 8;
        let a = (this.a * 0xff) << 0;
        return (r | g | b | a) >>> 0; // Convert to unsigned
    }

    /**
     * Premultiplies the (r,g,b) components of this ColorF by it's alpha component.
     */
    premultiplyAlpha() {
        let a = this.a;
        this.r *= a;
        this.g *= a;
        this.b *= a;
    }
}