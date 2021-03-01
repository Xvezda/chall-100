import builtins
import inspect


def is_builtin_func(name):
    func = getattr(builtins, name)
    return callable(func) and not inspect.isclass(func)


builtin_funcs = filter(is_builtin_func, dir(builtins))
for name in builtin_funcs:
    print(name)
