import enum
import time
import curses
import threading
from math import floor
from random import random
from collections import namedtuple


MS_OF_SEC = 1000
BLOCK = '█'*2
TICK = 0.2


SnakeNode = namedtuple('SnakeNode', ['x', 'y'])
Item = namedtuple('Item', ['x', 'y'])


def get_tick_by_fps(fps):
    return fps / MS_OF_SEC


class Direction(enum.Flag):
    UP = enum.auto()
    LEFT = enum.auto()
    RIGHT = ~LEFT
    DOWN = ~UP


def kbd_main(stdscr, listener):
    while True:
        c = stdscr.getch()
        event = {'key': c}
        listener(event)


def stage_main(stdscr, items, snake):
    def generate():
        x, y = (floor(random() * (curses.COLS // 2)) * 2,
                floor(random() * curses.LINES))
        return x, y

    while True:
        while (p := generate()) in snake:
            pass

        items.append(p)
        time.sleep(5)


def main(stdscr):
    curses.curs_set(0)  # Hide cursor
    x, y = curses.COLS // 2, curses.LINES // 2

    snake = [SnakeNode(x, y)]
    items = []

    direction = Direction.UP
    manipulators = {
        Direction.UP: lambda x, y: (x, y-1),
        Direction.LEFT: lambda x, y: (x-2, y),
        Direction.RIGHT: lambda x, y: (x+2, y),
        Direction.DOWN: lambda x, y: (x, y+1),
    }

    def keyevent_listener(event):
        nonlocal direction
        nonlocal x, y

        keybinds = {}
        def bind(code, direction):
            keybinds[code] = direction

        bind(ord('h'), Direction.LEFT)
        bind(ord('j'), Direction.DOWN)
        bind(ord('k'), Direction.UP)
        bind(ord('l'), Direction.RIGHT)

        input_direction = keybinds.get(event['key'], direction)
        # Cancel out if input direction is opposite
        if ~input_direction == direction:
            return
        direction = input_direction

    threads = []
    threads.append(threading.Thread(name='keyboard',
                                    target=kbd_main,
                                    args=(stdscr, keyevent_listener)))
    threads.append(threading.Thread(name='stage',
                                    target=stage_main,
                                    args=(stdscr, items, snake)))

    for t in threads:
        t.start()

    while True:
        stdscr.clear()
        # Draw items
        for item in items:
            stdscr.addstr(item[1], item[0], '*')

        # Draw snake
        for node in snake:
            stdscr.addstr(node.y, node.x, BLOCK)

        stdscr.refresh()

        # Update position
        x, y = manipulators[direction](x, y)
        # Normalize positions
        x %= curses.COLS
        y %= curses.LINES

        # Insert head
        snake.insert(0, SnakeNode(x, y))
        # Remove tail
        if (x, y) not in items:  # Do not remove if item hits head
            snake.pop()
        else:
            items.remove((x, y))

        time.sleep(TICK)


if __name__ == '__main__':
    curses.wrapper(main)

