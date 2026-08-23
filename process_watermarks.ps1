Add-Type -AssemblyName System.Drawing

function Process-Image ($src, $dest) {
    $bmp = [System.Drawing.Bitmap]::FromFile($src)
    $bmp2 = new-object System.Drawing.Bitmap $bmp.Width, $bmp.Height

    for ($x = 0; $x -lt $bmp.Width; $x++) {
        for ($y = 0; $y -lt $bmp.Height; $y++) {
            $p = $bmp.GetPixel($x, $y)
            # Threshold: if average RGB is high, make it transparent
            $avg = ($p.R + $p.G + $p.B) / 3
            if ($avg -gt 130) {
                $bmp2.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            } else {
                # Map to solid black with alpha based on darkness for smooth edges
                # $alpha = [Math]::Min(255, [Math]::Max(0, 255 - $avg * 2))
                $bmp2.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(200, 0, 0, 0))
            }
        }
    }
    $bmp2.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $bmp2.Dispose()
}

Process-Image "C:\Users\7MAKSACOD PC\.gemini\antigravity\scratch\medical-observation\public\watermark.jpg" "C:\Users\7MAKSACOD PC\.gemini\antigravity\scratch\medical-observation\public\watermark.png"

Process-Image "C:\Users\7MAKSACOD PC\.gemini\antigravity\brain\2bde518b-531d-488a-af1e-8934f8384aec\.user_uploaded\media_1786809726676.jpg" "C:\Users\7MAKSACOD PC\.gemini\antigravity\scratch\medical-observation\public\section-watermark.png"

