// init constants and variables

var win = window,
    doc = document,
    selectors = {
        ghHeader: '.gh-header-meta'
    };

// declare functions

function log() {
    console.log.apply(console, arguments);
}

function err() {
    console.error.apply(console, arguments);
}

function getResource(path) {
    return chrome.extension.getURL(path);
}

function getImage(file) {
    return getResource('images/' + file + '.png');
}

function createSortButton() {
    log('creating sort button element');
    var b = document.createElement('button'),
        s = b.style;

    b.className = 'btn btn-sm';
    b.textContent = 'sort\'em out!';

    // s.minWidth = '28px';
    // s.height = '28px';
    s.backgroundImage = 'url("' + getImage('logo-48') + '")';

    b.addEventListener('click', function (e) {
        log('clicked the sort button');
        var commentsByCount = getCommentsByCount();
        log('commentsByCount:', commentsByCount);
    }, false);

    log(b);
    return b;
}

function createButtonWrapper(button) {
    log('creating button wrapper element');
    var w = document.createElement('div');

    w.className = 'TableObject-item';
    w.style.padding = '0 1em';

    w.appendChild(button);

    log(w);
    return w;
}

function addSortButton() {
    var button = createSortButton();
    var buttonWrapper = createButtonWrapper(button);
    document.querySelector(selectors.ghHeader).appendChild(buttonWrapper);
}

function getCommentsByCount() {
    return [].slice.call(document.querySelectorAll('.timeline-comment-wrapper:not(.timeline-new-comment)'))
        .map(function (node) {
            var wrapper = node;
            var reactions = [].slice.call(node.querySelectorAll('.comment-reactions-options button'));
            var count = reactions.reduce(function (accum, val) {
                var ar = accum.concat([].slice.call(val.childNodes));
                return ar;
            }, []).reduce(function (accum, val, key, arr) {
                var add = 0;
                if (val.nodeType === Node.TEXT_NODE) {
                    add = parseInt(val.textContent.trim(), 10);
                    if (isNaN(add)) {
                        add = 0;
                    }
                }
                return accum + add;
            }, 0);
            return {
                wrapper: wrapper,
                count: count
            };
        });
    ;
}


doc.addEventListener('readystatechange', function () {
    if (doc.readyState == 'complete') {
        log('ready state is "complete"');
        // todo
        addSortButton();
    }
}, false);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === 'octosort:votes') {
        addSortButton();
    }
});
