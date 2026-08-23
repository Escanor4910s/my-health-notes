Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("C:\Users\7MAKSACOD PC\.gemini\antigravity\scratch\medical-observation\public\logo.jpg")
$bmp2 = new-object System.Drawing.Bitmap $bmp.Width, $bmp.Height

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $p = $bmp.GetPixel($x, $y)
        if ($p.R -gt 200 -and $p.G -gt 200 -and $p.B -gt 200) {
            $bmp2.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
            $bmp2.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($p.A, 0, 0, 0))
        }
    }
}
$bmp2.Save("C:\Users\7MAKSACOD PC\.gemini\antigravity\scratch\medical-observation\public\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$bmp2.Dispose()
