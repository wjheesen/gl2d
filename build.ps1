function Initialize-Repository(){
    npm install
    Update-All
}

function Update-Package(){
    # Clean lib folder
    Remove-Item ./lib -Recurse -ErrorAction Ignore
    # Transpile src files
    tsc --project ./src/tsconfig.json
    tsc --project ./src/shader/tsconfig.json
    tsc --project ./src/struct/tsconfig.json
    # Copy package files to lib folder
    Copy-Item -Path package.json, README.md, LICENSE -Destination ./lib
}

function Update-Gulpfile(){
    tsc
}

function Update-Shaders(){
    gulp update:shaders
}

function Update-Structs(){
    gulp update:structs
}

function Update-All(){
    Update-Gulpfile
    Update-Shaders
    Update-Structs
    Update-Package
}

function Publish-Package(){
    Set-Location ./lib
    npm publish
    Set-Location ..
}

export-modulemember -function Initialize-Repository, Update-Package, Update-Gulpfile, Update-Shaders, Update-All, Publish-Package