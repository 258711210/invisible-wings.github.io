import os
import re

def deduplicate_exports(filepath):
    if not os.path.exists(filepath): return
    print(f"Deduplicating {filepath}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return
    
    seen = set()
    new_lines = []
    duplicates_count = 0
    for line in lines:
        # Match both 'export const varName =' and 'export var varName ='
        match = re.search(r'export (const|var|let) (\w+)', line)
        if match:
            var_name = match.group(2)
            if var_name in seen:
                duplicates_count += 1
                continue
            seen.add(var_name)
        new_lines.append(line)
        
    if duplicates_count > 0:
        print(f"  Found and removed {duplicates_count} duplicates in {filepath}")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
    else:
        print(f"  No duplicates found in {filepath}")

data_dir = "/Users/coconut/Downloads/invisible-wings.github.io-main/v2/src/data"
for filename in os.listdir(data_dir):
    if filename.endswith(".ts"):
        deduplicate_exports(os.path.join(data_dir, filename))
