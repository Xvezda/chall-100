# Day 65

Proxy for easy pseudo-classes style manipulation via JavaScript.

```javascript
const styleProxy = pseudoClassProxy(element)

/*
Equivalent to:
    element {
        color: black;
    }
    element:hover {
        color: red;
    }
*/
styleProxy.color = 'black'
styleProxy[':hover'].color = 'red'
```

## References

* https://developer.mozilla.org/ko/docs/Web/CSS/:hover

