# Day 17

010 Editor template list binary generator.

## Progress

I try to reversed engineering `*.1tl` binary by following steps.

1. Open 010 Editor.
2. Go to `Templates`, and click `Export List` button to generate template list file. `*.1tl`
3. Tweaking some options, variables etc.
4. Go back to step 2 and export it again, until useful amounts of list binaries generated.
5. Drop generated binaries to 010 Editor.
6. Carefully analyze what are the differences between files, and write them down.
7. Write python script to write binary file which reproduce same structure exported before.

## References

* https://docs.python.org/ko/3/library/struct.html
* https://docs.python.org/ko/3/library/os.path.html
* https://docs.python.org/ko/3/library/os.html
* https://docs.python.org/ko/3/library/io.html

