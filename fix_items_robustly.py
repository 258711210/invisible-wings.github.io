import os
import re

def robust_deduplicate(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    print(f"Robustly deduplicating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove 'export const ' and trailing ';' if any
    content = content.replace('export const ', '').strip()
    if content.endswith(';'):
        content = content[:-1]

    parts = []
    current_part = []
    bracket_depth = 0
    in_string = False
    quote_char = ''
    
    i = 0
    while i < len(content):
        char = content[i]
        
        if not in_string:
            if char in ("'", '"'):
                in_string = True
                quote_char = char
            elif char == '[':
                bracket_depth += 1
            elif char == ']':
                bracket_depth -= 1
            elif char == ',' and bracket_depth == 0:
                parts.append("".join(current_part).strip())
                current_part = []
                i += 1
                continue
        else:
            if char == quote_char and content[i-1] != '\\':
                in_string = False
        
        current_part.append(char)
        i += 1
        
    if current_part:
        parts.append("".join(current_part).strip())

    seen_vars = set()
    final_output = []
    
    for part in parts:
        # Each part should be "VarName = Value"
        # Since we split by comma at depth 0, it's mostly "ItemXXXX=[...]"
        match = re.match(r'^(\w+)\s*=(.*)$', part, re.DOTALL)
        if match:
            var_name = match.group(1)
            value = match.group(2).strip()
            if var_name not in seen_vars:
                final_output.append(f"export const {var_name} = {value};")
                seen_vars.add(var_name)
            else:
                print(f"  Dropped duplicate: {var_name}")
        else:
            if part:
                # Might be a standalone declaration or something else
                final_output.append(f"export const {part};")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("\n".join(final_output))
    
    print(f"  Finished. Total unique exports: {len(seen_vars)}")

data_dir = "/Users/coconut/Downloads/invisible-wings.github.io-main/v2/src/data"
for filename in os.listdir(data_dir):
    if filename.endswith(".ts"):
        target = os.path.join(data_dir, filename)
        robust_deduplicate(target)
