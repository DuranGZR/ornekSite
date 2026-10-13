"""Generate a transparent vector adaptation of the HSD community wordmark.

Reference: https://medium.com/@hsdmeu/about
No raster background or runtime font dependency is included in the SVG.
Run on Windows with fontTools installed: python docs/create-logo.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen


def outlines(text, font_path, x, baseline, width, height):
    font = TTFont(font_path)
    glyphs = font.getGlyphSet()
    mapping = font.getBestCmap()
    advance = 0
    paths = []
    for letter in text:
        glyph = glyphs[mapping[ord(letter)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        paths.append(f'<path transform="translate({advance} 0)" d="{pen.getCommands()}"/>')
        advance += glyph.width
    cap = glyphs[mapping[ord('H')]]
    from fontTools.pens.boundsPen import BoundsPen
    bounds = BoundsPen(glyphs)
    cap.draw(bounds)
    scale_y = height / bounds.bounds[3]
    return f'<g transform="translate({x} {baseline}) scale({width / advance} {-scale_y})">' + ''.join(paths) + '</g>'


svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 180"><title>Huawei Student Developers</title>'
svg += '<!-- Vector adaptation based on the HSD Mersin community wordmark; not an official brand master. -->'
svg += '<g fill="#cf0a2c"><path d="M76 30 10 64v24l66 34V97L34 76l42-21Z"/><path d="m404 30 66 34v24l-66 34V97l42-21-42-21Z"/></g>'
svg += '<g fill="#171719">'
svg += outlines('HSD', 'C:/Windows/Fonts/arialbd.ttf', 110, 132, 264, 114)
svg += outlines('HUAWEI STUDENT DEVELOPERS', 'C:/Windows/Fonts/arial.ttf', 85, 169, 310, 17)
svg += '</g></svg>'
target = Path(__file__).resolve().parents[1] / 'public' / 'hsd-logo.svg'
target.write_text(svg, encoding='utf-8')
print(target)
