'''\
Find python builtin gadgets
'''

import re
import io
import contextlib
import pkgutil


class Colors:
    red = '\x1b[31m'
    green =  '\x1b[32m'
    yellow =  '\x1b[33m'
    blue =  '\x1b[34m'
    reset =  '\x1b[0m'


redirected = io.StringIO()
with contextlib.redirect_stdout(redirected) as r:
    # https://stackoverflow.com/a/740018
    help('modules')

help_modules = redirected.getvalue()
body = help_modules.split('\n\n')[1]
module_names = [name.strip() for name in body.split() if name[0].isalpha()]

found = []
for name in module_names:
    pkg = pkgutil.get_loader(name)
    try:
        filename = pkg.get_filename()
    except AttributeError:
        continue

    if not filename.endswith('.py'):
        continue

    print('[*]', f'{Colors.red}searching{Colors.reset} {filename}')
    with open(filename, 'r') as f:
        script = f.read()
        if re.search(r'''(?<!['"])\be(xec|val)\b''', script):
            found.append(filename)


def resolve_name(path):
    import os.path
    is_pkg = path.endswith('__init__.py')
    if is_pkg:
        return os.path.basename(os.path.dirname(path))
    root, ext = os.path.splitext(path)
    return os.path.basename(root)


print('[+]', f'{Colors.green}found{Colors.reset}:')
print('\n'.join([f'{Colors.blue}{resolve_name(m)}{Colors.reset}: {m}'
                 for m in found]))
