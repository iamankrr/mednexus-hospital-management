#!/bin/bash

# Function to get correct import path
get_import_path() {
  local file=$1
  local depth=$(echo "$file" | tr -cd '/' | wc -c)
  depth=$((depth - 1))  # Subtract 1 for 'src/'
  
  if [ $depth -eq 0 ]; then
    echo "'./config/api'"
  elif [ $depth -eq 1 ]; then
    echo "'../config/api'"
  elif [ $depth -eq 2 ]; then
    echo "'../../config/api'"
  elif [ $depth -eq 3 ]; then
    echo "'../../../config/api'"
  fi
}

# Process each file
find src -name "*.jsx" -o -name "*.js" | grep -v "config/api.js" | while read file; do
  # Skip if already has localhost
  if ! grep -q "localhost:3000" "$file"; then
    continue
  fi
  
  # Get correct import path
  import_path=$(get_import_path "$file")
  
  # Check if import already exists at top
  if ! head -20 "$file" | grep -q "import API_URL from"; then
    # Add import after last import statement
    awk -v path="$import_path" '
      /^import / { last_import=NR }
      { lines[NR]=$0 }
      END {
        for(i=1; i<=NR; i++) {
          print lines[i]
          if(i==last_import && !added) {
            print "import API_URL from " path ";"
            added=1
          }
        }
      }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
  
  # Replace localhost:3000 URLs
  sed -i '' "s|'http://localhost:3000|\`\${API_URL}|g" "$file"
  sed -i '' 's|"http://localhost:3000|`${API_URL}|g' "$file"
  
  echo "✅ $file"
done

echo ""
echo "🎉 Done!"
