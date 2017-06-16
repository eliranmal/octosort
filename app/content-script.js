var win = window;
var doc = document;

// a dmz empty object to ensure a well-known binding context
var ø = Object.create(null);

var selectors = {
    ghHeader: '.gh-header-meta',
    ghDiscussion: '.discussion-timeline .js-discussion',
    ghComments: '.discussion-timeline .js-discussion .timeline-comment-wrapper',
    ghReactions: '.comment-reactions-options button',
};
var reactionTypes = {
    thumbsUp: 'THUMBS_UP',
    thumbsDown: 'THUMBS_DOWN',
    laugh: 'LAUGH',
    hooray: 'HOORAY',
    confused: 'CONFUSED',
    heart: 'HEART',
};


function sortCommentsByRank() {
    // get sorted comments
    var commentsByRank = domElements(selectors.ghComments)
        .map(indexCommentByRank)
        .sort(propertyComparator.bind(ø, 'rank'))
        .map(unwrap.bind(ø, 'element'));
    log('commentsByRank:', commentsByRank);
    // render to dom
    commentsByRank.forEach(invoke.bind(ø,  'remove'));
    commentsByRank.reverse().forEach(prependChild.bind(ø, domElement(selectors.ghDiscussion)));
}

function indexCommentByRank(commentEl) {
    var rank = commentPositiveRank(commentEl);
    var commentWrapper = wrap(commentEl, 'element');
    return Object.defineProperty(commentWrapper, 'rank', wrap(rank, 'value'));
}

function commentPositiveRank(commentEl) {
    return domElements(selectors.ghReactions, commentEl)
    // todo - compute rank instead of filtering stuff out
        .filter(includePositiveReactionElements)
        .reduce(childNodeCollector, [])
        .reduce(domNumbersAccumulator, 0);
}

function includePositiveReactionElements(reactionEl) {
    var val = reactionEl.value.split(' ');
    return val.includes(reactionTypes.thumbsUp) ||
        val.includes(reactionTypes.hooray) ||
        val.includes(reactionTypes.heart) ||
        val.includes(reactionTypes.laugh);
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

function domNumbersAccumulator(accum, el) {
    return accum + nodeTextToNumber(el);
}

function childNodeCollector(accum, el) {
    return accum.concat(asArray(el.childNodes));
}

function prependChild(parent, child) {
    parent.insertBefore(child, parent.firstChild || null);
}


function addSortButton() {
    var icon = createIcon();
    var button = createButton(sortCommentsByRank);
    var buttonWrapper = createHeaderItemWrapper();
    var ghHeader = domElement(selectors.ghHeader);

    prependChild(button, icon);
    buttonWrapper.appendChild(button);
    ghHeader.appendChild(buttonWrapper);
}

function createButton(onClick) {
    var btn = document.createElement('button');

    btn.className = 'btn btn-sm';
    btn.textContent = 'sort\'em out!';
    btn.addEventListener('click', onClick, false);

    return btn;
}

function createIcon() {
    var icon = document.createElement('span');

    icon.className = 'octicon';
    icon.style.width = '16px';
    icon.style.height = '16px';
    icon.style.marginRight = '4px';
    icon.style.backgroundImage = 'url("' + getVectorGraphic('thumbsup') + '")';

    return icon;
}

function createHeaderItemWrapper() {
    var wrapper = document.createElement('div');

    wrapper.className = 'TableObject-item';
    wrapper.style.padding = '0 1em';

    return wrapper;
}


function domElements(selector, contextEl) {
    return asArray((contextEl || doc).querySelectorAll(selector));
}

function domElement(selector) {
    return doc.querySelector(selector);
}

function nodeTextToNumber(el) {
    if (el.nodeType !== Node.TEXT_NODE) {
        return 0;
    }
    var num = parseInt(el.textContent.trim(), 10);
    if (isNaN(num)) {
        return 0;
    }
    return num;
}

function getImage(file) {
    return getResource('images/' + file + '.png');
}

function getVectorGraphic(file) {
    return getResource('images/' + file + '.svg');
}

function getResource(path) {
    return chrome.extension.getURL(path);
}

function asArray(nodeList) {
    return [].slice.call(nodeList);
}

function invoke(fnName, obj, arg1, arg2, arg3) {
    // don't use .apply() .bind() or .call(), to avoid illegal invocation on dom interfaces
    obj[fnName](arg1, arg2, arg3);
}

function wrap(item, prop) {
    var obj = {};
    obj[prop] = item;
    return obj;
}

function unwrap(prop, item) {
    return item[prop];
}

function log() {
    console.log.apply(console, arguments);
}

function err() {
    console.error.apply(console, arguments);
}


doc.addEventListener('readystatechange', function () {
    if (doc.readyState === 'complete') {
        addSortButton();
    }
}, false);
