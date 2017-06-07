// init constants and variables

var win = window,
    doc = document,
    selectors = {
        iframeCanvas: '#iframe_canvas'
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

    // s.position = 'fixed';
    s.display = 'inline-block';
    s.width = '48px';
    s.height = '48px';
    // s.backgroundColor = 'transparent';
    s.backgroundImage = 'url("' + getImage('logo-48') + '")';
    // s.zIndex = '99999';

    b.addEventListener('click', function (e) {
        log('clicked the sort button');
        var commentsByCount = getCommentsByCount();
        log('commentsByCount:', commentsByCount);
    }, false);

    log(b);
    return b;
}

function addSortButton() {
    var button = createSortButton();
    document.querySelector(selectors.iframeCanvas).parentElement.appendChild(button);
}

function getCommentsByCount() {
    return [].slice.call(document.querySelectorAll('.timeline-comment-wrapper'))
        .map(function (node) {
            var wrapper = node;
            var reactions = [].slice.call(node.querySelectorAll('.comment-reactions-options button'));
            var count = reactions.reduce(function (accum, val) {
                return accum.concat([].slice.call(val.childNodes));
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
        goFullscreen();
    }
});
