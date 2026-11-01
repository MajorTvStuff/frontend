"""Build the site as plain files, for cPanel's public_html — no Node.js app.

    python scripts/export-static.py            (run from site/)

Produces  ../deploy/majorcontent-static.zip  and leaves the unzipped site in
site/out/ to look at. index.html sits at the top of the zip, so extracting it
inside public_html puts the site straight at the domain's root:

    public_html/index.html        the page
    public_html/privacy/          privacy/index.html
    public_html/terms/            terms/index.html
    public_html/404.html          what an unknown URL shows
    public_html/_next/            the CSS, JS and fonts
    public_html/brand/ ...        the film, the logo, the art

Every page on the site is static, so Apache serves it as it is: nothing runs
on the host. Do not open out/index.html by double-clicking it — every path in
it starts at the domain's root (/_next/..., /brand/...), and on disk "/" is
C:\\, so nothing loads. To look at it first, double-click site/preview-site.cmd:
it serves out/ on http://localhost:3013 and opens it in the browser.

The zip carries no .htaccess on purpose: cPanel keeps its own rules there
(Force HTTPS, for one), and extracting would overwrite them.

The review chrome — the "Beta MVP" watermark and the amber confirm-with-client
chips — is off. To build a review copy instead:  python scripts/export-static.py --review
"""

import os
import shutil
import subprocess
import sys
import zipfile

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(SITE)
OUT = os.path.join(SITE, "out")
DEPLOY = os.path.join(REPO, "deploy")
ZIP = os.path.join(DEPLOY, "majorcontent-static.zip")
REVIEW = "--review" in sys.argv


def size(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            total += os.path.getsize(os.path.join(root, f))
    return total


def main():
    env = dict(os.environ)
    # an export always builds in .next (Next forces it: a distDir given with
    # output: export is taken for the export's destination), which is why the
    # dev server lives in .next-dev — see next.config.ts
    env.pop("NEXT_DIST_DIR", None)
    env.update(
        NEXT_OUTPUT="export",
        NEXT_PUBLIC_REVIEW="true" if REVIEW else "false",
        NEXT_PUBLIC_SHOW_TODOS="true" if REVIEW else "false",
    )

    print("1. build (%s)" % ("REVIEW copy: watermark ON" if REVIEW else "for the host: review chrome off"))
    shutil.rmtree(OUT, ignore_errors=True)
    print("  $ npm run build")
    if subprocess.run("npm run build", shell=True, cwd=SITE, env=env).returncode != 0:
        sys.exit("build failed")

    print("2. check")
    for must in ("index.html", "404.html", "privacy/index.html", "terms/index.html",
                 "robots.txt", "sitemap.xml", "_next/static",
                 "brand/major-content-reel-final.webm", "brand/major-content-reel-final.mp4",
                 "brand/major-content-reel-final-end.webp",
                 "brand/major-content-reel-mobile.webm", "brand/major-content-reel-mobile.mp4",
                 "brand/major-content-reel-mobile-end.webp"):
        if not os.path.exists(os.path.join(OUT, must)):
            sys.exit("missing from out/: " + must)

    print("3. zip")
    os.makedirs(DEPLOY, exist_ok=True)
    if os.path.exists(ZIP):
        os.remove(ZIP)
    count = 0
    # written by hand, not with Compress-Archive: Windows PowerShell 5.1 writes
    # backslashes into the entry names, and cPanel's Linux unzip then makes
    # files literally called "privacy\\index.html" instead of folders
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for root, dirs, files in os.walk(OUT):
            dirs.sort()
            for f in sorted(files):
                full = os.path.join(root, f)
                arc = os.path.relpath(full, OUT).replace(os.sep, "/")
                info = zipfile.ZipInfo.from_file(full, arc)
                info.create_system = 3  # unix, so the mode below is honoured
                info.external_attr = (0o100644 & 0xFFFF) << 16
                info.compress_type = zipfile.ZIP_DEFLATED
                with open(full, "rb") as fh:
                    z.writestr(info, fh.read(), compresslevel=9)
                count += 1

    with zipfile.ZipFile(ZIP) as z:
        names = z.namelist()
        if any("\\" in n for n in names):
            sys.exit("backslashes in zip entry names")
        if "index.html" not in names:
            sys.exit("index.html is not at the top of the zip")
        if z.testzip() is not None:
            sys.exit("the zip failed its own integrity check")

    print("\n  site  %s  (%.1f MB, %d files)" % (OUT, size(OUT) / 1048576, count))
    print("  zip   %s  (%.1f MB)" % (ZIP, os.path.getsize(ZIP) / 1048576))
    print("\n  look at it first: double-click preview-site.cmd (in site/)")
    print("  (not out/index.html itself: opened off the disk, nothing loads)")
    print("\n  cPanel > File Manager > public_html > Upload this zip > select it > Extract")


if __name__ == "__main__":
    main()
