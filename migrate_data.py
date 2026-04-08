import os
import glob
import re
import chardet

source_dir = "/Users/coconut/Downloads/invisible-wings.github.io-main/js"
output_dir = "/Users/coconut/Downloads/invisible-wings.github.io-main/v2/src/data"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

files = glob.glob(os.path.join(source_dir, "*.js"))

def clean_content(content):
    # This time, just replace ALL 'var ' and 'let ' with 'export const '
    # except those inside 'for(' which we will fix back.
    
    # Replace all leading/following whitespace versions of var/let
    # Replaces 'var ' at the start of any line or after a semicolon
    new_content = re.sub(r'(^|\n|;)\s*(var|let)\s+', r'\1export const ', content)
    
    # Fix the loop variables back to 'let' as export const is invalid in for loops
    new_content = re.sub(r'for\s*\(\s*export const', 'for (let', new_content)
    
    return new_content

for f in files:
    filename = os.path.basename(f)
    print(f"Processing {filename}...")
    
    with open(f, 'rb') as raw:
        content_raw = raw.read()
        result = chardet.detect(content_raw)
        encoding = result['encoding']
        if encoding == 'UTF-16':
            encoding = 'utf-16'
        elif encoding is None:
            encoding = 'utf-8'

    try:
        content = content_raw.decode(encoding)
    except Exception:
        content = content_raw.decode('utf-16le', errors='ignore')

    new_content = clean_content(content)
    
    target_path = os.path.join(output_dir, filename.replace(".js", ".ts"))
    with open(target_path, 'w', encoding='utf-8') as out:
        out.write(new_content)
        
print("Migration completed.")
