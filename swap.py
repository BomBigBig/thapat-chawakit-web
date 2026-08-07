import sys
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

process_match = re.search(r'<section id=\"process\".*?</section>', content, re.DOTALL)
about_match = re.search(r'<section id=\"about\".*?</section>', content, re.DOTALL)

if process_match and about_match:
    process_str = process_match.group(0)
    about_str = about_match.group(0)
    
    parts = []
    last_idx = 0
    for match in re.finditer(r'<section id=\"(?:process|about)\".*?</section>', content, re.DOTALL):
        parts.append(content[last_idx:match.start()])
        if 'id="process"' in match.group(0):
            parts.append(about_str)
        else:
            parts.append(process_str)
        last_idx = match.end()
    
    parts.append(content[last_idx:])
    
    new_content = ''.join(parts)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Swapped successfully')
else:
    print('Failed to find sections')
