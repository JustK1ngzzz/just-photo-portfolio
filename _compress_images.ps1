Add-Type -AssemblyName System.Drawing

$root = "C:\Users\lenovo\Doubao\chats\2026-10-19\new-chat\photo-portfolio\public\photography"
$pos = "C:\Users\lenovo\Desktop\ps\新建文件夹\正片"
$cha = "C:\Users\lenovo\Desktop\ps\新建文件夹\场照"

$map = @(
  # series A - lolita
  @{s="$pos\DSC00178.png";        d="$root\lolita\lolita-1.jpg"},
  @{s="$pos\DSC003161.png";       d="$root\lolita\lolita-2.jpg"},
  @{s="$pos\DSC00352.png";        d="$root\lolita\lolita-3.jpg"},
  # series B - duo
  @{s="$pos\DSC00440.png";        d="$root\duo\duo-1.jpg"},
  @{s="$pos\DSC00460(1).png";     d="$root\duo\duo-2.jpg"},
  @{s="$pos\DSC005981.png";       d="$root\duo\duo-3.jpg"},
  # series C - event
  @{s="$cha\DSC00018_(21.png";        d="$root\event\event-1.jpg"},
  @{s="$cha\DSC000192_(2)111.png";    d="$root\event\event-2.jpg"},
  @{s="$cha\DSC001272_(2)-恢复的1.jpg"; d="$root\event\event-3.jpg"},
  @{s="$cha\DSC00144-恢复的11.jpg";     d="$root\event\event-4.jpg"},
  @{s="$cha\DSC002192.png";        d="$root\event\event-5.jpg"}
)

foreach ($dir in "$root\lolita","$root\duo","$root\event") {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# compress helper
function Compress-To([string]$src, [string]$dst, [int]$maxEdge, [int]$quality) {
  $img = [System.Drawing.Image]::FromFile($src)
  try {
    $ratio = [math]::Min(1.0, $maxEdge / [math]::Max($img.Width, $img.Height))
    $w = [int]($img.Width * $ratio); $h = [int]($img.Height * $ratio)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.SmoothingMode = 'HighQuality'
    $g.DrawImage($img, 0, 0, $w, $h)
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $p = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
    $bmp.Save($dst, $enc, $p)
    $g.Dispose(); $bmp.Dispose()
    "{0}  {1}x{2} -> {3}" -f (Split-Path $src -Leaf), $w, $h, (Split-Path $dst -Leaf)
  } finally {
    $img.Dispose()
  }
}

foreach ($m in $map) {
  Compress-To $m.s $m.d 1920 82
}

# hero = best shot (same as lolita-1)
Copy-Item -LiteralPath "$root\lolita\lolita-1.jpg" -Destination "$root\hero.jpg" -Force
"hero.jpg copied"
"ALL DONE"
