$sourceDirectory = "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Backup\"
$networkShare = "\\192.168.1.123\Filmy Taty"
$logFilePath = "\\192.168.1.123\Filmy Taty\Backups\backup_log.txt"

$currentDate = Get-Date -Format "dd-MM-yyyy_hh-mm-ss"
$destinationFolder = Join-Path -Path $networkShare -ChildPath "Backups\$currentDate"

if (!(Test-Path -Path $destinationFolder)) {
    New-Item -Path $destinationFolder -ItemType Directory | Out-Null
}

Get-ChildItem -Path "$networkShare\Backups\" -Recurse -Directory | Where-Object {($_.LastWriteTime -lt (Get-Date).AddDays(-7))} | Remove-Item -Force -Recurse


$sourceFiles = Get-ChildItem -Path $sourceDirectory -Filter "*.bak" -File
$filesInDestination = Get-ChildItem -Path $destinationFolder -Filter "*.bak" -File

$logMessage = "Backuping files ($currentDate): `n"


foreach ($sourceFile in $sourceFiles) {
    $destinationFileName = $sourceFile.Name -replace '\.bak$', "_$currentDate.bak"
    $destinationPath = Join-Path -Path $destinationFolder -ChildPath $destinationFileName

    Copy-Item -Path $sourceFile.FullName -Destination $destinationPath -Force

    if (Test-Path -Path $destinationPath) {
        Write-Host "Successfully copied to $destinationPath"

        Remove-Item -Path $sourceFile.FullName -Force
        Write-Host "Source file deleted: $($sourceFile.FullName)"
        $logMessage += "File: $($sourceFile.FullName) - Sent to: $destinationPath`n"
    } else {
        Write-Host "Failed to copy to $destinationPath"
        return
    }
}
if ($sourceFiles.Count -gt 0) {
    Write-Host "Removing old files from $destinationFolder"
    foreach ($fileInDestination in $filesInDestination) {
        Remove-Item -Path $fileInDestination.FullName -Force
    }
}

$logMessage += "----------------------------------------`n"

Add-Content -Path $logFilePath -Value $logMessage


# $oldFolders = Get-ChildItem -Path $networkShare | Where-Object {
#     $_.PSIsContainer -and $_.Name -match '^\d{2}-\d{2}-\d{4}_\d{2}-\d{2}-\d{2}' -and $_.LastWriteTime -lt (Get-Date).AddDays(-1)
# }
# Write-Host $oldFolders.Count
# foreach ($oldFolder in $oldFolders) {
#     Remove-Item -Path $oldFolder.FullName -Recurse -Force
#     Write-Host "Deleted folder: $($oldFolder.FullName)"
# }

