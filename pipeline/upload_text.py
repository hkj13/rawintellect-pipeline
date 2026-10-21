"""Write the paste-ready YouTube title, description and pinned comment for a script.

Usage: python pipeline/upload_text.py scripts/001-blind-spot.json > out/001-blind-spot.upload.txt
"""

import json
import sys


def main() -> None:
    script = json.load(open(sys.argv[1]))
    pub = script["publish"]
    # Keep source links short and unique; YouTube descriptions read better without full URLs repeated.
    links = list(dict.fromkeys(u["url"].removeprefix("https://") for u in script.get("sources", [])))
    # YouTube shows the first three hashtags above the title and ignores all of them past 60.
    tags = " ".join(f"#{t}" for t in pub["hashtags"][:15])
    print(f"TITLE\n{pub['title']}\n")
    print(f"DESCRIPTION\n{pub['description']}\n\nSources: {' · '.join(links)}\n\n{tags}\n")
    print(f"PINNED COMMENT\n{pub.get('pinned_comment', '')}")
    if len(pub["title"]) > 100:
        print(f"\nWARNING: title is {len(pub['title'])} characters; YouTube allows 100.", file=sys.stderr)


if __name__ == "__main__":
    main()
