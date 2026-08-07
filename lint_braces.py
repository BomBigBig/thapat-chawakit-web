def find_unclosed_brace(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    depth = 0
    blocks = []
    
    for i, line in enumerate(lines):
        for char in line:
            if char == '{':
                depth += 1
                blocks.append(i + 1)
            elif char == '}':
                depth -= 1
                if blocks:
                    blocks.pop()
                    
    if depth > 0:
        print(f"Unclosed braces opened at lines: {blocks}")
    elif depth < 0:
        print(f"Too many closing braces! Depth is {depth}")
    else:
        print("Braces are balanced.")

find_unclosed_brace('css/styles.css')
