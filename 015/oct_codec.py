#!/usr/bin/env python
# -*- coding: utf-8 -*-

from __future__ import absolute_import
from __future__ import print_function


import codecs


def oct_encode(data, errors='strict'):
    return (bytes(' '.join(map(lambda x: oct(ord(x)), list(data)))), len(data))


def oct_decode(data, errors='strict'):
    return (''.join(map(lambda x: chr(int(x, 8)), data.split())), len(data))


def getreginfo():
    return codecs.CodecInfo(
        name='oct',
        encode=oct_encode,
        decode=oct_decode
    )

def searchfunc(oct):
    return getreginfo()

codecs.register(searchfunc)


if __name__ == '__main__':
    print('hello'.encode('oct'))

