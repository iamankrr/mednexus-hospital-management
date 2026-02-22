#!/usr/bin/env python3
import os
import re

# API config import line
API_IMPORT = "import API_URL from '../config/api';\n"

def fix_file(filepath):
    """Fix a single file"""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Skip if already has import
        if 'import API_URL from' in content:
            print(f"⏭️  Skip (already updated): {filepath}")
            return
        
        # Add import after other imports
        lines = content.split('\n')
        import_end = 0
        
        for i, line in enumerate(lines):
            if line.strip().startswith('import ') or line.strip().startswith('from '):
                import_end = i + 1
        
        # Insert import
        lines.insert(import_end, "\nimport API_URL from '../config/api';")
        
        # Join back
        content = '\n'.join(lines)
        
        # Replace localhost URLs with template literals
        content = re.sub(
            r"'http://localhost:3000",
            r"`${API_URL}",
            content
        )
        content = re.sub(
            r'"http://localhost:3000',
            r'`${API_URL}',
            content
        )
        
        # Write back
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"✅ Fixed: {filepath}")
        
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")

def main():
    """Fix all jsx and js files"""
    src_dir = 'src'
    
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.jsx', '.js')) and file != 'api.js':
                filepath = os.path.join(root, file)
                fix_file(filepath)
    
    print("\n🎉 All files fixed!")

if __name__ == '__main__':
    main()
