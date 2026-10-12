$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$repoRoot = Split-Path -Parent $PSScriptRoot
$exampleRoot = Join-Path $repoRoot 'examples'
$outputPath = Join-Path $exampleRoot 'tp-doc-boutique-kit.zip'
$sourceNames = @('boutique-demo.html', 'tp-doc-test-cases-fr.csv', 'LIRE-MOI-README.txt')

foreach ($sourceName in $sourceNames) {
    if (-not (Test-Path -LiteralPath (Join-Path $exampleRoot $sourceName) -PathType Leaf)) {
        throw "Missing exercise source: $sourceName"
    }
}

$stream = [System.IO.File]::Open($outputPath, [System.IO.FileMode]::Create)
$archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($sourceName in $sourceNames) {
        $entry = $archive.CreateEntry($sourceName, [System.IO.Compression.CompressionLevel]::Optimal)
        $entry.LastWriteTime = [DateTimeOffset]::new(2026, 10, 12, 0, 0, 0, [TimeSpan]::Zero)
        $entryStream = $entry.Open()
        try {
            $bytes = [System.IO.File]::ReadAllBytes((Join-Path $exampleRoot $sourceName))
            $entryStream.Write($bytes, 0, $bytes.Length)
        } finally {
            $entryStream.Dispose()
        }
    }
} finally {
    $archive.Dispose()
    $stream.Dispose()
}

Write-Output "Created examples/tp-doc-boutique-kit.zip with $($sourceNames.Count) exercise files."
