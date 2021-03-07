# Day 66

Add `:focus` pseudo-class support from [Day 65](../065).

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
    element:focus {
        color: green;
    }
*/
styleProxy.color = 'black'
styleProxy[':hover'].color = 'red'
styleProxy[':focus'].color = 'green'
```

## References

* https://developer.mozilla.org/ko/docs/Web/CSS/:focus
* https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onfocus
* https://developer.mozilla.org/ko/docs/Web/API/Document/activeElement

