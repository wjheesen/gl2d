$src = $PSScriptRoot + "\src";
$lib = $PSScriptRoot + "\lib";

function Initialize-Repository(){
    Set-Location $PSScriptRoot
    npm install
    Update-All
}

function Update-Package(){
    Set-Location $PSScriptRoot
    # Clean lib folder
    Remove-Item $lib -Recurse -ErrorAction Ignore
    # Transpile src files
    tsc --project "$src\tsconfig.json"
    # Copy package files to lib folder
    Copy-Item -Path package.json, README.md, LICENSE -Destination $lib
}


function Update-Gulpfile(){
    Set-Location $PSScriptRoot
    tsc 
}

function Update-Shaders(){
    Set-Location $PSScriptRoot
    gulp update:shaders
}

function Update-Structs(){
    Set-Location $PSScriptRoot
    gulp update:structs
}

function Update-Index(){
    $index = "$src\index.ts" 
    Remove-Item $index -ErrorAction Ignore
    Get-ChildItem -Path $src -Filter "*.ts" -Exclude "*.template.ts" -Recurse | 
    Where-Object {
        return $_.FullName -ne "$src\struct\util.ts" -and !@("src", "shader").Contains($_.Directory.Name)
    } | 
    ForEach-Object {
        "export * from './$($_.Directory.Name)/$($_.BaseName)'" >> $index
    }
}

function Update-All(){
    Update-Gulpfile
    Update-Shaders
    Update-Structs
    Update-Index
    Update-Package
}

function Publish-Package(){
    Set-Location $lib
    npm publish
    Set-Location $PSScriptRoot
}

function Capitalize([string] $str){
    if([String]::IsNullOrEmpty($str)){
        return $str;
    }
    $capital = $str.Substring(0, 1).ToUpper();
    if($str.Length -gt 1){
        return $capital + $str.Substring(1);
    } else {
        return $capital;
    }
}

export-modulemember -function Initialize-Repository, Update-Package, Update-Index, Update-Gulpfile, Update-Shaders, Update-All, Publish-Package