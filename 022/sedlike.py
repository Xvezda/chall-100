import re
import sys
import time
import collections


class Command(object):
    def __init__(self, *args, **kwds):
        self.args = args
        self.kwds = kwds

    def pipe(self, command):
        return command.piped(self)

    def piped(self, passed):
        pass


class Echo(Command):
    def __init__(self, *args):
        self._text = ' '.join(args)

    def pipe(self, command):
        return command.piped(self._text)

    def __str__(self):
        return self._text


class Sed(Command):
    def __init__(self, expr, filename=None):
        tokens = expr.split('/')
        [_, pattern, repl]  = tokens[:3]
        self.pattern = pattern
        self.repl = repl
        self.flag = tokens[3:]

    def piped(self, passed):
        replaced = re.sub(re.escape(self.pattern), self.repl, passed)
        return str(replaced)


class Grep(Command):
    def __init__(self, expr, filename=None):
        if not hasattr(expr, 'match'):
            self.pattern = re.compile(expr)
        else:
            self.pattern = expr

    def piped(self, passed):
        def generate():
            lines = passed.split('\n')
            for line in lines:
                if self.pattern.match(line):
                    yield line
        return generate()


Tokens = collections.namedtuple('Token', ['delim', 'tokens', 'origin'])

def tokenize(word, delim: str = None):
    if not delim:
        return Tokens(delim=None, tokens=list(word), origin=word)
    return Tokens(
        delim=delim,
        tokens=word.split(delim),
        origin=word
    )


def tokens2sedre(tokens):
    [_, pattern, repl, flag] = tokens.tokens
    assert _.casefold() == 's'.casefold(), _
    return f's/{pattern}/{repl}/{flag}'


def main():
    with open('/usr/share/dict/words', 'r') as f:
        text = f.read()

    words = set(map(lambda x: x.strip().casefold(), text.split('\n')))
    regex = re.compile(r'^s([a-z])(?:(?!\1)[a-z])+\1(?:(?!\1)[a-z])*\1g?$', re.I)
    re_likes = Echo(text).pipe(Grep(regex))
    tokenized = map(lambda x: tokenize(x, delim=x[1]), re_likes)

    for i, tokens in enumerate(tokenized):
        start = time.time()
        print('[*]', 'iteration:', i, file=sys.stderr)
        for j, word in enumerate(words):
            if tokens.tokens[1] not in word:
                continue
            sedre = tokens2sedre(tokens)
            replaced = Echo(word).pipe(Sed(sedre))
            if replaced == word:
                continue
            if replaced in words:
                print(word, '->', replaced,
                      'with', tokens.delim.join(sedre.split('/')))
        end = time.time()
        print('[*]', f'#{i} done in {end-start:.5f} sec.', file=sys.stderr)


if __name__ == '__main__':
    main()

