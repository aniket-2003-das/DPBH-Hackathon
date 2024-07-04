document.addEventListener('DOMContentLoaded', function () {

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "popup_open" });
    });

    var analyzeButton = document.getElementsByClassName("analyze-button")[0];
    if (analyzeButton) {
        analyzeButton.onclick = function () {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { message: "analyze_site" });
            });
        };
    }

    var toggle_btn = document.getElementsByClassName('toggle-css')[0];
    if (toggle_btn) {
        toggle_btn.onclick = function () {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { message: "toggle_css" });
            });
        }
    }

    var linkElement = document.getElementsByClassName("link")[0];
    if (linkElement) {
        linkElement.onclick = function () {
            chrome.tabs.create({
                url: linkElement.getAttribute("href"),
            });
        };
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "update_current_count") {
        var numberElement = document.getElementsByClassName("number")[0];
        if (numberElement) {
            numberElement.textContent = request.count;
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const reportButton = document.getElementById('report');
    reportButton.addEventListener('click', reportDarkPatterns);

    function reportDarkPatterns() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tab = tabs[0];
            chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, function (dataUrl) {
                const description = prompt('Enter description for the screenshot:');
                if (description === null) return;

                openModal(dataUrl, description);
            });
        });
    }

    function openModal(imageUrl, description) {
        const modal = document.getElementById('cropperModal');
        const cropperContainer = document.getElementById('cropperContainer');

        const img = new Image();
        img.onload = function () {
            cropperContainer.appendChild(img);
            modal.style.display = 'block';

            const cropper = new Cropper(img, {
                aspectRatio: NaN,
                viewMode: 1,
                zoomable: false,
            });

            document.getElementById('cropButton').addEventListener('click', function () {
                const canvas = cropper.getCroppedCanvas();
                const croppedDataUrl = canvas.toDataURL('image/png');

                modal.style.display = 'none';
                extractTextAndSendData(croppedDataUrl, description);
            });
        };

        img.src = imageUrl;
    }

    function extractTextAndSendData(imageData, description) {
        // Extract text from the image using Tesseract.js or other library
        // Example:
        // const text = extractTextFromImage(imageData);
        // Then send the text along with other data to the Flask backend

        // For now, send the imageData directly without text extraction
        sendData(imageData, description);
    }

    function sendData(imageData, description) {
        fetch('http://127.0.0.1:5000/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData,
                description: description
            })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            })
            .catch(error => {
                console.log(error)
                alert('Error occurred while reporting. Please try again later.');
            });
    }

    document.getElementsByClassName('close')[0].addEventListener('click', function () {
        document.getElementById('cropperModal').style.display = 'none';
    });

    window.onclick = function (event) {
        const modal = document.getElementById('cropperModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
});
