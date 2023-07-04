$sourceFile = "C:\Path\to\source\file.txt"
$networkShare = "\\Server\Share"

$destinationFileName = "file.txt"

$destinationPath = Join-Path -Path $networkShare -ChildPath $destinationFileName

Copy-Item -Path $sourceFile -Destination $destinationPath -Force

if (Test-Path -Path $destinationPath) {
    Write-Host "Successfully copied to $destinationPath"
} else {
    Write-Host "Failed to  $destinationPath"
}
