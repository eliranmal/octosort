// todo - in the options page:
// todo - - provide a way to preserve the position of the first comment
// todo - do es6 stuff
// todo - use this gh issue for testing: https://github.com/eliranmal/git-flux-playground/issues/52

// a dmz empty object to ensure a well-known binding context
var ø = Object.create(null);

// todo - return to simple strings as values, no need for fallback selectors for now
// values are lists of selectors, in order of search; last selectors act as fallback to previous ones 
var selectors = {
    ghHeader: ['.gh-header-meta'],
    ghDiscussion: ['.discussion-timeline .js-discussion'],
    ghComments: ['.discussion-timeline .js-discussion .timeline-comment-wrapper'],
    ghCommentReactions: ['.comment-reactions-options .reaction-summary-item'],
};

// weight for each reaction type
var reactionScore = {
    HOORAY: 3,
    HEART: 3,
    THUMBS_UP: 2,
    LAUGH: 1,
    CONFUSED: -1,
    THUMBS_DOWN: -2,
};


function init() {
    // todo - faster loading: build elements before dom ready, attach them on dom ready
    domReady(render);
}

function sortCommentsByRank() {
    // todo - allow for additional click to return to default sorting
    // get sorted comments
    findElements(selectors.ghComments)
        .map(indexCommentByRank)
        .sort(propertyComparator.bind(ø, 'rank'))
        .map(trace) // for debugging
        .map(unwrap.bind(ø, 'element'))
        // render to dom
        .map(invoke.bind(ø, 'remove'))
        .reverse().map(prependChild.bind(ø, findElement(selectors.ghDiscussion)));
}

function indexCommentByRank(commentEl) {
    var rank = commentRank(commentEl);
    var commentWrapper = wrap(commentEl, 'element');
    return Object.defineProperty(commentWrapper, 'rank', wrap(rank, 'value'));
}

function commentRank(commentEl) {
    return findElements(selectors.ghCommentReactions, commentEl)
        .map(extractReactionRank)
        .reduce(sumAccumulator, 0);
}

function extractReactionRank(reactionEl) {
    var valueList = (reactionEl.value || '').split(' ');
    var type = firstResult(valueList, function (v) {
        return v in reactionScore ? v : null;
    });
    var count = extractReactionCount(reactionEl);
    var score = reactionScore[type];
    return score * count;
}

function extractReactionCount(el) {
    return asArray(el.childNodes).reduce(sumResultAccumulator.bind(ø, parseDomInt), 0);
}

function prependChild(parentEl, childEl) {
    parentEl.insertBefore(childEl, parentEl.firstChild || null);
    // can be used as identity
    return childEl;
}

function invoke(fnName, obj, arg1, arg2, arg3) {
    // don't use .apply() .bind() or .call(), to avoid illegal invocation on dom interfaces
    obj[fnName](arg1, arg2, arg3);
    // can be used as identity
    return obj;
}

function propertyComparator(prop, a, b) {
    var aProp = a[prop];
    var bProp = b[prop];
    if (aProp < bProp) {
        return 1;
    }
    if (aProp > bProp) {
        return -1;
    }
    return 0;
}

function wrap(item, prop) {
    var obj = {};
    obj[prop] = item;
    return obj;
}

function unwrap(prop, item) {
    return item[prop];
}

function asArray(list, start, end) {
    return Array.prototype.slice.call(list, start, end);
}

function sumAccumulator(accum, val) {
    return accum + val;
}

function sumResultAccumulator(fn, accum, val) {
    return accum + fn(val);
}

function firstResult(arr, fn) {
    var result;
    arr.some(function (v) {
        result = fn(v);
        return result;
    });
    return result;
}


// impure functions

function render() {
    const container = findElement(selectors.ghHeader);
    if (container) {
        container.appendChild(
            createElement('div',
                {
                    className: 'TableObject-item octosort-header-item'
                },
                createElement('div',
                    {
                        className: 'BtnGroup octosort-button-group'
                    },
                    createElement('button',
                        {
                            className: 'btn btn-sm octosort-button BtnGroup-item tooltipped tooltipped-s',
                            onclick: sortCommentsByRank,
                            'aria-label': 'sort comments by reactions'
                        },
                        createElement('span',
                            {
                                className: 'octicon octosort-button-icon'
                            },
                            '&#8693;'
                        ),
                        'sort\'em out!'
                    ),
                    createElement('button',
                        {
                            className: 'btn btn-sm octosort-button BtnGroup-item'
                        },
                        'another button!'
                    )
                )
            )
        );
    }
}

function createElement(type, props, ...childElements) {
    const el = document.createElement(type);
    childElements.forEach(function (childEl) {
        if (typeof childEl === 'string') {
            el.insertAdjacentHTML('beforeend', childEl);
        } else if (childEl instanceof Element) {
            el.appendChild(childEl);
        }
    });
    for (const key in props) {
        if (!props.hasOwnProperty(key)) continue;
        const val = props[key];
        if (key in el) {
            el[key] = val;
        } else {
            el.setAttribute(key, val);
        }
    }
    return el;
}

function domReady(fn) {
    document.addEventListener('readystatechange', function () {
        if (document.readyState === 'complete') {
            fn();
        }
    }, false);
}

function getElement(contextEl, selector) {
    return (contextEl || document).querySelector(selector);
}

function getElements(contextEl, selector) {
    return asArray((contextEl || document).querySelectorAll(selector));
}

function findElement(selectors, contextEl) {
    return firstResult(selectors, getElement.bind(ø, contextEl));
}

function findElements(selectors, contextEl) {
    return firstResult(selectors, getElements.bind(ø, contextEl));
}

function parseDomInt(el) {
    if (el.nodeType !== Node.TEXT_NODE) {
        return 0;
    }
    const num = Number.parseInt(el.textContent.trim(), 10);
    if (Number.isNaN(num)) {
        return 0;
    }
    return num;
}

function getImage(file) {
    return getResource('images/' + file);
}

function getResource(path) {
    return chrome.extension.getURL(path);
}

function trace(identity) {
    // log.apply(ø, [].slice.call(arguments));
    log(identity);
    return identity;
}


// context capturing functions for non-generic invocations

function log() {
    console.log.apply(console, arguments);
}

function err() {
    console.error.apply(console, arguments);
}


init();