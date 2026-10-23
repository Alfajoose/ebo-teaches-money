"""Extract an Animate .fla (XFL zip) by walking local headers — tolerant of the
duplicate-entry / bad central-directory zips Animate sometimes writes."""
import sys, struct, zlib, os

def extract(fla, out):
    d = open(fla, 'rb').read()
    cd = d.find(b'PK\x01\x02')
    end = cd if cd > 0 else len(d)
    out = os.path.abspath(out)
    i = 0
    names = []
    while True:
        i = d.find(b'PK\x03\x04', i)
        if i < 0 or i >= end:
            break
        ver, flag, meth, t, dt, crc, cs, us, fl, el = struct.unpack('<HHHHHIIIHH', d[i + 4:i + 30])
        name = d[i + 30:i + 30 + fl].decode('utf8')
        s = i + 30 + fl + el
        raw = d[s:s + cs]
        data = zlib.decompress(raw, -15) if meth == 8 else raw
        p = os.path.normpath(os.path.join(out, name))
        if not p.startswith(out):
            raise ValueError('unsafe path ' + name)
        if name.endswith('/'):
            os.makedirs(p, exist_ok=True)
        else:
            os.makedirs(os.path.dirname(p), exist_ok=True)
            open(p, 'wb').write(data)
        names.append(name)
        i = s + cs
    return names

if __name__ == '__main__':
    print(len(extract(sys.argv[1], sys.argv[2])), 'entries')
