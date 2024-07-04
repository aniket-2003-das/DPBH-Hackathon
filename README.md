# Dark Pattern Buster Extension

Dark Pattern Buster is a browser extension that helps users identify and counteract dark patterns on various shopping websites.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aniket-2003-das/DPBH-Hackathon
   ```

2. Install the required dependencies:

   ```bash
   pip install -r api/requirements.txt
   ```

3. Run the API server:

   ```bash
   cd api
   python app.py
   ```

4. Add the extension to your Chrome browser:

   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" in the top right.
   - Click "Load unpacked" and select the `app` folder from the cloned repository.
   - The extension should now be installed and ready to use.

## Usage

1. Navigate to a shopping website.
2. Click on the Dark Pattern Buster extension icon in your browser toolbar.
3. Follow the on-screen instructions to analyze the website for dark patterns.

## Screenshots

### Before Analysis

![Before Analysis](before.png)

### After Analysis

![After Analysis](after.png)
