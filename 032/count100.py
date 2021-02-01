import sys
import time
import threading
import curses


def keypress(stdscr, shared):
    while True:
        c = stdscr.getch()
        shared['count'] += 1
        if shared['count'] >= 100:
            shared['done'] = True
            break


def main(stdscr):
    # NOTE: NOT thread-safe
    shared = {'count': 0, 'done': False}

    curses.curs_set(0)

    stdscr.clear()
    stdscr.refresh()

    kbdthread = threading.Thread(target=keypress, args=(stdscr, shared))
    kbdthread.start()

    while True:
        cntstr = 'count: %d' % shared['count']
        fmtstr = '{0:^%d}' % (curses.COLS)
        stdscr.addstr(curses.LINES // 2, 0, fmtstr.format(cntstr))
        stdscr.refresh()
        if shared['done']:
            kbdthread.join()
            break


if __name__ == '__main__':
    curses.wrapper(main)

