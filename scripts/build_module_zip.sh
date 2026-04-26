#!/bin/sh
set -eu

MODULE_NAME="${1:-}"

if [ -z "$MODULE_NAME" ]; then
  echo "Usage: $0 <module_name>" >&2
  exit 1
fi

SOURCE_DIR="modules/$MODULE_NAME"
DIST_DIR="dist"
STAGE_DIR="$DIST_DIR/$MODULE_NAME"
ZIP_PATH="$DIST_DIR/${MODULE_NAME}.zip"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Missing module source directory: $SOURCE_DIR" >&2
  exit 1
fi

rm -rf "$STAGE_DIR" "$ZIP_PATH"
mkdir -p "$STAGE_DIR"

cp "$SOURCE_DIR/__init__.py" "$STAGE_DIR/"
cp "$SOURCE_DIR/__manifest__.py" "$STAGE_DIR/"
cp "$SOURCE_DIR/README.md" "$STAGE_DIR/"

for dir in actions data i18n menus models report security views; do
  if [ -d "$SOURCE_DIR/$dir" ]; then
    cp -R "$SOURCE_DIR/$dir" "$STAGE_DIR/"
  fi
done

(
  cd "$DIST_DIR"
  zip -qr "${MODULE_NAME}.zip" "$MODULE_NAME"
)

echo "Built $ZIP_PATH"
