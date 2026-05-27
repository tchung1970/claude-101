from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630

# Palette from css/styles.css design tokens
BG = (243, 237, 226)        # --bg #f3ede2 cream
INK = (31, 29, 26)          # --ink #1f1d1a
INK2 = (91, 85, 76)         # --ink-soft #5b554c
INK3 = (138, 132, 122)      # --ink-mute #8a847a
ACCENT = (201, 100, 66)     # --accent #c96442 terracotta
ACCENT_DEEP = (168, 70, 50)
ACCENT_SOFT = (241, 217, 206)  # --accent-soft #f1d9ce
OK = (79, 122, 61)          # --ok #4f7a3d
AMBER = (168, 106, 31)
OCEAN = (44, 94, 138)

FONT_PATH = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
def font(size, weight="bold"):
    idx = {"thin":0,"ultralight":1,"light":2,"regular":3,"medium":4,
           "semibold":5,"bold":6,"extrabold":7,"heavy":8}[weight]
    return ImageFont.truetype(FONT_PATH, size, index=idx)

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# Soft radial blobs — accent top-right, amber bottom-left
base = img.convert("RGBA")
def add_blob(b, cx, cy, r, color, peak=80):
    layer = Image.new("RGBA", (W, H), (0,0,0,0))
    ld = ImageDraw.Draw(layer)
    for i in range(40, 0, -1):
        ratio = i/40
        a = int(peak*(1-ratio)**1.6)
        rr = int(r*ratio)
        ld.ellipse([cx-rr, cy-rr, cx+rr, cy+rr], fill=(*color, a))
    return Image.alpha_composite(b, layer)

base = add_blob(base, 1080, -40, 420, ACCENT, 65)
base = add_blob(base, 120, 580, 460, AMBER, 50)
img = base.convert("RGB")
draw = ImageDraw.Draw(img)

# Top warm band: accent → amber → cream → ok → ocean
band_colors = [ACCENT, AMBER, ACCENT_SOFT, OK, OCEAN]
seg_w = W / len(band_colors)
for i, c in enumerate(band_colors):
    x0 = int(i*seg_w); x1 = int((i+1)*seg_w)
    for x in range(x0, x1):
        if i < len(band_colors)-1:
            t = (x - x0) / (x1 - x0)
            nxt = band_colors[min(i+1, len(band_colors)-1)]
            r = int(c[0]*(1-t) + nxt[0]*t)
            g = int(c[1]*(1-t) + nxt[1]*t)
            b = int(c[2]*(1-t) + nxt[2]*t)
            draw.line([(x,0),(x,8)], fill=(r,g,b))
        else:
            draw.line([(x,0),(x,8)], fill=c)

PAD_X = 80

# Kicker
kicker_font = font(20, "bold")
draw.ellipse([PAD_X, 78, PAD_X+10, 88], fill=ACCENT)
draw.text((PAD_X+22, 70), "CLAUDE 101  ·  한국어  ·  2026", fill=ACCENT, font=kicker_font)

# Main title — two lines
title_font = font(78, "heavy")
line1 = "Claude 사용법을 한국어로"
line2 = "스스로 익히는 강의"

y = 150
draw.text((PAD_X, y), line1, fill=INK, font=title_font)

# Soft accent highlight behind line 2
y2 = y + 100
bbox = draw.textbbox((PAD_X, y2), line2, font=title_font)
hl = Image.new("RGBA", (W, H), (0,0,0,0))
hld = ImageDraw.Draw(hl)
hld.rounded_rectangle([bbox[0]-4, bbox[3]-22, bbox[2]+4, bbox[3]+4],
                      radius=6, fill=(201, 100, 66, 55))
img = Image.alpha_composite(img.convert("RGBA"), hl).convert("RGB")
draw = ImageDraw.Draw(img)

# Gradient text for line 2: accent → deeper accent
def gradient_text(xy, text, font_obj, c0, c1):
    bb = draw.textbbox(xy, text, font=font_obj)
    tw = bb[2]-bb[0]; th = bb[3]-bb[1]
    if tw <= 0 or th <= 0:
        draw.text(xy, text, fill=c0, font=font_obj); return
    mask = Image.new("L", (tw+20, th+40), 0)
    md = ImageDraw.Draw(mask)
    md.text((0, 0), text, font=font_obj, fill=255)
    grad = Image.new("RGB", (tw+20, th+40), c0)
    gd = ImageDraw.Draw(grad)
    for i in range(tw+20):
        t = i/max(1, tw+19)
        r = int(c0[0]*(1-t)+c1[0]*t)
        g = int(c0[1]*(1-t)+c1[1]*t)
        b = int(c0[2]*(1-t)+c1[2]*t)
        gd.line([(i,0),(i,th+40)], fill=(r,g,b))
    img.paste(grad, (xy[0], xy[1]), mask)

gradient_text((PAD_X, y2), line2, title_font, ACCENT, ACCENT_DEEP)
draw = ImageDraw.Draw(img)

# Subtitle
sub_font = font(26, "regular")
sub = "기본 사용법부터 프로젝트, Skills, 워크플로까지 한 번에 정리했습니다."
draw.text((PAD_X, y2+120), sub, fill=INK3, font=sub_font)

# Bottom row: stats and URL
bot_y = H - 110
stat_font_n = font(34, "heavy")
stat_font_l = font(18, "medium")

def pill(x, y, n, label, accent):
    pill_w = 200
    pill_h = 70
    draw.rounded_rectangle([x, y, x+pill_w, y+pill_h], radius=14,
                           fill=(255,255,255), outline=(226, 220, 207), width=1)
    draw.ellipse([x+18, y+30, x+30, y+42], fill=accent)
    draw.text((x+40, y+10), n, fill=INK, font=stat_font_n)
    draw.text((x+40, y+45), label, fill=INK3, font=stat_font_l)

pill(PAD_X,      bot_y, "12",    "레슨",   ACCENT)
pill(PAD_X+220,  bot_y, "5",     "섹션",   AMBER)
pill(PAD_X+440,  bot_y, "수료증", "발급",   OK)

# URL right-aligned
url_font = font(22, "semibold")
url = "ai.tchung.org/claude-101"
ubb = draw.textbbox((0,0), url, font=url_font)
uw = ubb[2]-ubb[0]
draw.text((W-PAD_X-uw, bot_y+22), url, fill=INK2, font=url_font)

img.save("/Users/tchung/claude/claude-101/og.png", "PNG", optimize=True)
print("ok", img.size)
