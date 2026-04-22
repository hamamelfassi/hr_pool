#!/bin/sh
set -eu

MODULE_NAME="hr_pool"
DIST_DIR="dist"
STAGE_DIR="$DIST_DIR/$MODULE_NAME"
ZIP_PATH="$DIST_DIR/${MODULE_NAME}.zip"

rm -rf "$STAGE_DIR" "$ZIP_PATH"
mkdir -p "$STAGE_DIR"

cp __init__.py "$STAGE_DIR/"
cp __manifest__.py "$STAGE_DIR/"
cp README.md "$STAGE_DIR/"

for dir in actions data i18n menus models security views; do
  cp -R "$dir" "$STAGE_DIR/"
done

(
  cd "$DIST_DIR"
  zip -qr "${MODULE_NAME}.zip" "$MODULE_NAME"
)

echo "Built $ZIP_PATH"
