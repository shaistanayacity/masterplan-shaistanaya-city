"""Bikin foto 360 (equirectangular) & denah PLACEHOLDER untuk uji coba survey.
Ganti dengan file asli di survey/photos/ dan survey/plans/ lalu edit survey/data.js."""
import colorsys, os
from PIL import Image, ImageDraw
root = os.path.join(os.path.dirname(__file__), "..", "survey")
scenes = [("l1-teras",0.08,"LANTAI 1 · TERAS"),("l1-living",0.12,"LANTAI 1 · RUANG TAMU"),
          ("l1-dapur",0.30,"LANTAI 1 · DAPUR"),("l2-master",0.58,"LANTAI 2 · KAMAR UTAMA"),
          ("l2-balkon",0.52,"LANTAI 2 · BALKON")]
for name,h,label in scenes:
    W,H=2048,1024; im=Image.new("RGB",(W,H)); d=ImageDraw.Draw(im)
    for y in range(H):
        t=y/H; c=colorsys.hsv_to_rgb(h,0.35,0.9-0.55*t); d.line([(0,y),(W,y)],fill=tuple(int(v*255) for v in c))
    for x in range(0,W,W//12): d.line([(x,0),(x,H)],fill=(255,255,255),width=2)
    for y in range(0,H,H//6): d.line([(0,y),(W,y)],fill=(255,255,255),width=2)
    for i,t in enumerate(["UTARA","TIMUR","SELATAN","BARAT"]):
        d.text((W*i//4+W//8-30,H//2-10),t,fill=(255,255,255))
        d.text((W*i//4+W//8-60,H//2+20),label,fill=(255,255,255))
    im.save(os.path.join(root,"photos",name+".jpg"),quality=82)
def plan(name,rooms,title):
    im=Image.new("RGB",(900,600),(250,248,242)); d=ImageDraw.Draw(im)
    d.text((20,16),title,fill=(60,60,60))
    for (x0,y0,x1,y1,t) in rooms:
        d.rectangle([x0,y0,x1,y1],outline=(70,70,70),width=4,fill=(236,230,214)); d.text((x0+10,y0+10),t,fill=(60,60,60))
    im.save(os.path.join(root,"plans",name+".png"))
plan("lantai-1",[(60,60,420,300,"Ruang Tamu"),(420,60,840,300,"Dapur & Dining"),(60,300,420,540,"Teras / Carport"),(420,300,840,540,"Taman Belakang")],"DENAH LANTAI 1 (placeholder)")
plan("lantai-2",[(60,60,520,300,"Kamar Utama"),(520,60,840,300,"Kamar Mandi"),(60,300,520,540,"Kamar 2"),(520,300,840,540,"Balkon")],"DENAH LANTAI 2 (placeholder)")
