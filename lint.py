import sys

def lint_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check for unclosed comments
    comment_open = content.count('/*')
    comment_close = content.count('*/')
    if comment_open != comment_close:
        print(f"ERROR: Unclosed comments! /* count: {comment_open}, */ count: {comment_close}")
        
    # Check for unclosed braces
    brace_open = content.count('{')
    brace_close = content.count('}')
    if brace_open != brace_close:
        print(f"ERROR: Unclosed braces! {{ count: {brace_open}, }} count: {brace_close}")

    if comment_open == comment_close and brace_open == brace_close:
        print("CSS basic structure (comments and braces) looks balanced.")

lint_css('css/styles.css')
