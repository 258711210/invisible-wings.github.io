import os
import re

def clean_and_normalize(filepath):
    if not os.path.exists(filepath): return
    print(f"Normalizing {filepath}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Completely strip known prefixes and noise
    # We want to get back to a state of just "Var=Val, Var=Val..."
    content = content.replace('export const ', '')
    content = content.replace('export var ', '')
    content = content.replace('export let ', '')
    content = content.replace('const ', '')
    content = content.replace('var ', '')
    content = content.replace('let ', '')
    
    # Remove all semicolons to simplify splitting
    content = content.replace(';', ',')

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
            elif char == '\n' and bracket_depth == 0:
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
    final_lines = []
    for p in parts:
        if not p: continue
        # Expect "VarName = Value"
        if '=' in p:
            name, val = p.split('=', 1)
            name = name.strip()
            val = val.strip()
            if name and name not in seen_vars:
                final_lines.append(f"export const {name} = {val};")
                seen_vars.add(name)
        else:
            # Standalone? Skip or handle?
            pass

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(final_lines) + '\n')
    print(f"  Done. {len(seen_vars)} items exported.")

data_dir = "/Users/coconut/Downloads/invisible-wings.github.io-main/v2/src/data"
for filename in os.listdir(data_dir):
    if filename.endswith(".ts"):
        clean_and_normalize(os.path.join(data_dir, filename))
