const blockElements = ['div', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main', 'form', 'fieldset', 'table'];
const ignoredElements = ['script', 'style', 'noscript', 'br', 'hr'];

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const winArea = winWidth * winHeight;

const getElementArea = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.height * rect.width;
};

const getClientRect = (element) => {
    if (element.tagName.toLowerCase() === 'html') {
        const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        return {
            top: 0,
            left: 0,
            bottom: h,
            right: w,
            width: w,
            height: h,
            x: 0,
            y: 0
        };
    } else {
        return element.getBoundingClientRect();
    }
};

const getBackgroundColor = (element) => {
    const style = window.getComputedStyle(element);
    const tagName = element.tagName.toLowerCase();

    if (style === null || style.backgroundColor === 'transparent') {
        const parent = element.parentElement;
        return (parent === null || tagName === 'body') ? 'rgb(255, 255, 255)' : getBackgroundColor(parent);
    } else {
        return style.backgroundColor;
    }
};

const getRandomSubarray = (arr, size) => {
    const shuffled = arr.slice(0);
    let i = arr.length;
    let temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
};

const elementCombinations = (...arguments) => {
    const r = [];
    const arg = arguments;
    const max = arg.length - 1;

    const helper = (arr, i) => {
        for (let j = 0, l = arg[i].length; j < l; j++) {
            const a = arr.slice(0);
            a.push(arg[i][j])
            if (i === max) {
                r.push(a);
            } else {
                helper(a, i + 1);
            }
        }
    };

    helper([], 0);

    return r.length === 0 ? arguments : r;
};

const getVisibleChildren = (element) => {
    if (element) {
        const children = Array.from(element.children);
        return children.filter(child => isShown(child));
    } else {
        return [];
    }
};

const getParents = (node) => {
    const result = [];
    while (node = node.parentElement) {
        result.push(node);
    }
    return result;
};

const isShown = (element) => {
    const displayed = (element, style) => {
        if (!style) {
            style = window.getComputedStyle(element);
        }

        if (style.display === 'none') {
            return false;
        } else {
            const parent = element.parentNode;

            if (parent && (parent.nodeType === Node.DOCUMENT_NODE)) {
                return true;
            }

            return parent && displayed(parent, null);
        }
    };

    const getOpacity = (element, style) => {
        if (!style) {
            style = window.getComputedStyle(element);
        }

        if (style.position === 'relative') {
            return 1.0;
        } else {
            return parseFloat(style.opacity);
        }
    };

    const positiveSize = (element, style) => {
        if (!style) {
            style = window.getComputedStyle(element);
        }

        const tagName = element.tagName.toLowerCase();
        const rect = getClientRect(element);
        if (rect.height > 0 && rect.width > 0) {
            return true;
        }

        if (tagName == 'path' && (rect.height > 0 || rect.width > 0)) {
            const strokeWidth = element.strokeWidth;
            return !!strokeWidth && (parseInt(strokeWidth, 10) > 0);
        }

        return style.overflow !== 'hidden' && Array.from(element.childNodes).some(
            n => (n.nodeType === Node.TEXT_NODE && !!filterText(n.nodeValue)) ||
                (n.nodeType === Node.ELEMENT_NODE &&
                    positiveSize(n) && window.getComputedStyle(n).display !== 'none')
        );
    };

    const getOverflowState = (element) => {
        const region = getClientRect(element);
        const htmlElem = document.documentElement;
        const bodyElem = document.body;
        const htmlOverflowStyle = window.getComputedStyle(htmlElem).overflow;
        let treatAsFixedPosition;

        const getOverflowParent = (e) => {
            const position = window.getComputedStyle(e).position;
            if (position === 'fixed') {
                treatAsFixedPosition = true;
                return e == htmlElem ? null : htmlElem;
            } else {
                let parent = e.parentElement;

                while (parent && !canBeOverflowed(parent)) {
                    parent = parent.parentElement;
                }

                return parent;
            }

            function canBeOverflowed(container) {
                if (container == htmlElem) {
                    return true;
                }

                const style = window.getComputedStyle(container);
                const containerDisplay = style.display;
                if (containerDisplay.startsWith('inline')) {
                    return false;
                }

                if (position === 'absolute' && style.position === 'static') {
                    return false;
                }

                return true;
            }
        };

        const getOverflowStyles = (e) => {
            let overflowElem = e;
            if (htmlOverflowStyle === 'visible') {
                if (e == htmlElem && bodyElem) {
                    overflowElem = bodyElem;
                } else if (e == bodyElem) {
                    return {
                        x: 'visible',
                        y: 'visible'
                    };
                }
            }

            const ostyle = window.getComputedStyle(overflowElem);
            const overflow = {
                x: ostyle.overflowX,
                y: ostyle.overflowY
            };

            if (e == htmlElem) {
                overflow.x = overflow.x === 'visible' ? 'auto' : overflow.x;
                overflow.y = overflow.y === 'visible' ? 'auto' : overflow.y;
            }

            return overflow;
        };

        const getScroll = (e) => {
            if (e == htmlElem) {
                return {
                    x: htmlElem.scrollLeft,
                    y: htmlElem.scrollTop
                };
            } else {
                return {
                    x: e.scrollLeft,
                    y: e.scrollTop
                };
            }
        };

        for (let container = getOverflowParent(element); !!container; container =
            getOverflowParent(container)) {
            const containerOverflow = getOverflowStyles(container);

            if (containerOverflow.x === 'visible' && containerOverflow.y ===
                'visible') {
                continue;
            }

            const containerRect = getClientRect(container);

            if (containerRect.width == 0 || containerRect.height == 0) {
                return 'hidden';
            }

            const underflowsX = region.right < containerRect.left;
            const underflowsY = region.bottom < containerRect.top;

            if ((underflowsX && containerOverflow.x === 'hidden') || (underflowsY &&
                containerOverflow.y === 'hidden')) {
                return 'hidden';
            } else if ((underflowsX && containerOverflow.x !== 'visible') || (
                underflowsY && containerOverflow.y !== 'visible')) {
                const containerScroll = getScroll(container);
                const unscrollableX = region.right < containerRect.left -
                    containerScroll.x;
                const unscrollableY = region.bottom < containerRect.top -
                    containerScroll.y;
                if ((unscrollableX && containerOverflow.x !== 'visible') || (
                    unscrollableY && containerOverflow.x !== 'visible')) {
                    return 'hidden';
                }

                const containerState = getOverflowState(container);
                return containerState === 'hidden' ? 'hidden' : 'scroll';
            }

            const overflowsX = region.left >= containerRect.left + containerRect.width;
            const overflowsY = region.top >= containerRect.top + containerRect.height;

            if ((overflowsX && containerOverflow.x === 'hidden') || (overflowsY &&
                containerOverflow.y === 'hidden')) {
                return 'hidden';
            } else if ((overflowsX && containerOverflow.x !== 'visible') || (
                overflowsY && containerOverflow.y !== 'visible')) {
                if (treatAsFixedPosition) {
                    const docScroll = getScroll(container);
                    if ((region.left >= htmlElem.scrollWidth - docScroll.x) || (
                        region.right >= htmlElem.scrollHeight - docScroll.y)) {
                        return 'hidden';
                    }
                }

                const containerState = getOverflowState(container);
                return containerState === 'hidden' ? 'hidden' : 'scroll';
            }
        }

        return 'none';
    };

    const hiddenByOverflow = (element) => {
        return getOverflowState(element) === 'hidden' && Array.from(element.childNodes)
            .every(n => n.nodeType !== Node.ELEMENT_NODE || hiddenByOverflow(n) ||
                !positiveSize(n));
    };

    const tagName = element.tagName.toLowerCase();

    if (tagName === 'body') {
        return true;
    }

    if (tagName === 'input' && element.type.toLowerCase() === 'hidden') {
        return false;
    }

    if (tagName === 'noscript' || tagName === 'script' || tagName === 'style') {
        return false;
    }

    const style = window.getComputedStyle(element);

    if (style == null) {
        return false;
    }

    if (style.visibility === 'hidden' || style.visibility === 'collapse') {
        return false;
    }

    if (!displayed(element, style)) {
        return false;
    }

    if (getOpacity(element, style) === 0.0) {
        return false;
    }

    if (!positiveSize(element, style)) {
        return false;
    }

    return !hiddenByOverflow(element);
};

const isInteractable = (element) => {
    const isEnabled = (element) => {
        const disabledSupportElements = ['button', 'input', 'optgroup', 'option', 'select', 'textarea'];
        const tagName = element.tagName.toLowerCase();

        if (!disabledSupportElements.includes(tagName)) {
            return true;
        }

        if (element.getAttribute('disabled')) {
            return false;
        }

        if (element.parentElement && (tagName === 'optgroup' || tagName === 'option')) {
            return isEnabled(element.parentElement);
        }

        return true;
    };

    const arePointerEventsDisabled = (element) => {
        const style = window.getComputedStyle(element);
        if (!style) {
            return false;
        }

        return style.pointerEvents === 'none';
    };

    return isShown(element) && isEnabled(element) && !arePointerEventsDisabled(element);
};

const containsTextNodes = (element) => {
    if (element) {
        if (element.hasChildNodes()) {
            const nodes = [];
            for (const cnode of element.childNodes) {
                if (cnode.nodeType === Node.TEXT_NODE) {
                    const text = filterText(cnode.nodeValue);
                    if (text.length !== 0) {
                        nodes.push(text);
                    }
                }
            }

            return (nodes.length > 0 ? true : false);
        } else {
            return false;
        }
    } else {
        return false;
    }
};

const filterText = (text) => {
    return text.replace(/(\r\n|\n|\r)/gm, '').trim();
};

const isPixel = (element) => {
    const rect = element.getBoundingClientRect();
    const height = rect.bottom - rect.top;
    const width = rect.right - rect.left;

    return (height === 1 && width === 1);
};

const containsBlockElements = (element, visibility = true) => {
    for (const be of blockElements) {
        const children = Array.from(element.getElementsByTagName(be));
        if (visibility) {
            for (const child of children) {
                if (isShown(child)) {
                    return true;
                }
            }
        } else {
            return children.length > 0 ? true : false;
        }
    }

    return false;
};

const isWhitespace = (element) => {
    return (element.nodeType === element.TEXT_NODE &&
        element.textContent.trim().length === 0);
};
