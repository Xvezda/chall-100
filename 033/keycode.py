import curses


def main(stdscr):
    curses.curs_set(0)
    def addstr_center(s):
        stdscr.addstr(curses.LINES//2, 0,
                      ('{:^'+str(curses.COLS)+'}').format(s))

    addstr_center('press key to get code')
    stdscr.refresh()
    while True:
        c = stdscr.getch()
        addstr_center('keycode: %d' % c)
        stdscr.refresh()


if __name__ == '__main__':
    curses.wrapper(main)


