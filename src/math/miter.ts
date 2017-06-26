import { Vec2, Vec2Like } from '../struct/vec2';

/**
 * Measures the miter vector needed to join the two specified lines. Assumes the lines are measured from points listed in CCW order.
 * @param line1 The nonzero vector from the start of the first line to the end of the first line. Will not be modified.
 * @param line2 The nonzero vector from the start of the second line to the end of the second line. Will not be modified.
 * @param lineWidth The width of the second line (or half the width, if joining at the center of the lines).
 * @param miterLimit The maximum allowable miter length before a bevel is applied. Usually some multiple of lineWidth.
 */
export function measureMiter(line1: Vec2Like, line2: Vec2Like, lineWidth: number, miterLimit: number){
    // Measure the ortho norm of the previous vector and the next vector.
    let n1 = Vec2.create(line1);
    n1.normalize();
    n1.rotateRight();
    
    let n2 = Vec2.create(line2);
    n2.normalize();
    n2.rotateRight();

    // Average the ortho norms to get the miter vector.
    let miter = Vec2.create(n1);
    miter.add(n2);
    miter.normalize(); 

    // Measure the length of the miter by projecting it onto one of the ortho norms and inverting it.
    let length = lineWidth / miter.dot(n2);

    // Ensure length does not exceed miter limit
    if(length > miterLimit){
        length = miterLimit;
    }

    // Scale vector to the measured length
    miter.mulScalar(length);

    return miter;
}

