import os
import re

os.makedirs('css', exist_ok=True)
os.makedirs('js', exist_ok=True)

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract CSS
style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL)
style_match = style_pattern.search(html)
if style_match:
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(style_match.group(1).strip())
    html = html.replace(style_match.group(0), '<link rel="stylesheet" href="css/style.css">')

# Extract JS (Find the script tag that contains our custom logic)
script_pattern = re.compile(r'<script>\s*// Database(.*?)</script>', re.DOTALL)
script_match = script_pattern.search(html)
if script_match:
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write("// Database\n" + script_match.group(1).strip())
    html = html.replace(script_match.group(0), '<script src="js/app.js"></script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Successfully split HTML into CSS and JS files!')
