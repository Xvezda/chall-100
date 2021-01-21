import io
import re
import os.path
import contextlib
import collections
from string import (
    ascii_uppercase as uppercase,
    ascii_lowercase as lowercase
)


cache = {}
def generate_lookup_table(charset):
    global cache
    if charset in cache:
        return cache.get(charset)
    generated = {
        n: {
            c: charset[(i+n) % len(charset)]
               for i, c in enumerate(charset)
        }
        for n in range(len(charset))
    }
    cache.update({charset: generated})
    return generated


lookups = (
    generate_lookup_table(uppercase),
    generate_lookup_table(lowercase)
)
def translated(word, offset):
    global lookups
    sboxes = [lookup[offset] for lookup in lookups]
    return ''.join([sboxes[0].get(c, sboxes[1].get(c, c)) for c in word])


def load_words():
    # https://en.wikipedia.org/wiki/Words_(Unix)
    word_paths = ['/usr/share/dict/words', '/usr/dict/words']
    for path in word_paths:
        try:
            with open(path, 'r') as f:
                return [line.strip().lower() for line in f.readlines()
                        if not line.startswith('#')]
            break
        except OSError:
            pass
    else:
        import sys
        print('cannot find words!', file=sys.stderr)
        sys.exit(1)


is_valid_cache = {}
def is_valid(word, words):
    global is_valid_cache

    if is_valid_cache.get(word, None) is not None:
        return is_valid_cache[word]
    flag = word in words
    is_valid_cache[word] = flag
    return flag


class CaselessCounter(collections.Counter):
    def __init__(self, iom=None, **kwds):
        lower_kwds = {}
        for k, v in kwds:
            lower_kwds[k.lower()] = v
        super().__init__(**lower_kwds)
        if iom:
            self.update(map(lambda x: x.lower(), iom))


if __name__ == '__main__':
    # For default testing
    s = io.StringIO()
    with contextlib.redirect_stdout(s):
        import this  # Let's use "The Zen of Python" :)
    original = captured = s.getvalue()
    crypted = translated(captured, 13)

    words = load_words()
    # Bruteforce
    memo = {}
    weights = {}
    counters = {}
    iterations = len(lowercase)
    regexp = r'\b([A-Za-z]{2,})\b'
    for i in range(0, iterations):
        print('[*]', 'iteration:', i)
        guessed = translated(crypted, i)
        memo[i] = guessed

        founds = re.findall(regexp, guessed.lower())
        valids = [word for word in founds
                  if is_valid(word, words)]

        occur_counter = CaselessCounter(valids)
        print(occur_counter.most_common(3))
        weights[i] = sum(occur_counter.values())
        counters[i] = occur_counter
    print()


    minidx = min(weights, key=weights.get)
    maxidx = max(weights, key=weights.get)

    def avg(lst):
        return sum(lst) / len(lst)

    average = avg(weights.values())
    desc_weights = sorted(weights.items(),
                          key=lambda x: x[1],
                          reverse=True)
    PICK_TOP = 1
    for i, (k, v) in enumerate(desc_weights):
        if i+1 > PICK_TOP:
            break

        if not v:
            continue

        print('[+]', 'guessed:', f'ROT{k}')
        print('[+]', 'weight:', v)
        print()

        counter = counters[k]
        replaced_word = {}
        def repl(match):
            word = match.group(1)
            count = counter.get(word.lower())
            if replaced_word.get(word) or not count:
                return match.group(0)
            replaced_word.update({word: True})
            return f'<{word}: {count}>'
        replaced = re.sub(regexp, repl, memo.get(k))
        print(replaced)

    print('[+]',
          f'avg: {avg(weights.values()):.5f},',
          f'min: {weights[minidx]},',
          f'max: {weights[maxidx]}')


