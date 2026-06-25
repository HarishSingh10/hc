import os
import re

src_dir = r"c:\Users\haris\OneDrive\Desktop\hc\frontend\src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace single quoted strings: 'http://localhost:8080/api/...' -> `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/...`
            content = re.sub(
                r"'http://localhost:8080/api(.*?)'",
                r"`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}\1`",
                content
            )
            
            # Replace inside template literals: `http://localhost:8080/api/...` -> `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/...`
            content = re.sub(
                r"`http://localhost:8080/api(.*?)`",
                r"`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}\1`",
                content
            )
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
