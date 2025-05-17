#!/bin/sh

get_sd_card() {
  local sd_card_path=$(cat /proc/mounts | sed -n 's/.*\(\/storage\/[0-9A-F]\{4\}-[0-9A-F]\{4\}\).*/\1/p');
  echo "$sd_card_path"
}

list_directory() {
  local dir="$1"
  
  [ -d "$dir" ] || {
    echo "{ \"error\": \"Diretório não existe\" }"
    return 1
  }
  
  find "$dir" -mindepth 1 -maxdepth 1 -type d -printf "d %s %T@ %f\n" -o -type f -printf "f %s %T@ %f\n" | sed 's/ \([0-9]\{9,10\}\)\.[0-9]\{1,10\} / \1 /1'
}

get_subfolder_item_count(){
  local dir="$1"

  ls -A "$dir" 2>/dev/null | wc -l
}

case "$1" in 
  "get_sd_card")
    get_sd_card
    ;;
  "list_directory")
    list_directory "$2"
    ;; 
  "get_subfolder_item_count")
    get_subfolder_item_count "$2"
    ;; 
esac