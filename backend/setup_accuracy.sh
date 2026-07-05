#!/bin/bash
# Setup and load accuracy data

cd "$(dirname "$0")/backend"

# Activate virtual environment (if using bash/unix)
# source env/Scripts/activate  # Windows Git Bash
# source env/bin/activate      # macOS/Linux

echo "Running Django migrations..."
python manage.py migrate

echo ""
echo "Loading accuracy assessment data from JSON files..."
python manage.py load_accuracy_data

echo ""
echo "✓ Setup complete! Accuracy data has been loaded."
echo ""
echo "You can now start the Django server with:"
echo "  python manage.py runserver"
