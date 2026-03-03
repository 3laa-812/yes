import os
import re

count = 0
for root, dirs, files in os.walk('/home/alaar/Desktop/proDev/TheKitchen/yes/app'):
    if 'node_modules' in root or '.next' in root:
        continue
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, 'r') as file:
                lines = file.readlines()
            
            modified = False
            for i in range(len(lines) - 1):
                if re.match(r'^\s*// eslint-disable-next-line', lines[i]):
                    if re.match(r'^\s*[{<]', lines[i+1]):
                        original = lines[i].strip()
                        if '/* eslint-disable' not in original:
                            indent = len(lines[i]) - len(lines[i].lstrip())
                            new_line = " " * indent + "{/* " + original.replace('// ', '').strip() + " */}\n"
                            lines[i] = new_line
                            modified = True
            
            if modified:
                with open(path, 'w') as file:
                    file.writelines(lines)
                count += 1
                print(f"Fixed JSX comments in {path}")
print(f"Total files fixed: {count}")
