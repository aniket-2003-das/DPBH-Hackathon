// Function to check if all children are ignored
var allIgnoreChildren = function(element) {
    if (element.children.length === 0) {
        return false;
    } else {
        for (var child of element.children) {
            if (ignoredElements.includes(child.tagName.toLowerCase())) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    }
};

// Function to get segments based on certain conditions
var segments = function(element) {
    if (!element) {
        return [];
    }

    var tag = element.tagName.toLowerCase();
    if (!ignoredElements.includes(tag) && !isPixel(element) && isShown(element)) {
        if (blockElements.includes(tag)) {
            if (!containsBlockElements(element)) {
                if (allIgnoreChildren(element)) {
                    return [];
                } else {
                    if (getElementArea(element) / winArea > 0.3) {
                        var result = [];

                        for (var child of element.children) {
                            result = result.concat(segments(child));
                        }

                        return result;
                    } else {
                        return [element];
                    }
                }
            } else if (containsTextNodes(element)) {
                return [element];
            } else {
                var result = [];

                for (var child of element.children) {
                    result = result.concat(segments(child));
                }

                return result;
            }
        } else {
            if (containsBlockElements(element, false)) {
                var result = [];

                for (var child of element.children) {
                    result = result.concat(segments(child));
                }

                return result;
            } else {
                if (getElementArea(element) / winArea > 0.3) {
                    var result = [];

                    for (var child of element.children) {
                        result = result.concat(segments(child));
                    }

                    return result;
                } else {
                    return [element];
                }
            }
        }
    } else {
        return [];
    }
};


var logTagName = function(element) {
    if (element) {
        console.log("Tag name:", element.tagName.toLowerCase());
    } else {
        console.error("Element is not defined.");
    }
};


var setCustomAttribute = function(element, attributeName, attributeValue) {
    if (element) {
        element.setAttribute(attributeName, attributeValue);
    } else {
        console.error("Element is not defined.");
    }
};
