import os

src_dir = r"c:\Users\haris\OneDrive\Desktop\hc\frontend\src"

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Revert to a relative /api path
            content = content.replace("${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}", "/api")
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
