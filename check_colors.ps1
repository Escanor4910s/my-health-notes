Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("C:\Users\7MAKSACOD PC\.gemini\antigravity\scratch\medical-observation\public\watermark.jpg")
$minR = 255; $maxR = 0; $minG = 255; $maxG = 0; $minB = 255; $maxB = 0;
# sample 1000 pixels
for ($i=0; $i -lt 1000; $i++) {
    $x = Get-Random -Maximum $bmp.Width
    $y = Get-Random -Maximum $bmp.Height
    $p = $bmp.GetPixel($x, $y)
    if ($p.R -lt $minR) { $minR = $p.R }
    if ($p.R -gt $maxR) { $maxR = $p.R }
    if ($p.G -lt $minG) { $minG = $p.G }
    if ($p.G -gt $maxG) { $maxG = $p.G }
    if ($p.B -lt $minB) { $minB = $p.B }
    if ($p.B -gt $maxB) { $maxB = $p.B }
}
Write-Output "R: $minR - $maxR, G: $minG - $maxG, B: $minB - $maxB"
$bmp.Dispose()
