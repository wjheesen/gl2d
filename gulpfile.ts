import gulp = require("gulp");
import rename = require("gulp-rename");
import shadify = require("gulp-shadify");
import structify = require("gulp-structify");

gulp.task("update:shaders", function(){
    // Search for files ending in .glslx
    return gulp.src("./src/shader/*.glslx")
        .pipe(shadify())
        .pipe(rename({extname: ".ts"}))
        .pipe(gulp.dest("./src/shader/"));
})

gulp.task("update:structs", function(){
    // Search for files ending in .template.ts
    return gulp.src("./src/struct/*.template.ts")
        // Generate struct file
        .pipe(structify())
        // Remove ".template" from filename
        .pipe(rename(p => {  
            let base = p.basename;
            let length = base.length - ".template".length;
            p.basename = base.substr(0, length);
        })) 
        // Output to same folder to preserve imports
        .pipe(gulp.dest("./src/struct/"));
})

