export const ArgbRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/;

export function pad(str: string) {
    return (str.length == 1) ? '0' + str : str;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



