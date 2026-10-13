$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$draftDirectory = Join-Path $projectDirectory 'content-drafts'
# Save public metadata for review. Published articles are never changed here.
$response = Invoke-WebRequest 'https://medium.com/feed/@hsdinonu' -TimeoutSec 20
$settings = [System.Xml.XmlReaderSettings]::new()
$settings.DtdProcessing = [System.Xml.DtdProcessing]::Prohibit
$settings.XmlResolver = $null
$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($response.Content), $settings)
$feed = [System.Xml.XmlDocument]::new()
$feed.XmlResolver = $null
try { $feed.Load($reader) } finally { $reader.Dispose() }
$drafts = @($feed.SelectNodes('/rss/channel/item') | ForEach-Object {
  $entry = $_
  $link = [uri]$entry.SelectSingleNode('link').InnerText
  if ($link.Scheme -ne 'https' -or $link.Host -ne 'medium.com') { throw 'Unexpected article URL in Medium feed.' }
  $body = $entry.SelectSingleNode("*[local-name()='encoded']").InnerText
  $text = [System.Net.WebUtility]::HtmlDecode(($body -replace '<[^>]+>', ' '))
  $wordCount = ($text -split '\s+' | Where-Object { $_ }).Count
  [ordered]@{
    title = $entry.SelectSingleNode('title').InnerText
    author = $entry.SelectSingleNode("*[local-name()='creator']").InnerText
    published = ([DateTimeOffset]::Parse($entry.SelectSingleNode('pubDate').InnerText)).ToString('yyyy-MM-dd')
    readingMinutes = [Math]::Max(1, [Math]::Ceiling($wordCount / 200))
    href = $link.GetLeftPart([System.UriPartial]::Path)
    reviewed = $false
  }
})
if ($drafts.Count -eq 0) { throw 'The feed contains no articles; existing drafts have been preserved.' }
New-Item -ItemType Directory -Force -Path $draftDirectory | Out-Null
@{ source = 'https://medium.com/feed/@hsdinonu'; fetchedAt = [DateTimeOffset]::UtcNow.ToString('o'); articles = $drafts } | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 -LiteralPath (Join-Path $draftDirectory 'medium.json')
Write-Output "$($drafts.Count) article drafts saved. Review before adding them to src/content/data.ts."
