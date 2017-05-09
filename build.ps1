$src = $PSScriptRoot + "/src";
$lib = $PSScriptRoot + "/lib";

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
    tsc --project ($src + "/tsconfig.json")
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
    Set-Location $src
    $index = "./index.ts" 
    Remove-Item $index -ErrorAction Ignore
    Get-ChildItem -Filter "*.ts" -Exclude "*.template.ts" -Recurse | ForEach-Object {
        $file = $_.BaseName;
        $directory = $_.Directory.Name;
        if($directory -eq "struct"){
            if($file -ne "util"){
                # Capitalize file name to get name of default export
                $name = Capitalize($file)
                "import $name from './$directory/$file'" >> $index
                "export { $name }" >> $index
                }
        } elseif(!@("src", "shader").Contains($directory)){
            "export * from './$directory/$file'" >> $index
        }
    }
    Set-Location $PSScriptRoot
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