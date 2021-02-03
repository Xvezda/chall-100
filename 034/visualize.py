import time
import curses
import random


def main(stdscr):
    curses.curs_set(0)

    arr = list(range(1, 10+1))
    random.shuffle(arr)

    def drawbar(i, v):
        for j in range(int(v)):
            stdscr.addstr(curses.LINES-1 - j, i*2, '█')

    def drawarr(arr):
        stdscr.clear()
        for i, v in enumerate(arr):
            drawbar(i, v)
        stdscr.refresh()
        time.sleep(.2)

    while arr != sorted(arr):
        i = 0
        while i < len(arr)-1:
            j = i + 1
            while j < len(arr):
                drawarr(arr)
                if arr[i] > arr[j]:
                    tmp = arr[i]
                    arr[i] = arr[j]
                    arr[j] = tmp
                j += 1
            i += 1


if __name__ == '__main__':
    curses.wrapper(main)

