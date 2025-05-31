#!/bin/bash
detect_os() {
    case "$(uname -s)" in
        Linux*)     echo "linux";;
        Darwin*)    echo "macos";;
        CYGWIN*|MINGW*|MSYS*) echo "windows";;
        *)          echo "unknown";;
    esac
}


setup_venv() {
    local os=$(detect_os)
    
    echo "Detected OS: $os"
    

    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python -m venv venv
    fi
    

    case $os in
        "windows")
            echo "Activating virtual environment for Windows..."
            source venv/Scripts/activate
            ;;
        "linux"|"macos")
            echo "Activating virtual environment for Unix-based system..."
            source venv/bin/activate
            ;;
        *)
            echo "Unsupported OS. Please activate the virtual environment manually."
            exit 1
            ;;
    esac
}


echo "Starting build process..."


setup_venv


echo "Installing requirements..."
pip install -r requirements.txt

echo "Build process completed successfully!" 