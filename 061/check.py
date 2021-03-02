import builtins
import inspect


def is_builtin_func(name):
    func = getattr(builtins, name)
    return callable(func) and not inspect.isclass(func)

def is_builtin_type(name):
    func = getattr(builtins, name)
    return callable(func) and type(func) is type


builtin_funcs = filter(is_builtin_func, dir(builtins))
for name in builtin_funcs:
    print(name)

builtin_types = filter(is_builtin_type, dir(builtins))
for name in builtin_types:
    print(name)

