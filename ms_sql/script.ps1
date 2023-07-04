$sourceFile = "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Backup\skip.bak"
$networkShare = "\\192.168.1.123\Filmy Taty"
$destinationFileName = "skip.back"
$destinationPath = Join-Path -Path $networkShare -ChildPath $destinationFileName

Copy-Item -Path $sourceFile -Destination $destinationPath -Force

if (Test-Path -Path $destinationPath) {
    Write-Host "Successfully copied to $destinationPath"

    Remove-Item -Path $sourceFile -Force
    Write-Host "Source file deleted: $sourceFile"
} else {
    Write-Host "Failed to copy to $destinationPath"
}