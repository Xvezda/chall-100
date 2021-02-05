'''Regular expression visualization tool.'''

import re
import curses
from curses.textpad import Textbox, rectangle


LOREM = '''\
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac hendrerit quam. Integer hendrerit volutpat elit, ut viverra mauris consequat ut. Pellentesque pellentesque tellus accumsan elementum sodales. Pellentesque condimentum nulla at ornare pretium. Maecenas tincidunt ligula vel eros gravida rhoncus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam egestas lacus sed sapien fringilla ultrices. Donec vitae placerat augue, vel interdum turpis. Integer vitae odio a turpis aliquet facilisis. Integer orci sapien, vehicula ac dui sed, condimentum maximus nisi. Maecenas et euismod urna. Nullam id augue quam. Fusce luctus, tortor sit amet interdum mollis, risus tortor interdum turpis, at iaculis nulla sem viverra ex.
'''

def main(stdscr):
    if curses.has_colors():
        curses.start_color()
        curses.init_pair(1, curses.COLOR_WHITE, curses.COLOR_RED)

    stdscr.refresh()

    textwin = curses.newwin(curses.LINES-3, curses.COLS, 0, 0)
    textwin.scrollok(True)
    # Content of textwin
    s = LOREM
    textwin.addstr(s)
    textwin.refresh()

    # https://docs.python.org/3.9/howto/curses.html#user-input
    editwin = curses.newwin(1, curses.COLS-2, curses.LINES-2, 1)
    boxwin = curses.newwin(3, curses.COLS, curses.LINES-3, 0)

    boxwin.border()
    boxwin.refresh()

    # Using closure to capture box
    def outer(box):
        # Actual function
        def inner(ch):
            nonlocal s
            # User input (expression)
            expr = box.gather().strip()
            if not curses.has_key(ch):
                expr += chr(ch)
            if not expr:
                textwin.erase()
                textwin.addstr(s)
                textwin.refresh()
                return ch
            try:
                matches = list(re.finditer(expr, s))
            except re.error:
                return ch
            textwin.erase()

            prev = 0
            for i, m in enumerate(matches):
                textwin.addstr(s[prev:m.start()])
                textwin.addstr(m.group(0), curses.color_pair(1))
                prev = m.end()
            textwin.addstr(s[prev:])

            textwin.refresh()
            return ch
        return inner

    box = Textbox(editwin)
    # Use validator as keystroke callback with side-effect
    box.edit(outer(box))


if __name__ == '__main__':
    curses.wrapper(main)
