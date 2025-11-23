#!/usr/bin/env python3
import re
import sys

def fix_asset_paths(content):
    # Fix img src paths
    content = re.sub(r'src="(/[^"]+\.(svg|png|jpg|jpeg))"', r'src={getAssetPath("\1")}', content)
    
    # Fix video source paths  
    content = re.sub(r'src="(/[^"]+\.mp4)"', r'src={getAssetPath("\1")}', content)
    
    # Fix Audio paths
    content = re.sub(r"new Audio\('(/[^']+\.mp3)'\)", r"new Audio(getAssetPath('\1'))", content)
    content = re.sub(r'new Audio\("(/[^"]+\.mp3)"\)', r'new Audio(getAssetPath("\1"))', content)
    
    # Fix template literal img src (for dynamic character images)
    content = re.sub(r"src=\{`(/images/[^`]+)`\}", r"src={getAssetPath(`\1`)}", content)
    
    return content

if __name__ == "__main__":
    file_path = sys.argv[1]
    with open(file_path, 'r') as f:
        content = f.read()
    
    fixed_content = fix_asset_paths(content)
    
    with open(file_path, 'w') as f:
        f.write(fixed_content)
    
    print(f"Fixed: {file_path}")
