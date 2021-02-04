import sys
import curses
import random



def main(stdscr):
    curses.curs_set(0)  # Hide cursor
    curses.start_color()  # Allow colors
    curses.use_default_colors()  # Allow transparency

    curses.init_pair(1, curses.COLOR_RED, -1)
    curses.init_pair(2, curses.COLOR_BLUE, -1)

    candidates = [curses.COLS//2, curses.LINES]
    if len(sys.argv) > 1:
        candidates.append(int(sys.argv[1]) + 1)
    maxval = min(candidates)
    arr = list(range(1, maxval))
    random.shuffle(arr)

    def delbar(i, v):
        stdscr.vline(0, i*2, ' ', curses.LINES)

    def drawbar(i, v, *args):
        delbar(i, v)
        for j in range(int(v)):
            stdscr.addstr(curses.LINES-1 - j, i*2, '█', *args)
        stdscr.refresh()

    def drawarr(arr):
        resetarr(arr)
        for i, v in enumerate(arr):
            drawbar(i, v)
        stdscr.refresh()

    def resetarr(arr):
        for i, v in enumerate(arr):
            delbar(i, v)

    class Proxy(object):
        DEFAULT_DELAY = 200

        def __init__(self, obj):
            self._obj = obj

        def __getitem__(self, key):
            drawbar(key, self._obj[key], curses.color_pair(1))
            try:
                return self._obj[key]
            finally:
                curses.napms(self.DEFAULT_DELAY)
                drawbar(key, self._obj[key])

        def __setitem__(self, key, value):
            prev = self._obj[key]
            drawbar(key, self._obj[key], curses.color_pair(2))

            self._obj[key] = value

            curses.napms(self.DEFAULT_DELAY)
            delbar(key, prev)
            drawbar(key, value)

        def __len__(self):
            return len(self._obj)


    while tuple(arr) != tuple(sorted(arr)):  # Make hashable and compare
        drawarr(arr)
        arr = Proxy(arr)
        i = 0
        while i < len(arr)-1:
            j = i + 1
            while j < len(arr):
                if arr[i] > arr[j]:
                    tmp = arr[i]
                    arr[i] = arr[j]
                    arr[j] = tmp
                j += 1
            i += 1
    drawarr(arr)
    curses.napms(3000)


if __name__ == '__main__':
    curses.wrapper(main)

