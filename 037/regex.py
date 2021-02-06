'''Regular expression visualization tool.'''

import re
import io
import curses
import curses.ascii
from curses.textpad import Textbox
from contextlib import contextmanager, redirect_stdout


def main(stdscr):
    if not curses.has_colors():
        return
    curses.start_color()
    colors = [curses.COLOR_RED, curses.COLOR_GREEN, curses.COLOR_BLUE]
    for i, v in enumerate(colors):
        curses.init_pair(i+1, 0, v)

    def color_generator():
        i = 0
        while True:
            yield i+1
            i = (i+1) % len(colors)

    stdscr.refresh()

    textwin = curses.newwin(curses.LINES-3, curses.COLS, 0, 0)
    textwin.scrollok(True)

    # Content of textwin
    ios = io.StringIO()
    with redirect_stdout(ios):
        import this
    s = ios.getvalue()

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
        def _inner(ch):
            nonlocal s

            @contextmanager
            def recover_cursor(box):
                y, x = box.win.getyx()
                try:
                    yield box
                finally:
                    box.win.move(y, x)

            # User input (expression)
            with recover_cursor(box) as b:
                expr = b.gather().strip()

            if curses.has_key(ch) or curses.ascii.iscntrl(ch):
                def nakcmd():  # ^U
                    box.do_command(curses.ascii.SOH)  # ^a
                    box.do_command(curses.ascii.VT)   # ^k
                    return

                table = {
                    curses.ascii.DEL: curses.ascii.BS,
                    curses.ascii.NAK: nakcmd
                }
                ret = table.get(ch, ch)
                if callable(ret):
                    ch = ret()
                else:
                    ch = ret

            if ch:
                box.do_command(ch)
                ch = None
            with recover_cursor(box) as b:
                expr = b.gather().strip()

            try:
                regex = re.compile(expr)
            except re.error:
                pass
            else:
                textwin.erase()

                last = 0
                cg = color_generator()
                for m in re.finditer(regex, s):
                    textwin.addstr(s[last:m.start()])
                    textwin.addstr(m.group(0), curses.color_pair(next(cg)))
                    last = m.end()
                textwin.addstr(s[last:])

        def inner(ch):
            try:
                return _inner(ch)
            finally:
                # Enforce refresh
                textwin.refresh()
        return inner


    box = Textbox(editwin, insert_mode=True)
    try:
        # Use validator as keystroke callback with side-effect
        box.edit(outer(box))
    except KeyboardInterrupt:
        pass


if __name__ == '__main__':
    curses.wrapper(main)
