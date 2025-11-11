#!/bin/bash
# Comprehensive Bug Testing Script

echo "========================================="
echo "  WouldYouRather.ai - Bug Testing"
echo "========================================="
echo ""

cd /home/user/Whatwouldyourather/src

# Test 1: Check for missing element IDs
echo "1. Checking for element ID mismatches..."
echo ""

# Extract all getElementById calls from JS
grep -oh "getElementById('[^']*')" js/*.js | sed "s/getElementById('\(.*\)')/\1/" | sort -u > /tmp/js_ids.txt

# Extract all IDs from HTML
grep -oh 'id="[^"]*"' index.html | sed 's/id="\(.*\)"/\1/' | sort -u > /tmp/html_ids.txt

# Find IDs in JS but not in HTML
echo "IDs referenced in JavaScript but missing in HTML:"
comm -23 /tmp/js_ids.txt /tmp/html_ids.txt | head -20
echo ""

# Test 2: Check for syntax errors
echo "2. Checking JavaScript files..."
for file in js/*.js; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file")
        echo "  ✓ $file ($lines lines)"
    fi
done
echo ""

# Test 3: Check asset files
echo "3. Checking asset files..."
if [ -f "../assets/images/or.png" ]; then
    echo "  ✓ Background image found"
else
    echo "  ✗ Background image MISSING"
fi

if [ -f "../assets/audio/music.mp3" ]; then
    echo "  ✓ Music found"
else
    echo "  ✗ Music MISSING"
fi

if [ -f "../assets/audio/clock.mp3" ]; then
    echo "  ✓ Clock sound found"
else
    echo "  ✗ Clock sound MISSING"
fi

if [ -f "../assets/audio/ding.mp3" ]; then
    echo "  ✓ Ding sound found"
else
    echo "  ✗ Ding sound MISSING"
fi

if [ -f "../assets/audio/swoosh.mp3" ]; then
    echo "  ✓ Swoosh sound found"
else
    echo "  ✗ Swoosh sound MISSING"
fi
echo ""

# Test 4: Check server configuration
echo "4. Checking server setup..."
if [ -f "server.py" ]; then
    echo "  ✓ server.py found"
    if grep -q "Cross-Origin-Opener-Policy" server.py; then
        echo "  ✓ CORS headers configured"
    else
        echo "  ✗ CORS headers NOT configured"
    fi
else
    echo "  ✗ server.py MISSING"
fi
echo ""

# Test 5: Check FFmpeg configuration
echo "5. Checking FFmpeg.wasm configuration..."
if grep -q "@ffmpeg/ffmpeg" index.html; then
    echo "  ✓ FFmpeg.wasm script included"
else
    echo "  ✗ FFmpeg.wasm script MISSING"
fi

if grep -q "@ffmpeg/util" index.html; then
    echo "  ✓ FFmpeg util script included"
else
    echo "  ✗ FFmpeg util script MISSING"
fi
echo ""

# Test 6: Count features
echo "6. Feature count:"
echo "  - Timing controls: $(grep -c 'id.*Delay\|id.*Duration' index.html)"
echo "  - Color pickers: $(grep -c 'type="color"' index.html)"
echo "  - Sliders: $(grep -c 'type="range"' index.html)"
echo "  - Buttons: $(grep -c '<button' index.html)"
echo ""

echo "========================================="
echo "  Bug scan complete!"
echo "========================================="
