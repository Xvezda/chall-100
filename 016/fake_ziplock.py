import argparse
import struct


def main(args):
    with open(args.file, 'r+b') as f:
        zipbuf = f.read()
        i = 0
        while i < len(zipbuf):
            if zipbuf[i] != 0x50:
                i += 1
                continue
            if zipbuf[i+1] != 0x4b:
                i += 1
                continue

            if zipbuf[i+2] == 0x01 and zipbuf[i+3] == 0x02:
                print('[*]', 'found offset:', i)
                flag = bytearray(zipbuf[i+8:i+8+2])
                print('[*]', 'flag:', flag)
                # Set flag
                flag[0] = flag[0] | 0x01
                print('[*]', 'modified flag:', flag)
                f.seek(i+8)
                f.write(flag)
                print('[+]', 'flag modified!')
            i += 4

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('file')

    args = parser.parse_args()
    main(args)

