from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630

# Palette mirrors css/styles.css design tokens
BG = (243, 237, 226)        # --bg #f3ede2 cream
INK = (31, 29, 26)           # --ink #1f1d1a
INK_SOFT = (91, 85, 76)      # --ink-soft #5b554c
INK_MUTE = (138, 132, 122)   # --ink-mute #8a847a
ACCENT = (201, 100, 66)      # --accent #c96442 terracotta
RULE = (226, 220, 207)       # --rule #e2dccf

# Site stack: serif for headline, sans for Korean body
SERIF_PATH = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SANS_PATH = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
SANS_WEIGHTS = {"thin":0,"ultralight":1,"light":2,"regular":3,"medium":4,
                "semibold":5,"bold":6,"extrabold":7,"heavy":8}

def serif(size):
    return ImageFont.truetype(SERIF_PATH, size)

def sans(size, weight="regular"):
    return ImageFont.truetype(SANS_PATH, size, index=SANS_WEIGHTS[weight])

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

PAD_X = 80
PAD_TOP = 90

# Eyebrow — matches .hero .eyebrow (uppercase, muted, tracked)
eyebrow_font = sans(20, "medium")
eyebrow = "무료 강의  ·  약 45분"
draw.text((PAD_X, PAD_TOP), eyebrow.upper(), fill=INK_MUTE, font=eyebrow_font)

# Brand title — big serif, like the site's <h1>
title_font = serif(160)
title = "Claude 101"
draw.text((PAD_X, PAD_TOP + 40), title, fill=INK, font=title_font)

# Lead — matches .hero p.lead
lead_font = sans(26, "regular")
lead_y = PAD_TOP + 230
lead_line1 = "Claude를 일상 업무에 활용하는 방법을 배우고, 핵심 기능을"
lead_line2 = "이해하며, 더 깊이 있는 학습으로 이어지는 자료까지 함께 살펴봅니다."
draw.text((PAD_X, lead_y),       lead_line1, fill=INK_SOFT, font=lead_font)
draw.text((PAD_X, lead_y + 38),  lead_line2, fill=INK_SOFT, font=lead_font)

# Meta strip — mirrors the four-pair .hero .meta block
# Pairs: bold label (ink) + sublabel (ink-soft)
meta_y = H - 130
label_font = sans(22, "bold")
sub_font = sans(18, "regular")

meta_pairs = [
    ("12개 레슨",     "5개 섹션 구성"),
    ("레슨마다 퀴즈", "이해도 점검"),
    ("수료증",        "완주 시 발급"),
    ("회원가입 불필요", "진행 상황은 브라우저에 저장"),
]

# Compute even spacing within the safe area
COL_W = 240
COL_GAP = 20
total_w = len(meta_pairs) * COL_W + (len(meta_pairs) - 1) * COL_GAP
# Anchor the strip flush-left at PAD_X so it lines up with title
col_x = PAD_X
for label, sub in meta_pairs:
    draw.text((col_x, meta_y),       label, fill=INK, font=label_font)
    draw.text((col_x, meta_y + 36),  sub,   fill=INK_SOFT, font=sub_font)
    col_x += COL_W + COL_GAP

# Tiny terracotta dot + URL — bottom right, restrained
url_font = sans(20, "semibold")
url = "ai.tchung.org/claude-101"
ubb = draw.textbbox((0, 0), url, font=url_font)
uw = ubb[2] - ubb[0]
url_y = 90  # mirror the eyebrow's vertical position, right-aligned
draw.text((W - PAD_X - uw, url_y), url, fill=ACCENT, font=url_font)

img.save("/Users/tchung/claude/claude-101/og-hero.png", "PNG", optimize=True)
print("ok", img.size)
