"""Build the site and package it as a zip for GoDaddy / cPanel "Setup Node.js App".

    python scripts/package-deploy.py            (run from site/)

Produces  ../deploy/majorcontent-godaddy-node.zip  and leaves the unzipped
bundle beside it in ../deploy/majorcontent/ so it can be run and checked:

    cd ../deploy/majorcontent && node app.js      -> http://localhost:3000

WHAT IS IN IT, AND WHY IT IS SHAPED THIS WAY

    app.js              the startup file cPanel is pointed at
    package.json        no dependencies: "Run NPM Install" is a harmless no-op
    README-DEPLOY.txt   the upload steps
    app/                the Next.js standalone server
        server.js
        node_modules/   only what the server actually uses, bundled
        .next-deploy/   the built pages and their static assets
        public/         the art, the logo film, the icons

The server sits one folder down in app/ on purpose. cPanel's Node selector
(CloudLinux) insists on owning an entry called `node_modules` in the
application root — it symlinks its own virtual environment there — and a
real node_modules folder in that spot collides with it. One level down,
Node still finds the bundled modules and the selector has its root to itself.

Nothing is installed on the host. The bundle carries its dependencies, and
none of them is compiled code: the only native library Next would use is
`sharp`, for resizing images on demand, and the hosting build turns that off
(NEXT_IMAGES_UNOPTIMIZED) precisely so the zip does not depend on the host's
Linux matching a prebuilt binary. The Windows copy of sharp that the build
traces in is removed here.

The review chrome — the "Beta MVP" watermark, the Variant switch, the amber
confirm-with-client chips — is switched off for this build. To package a
review build instead:  python scripts/package-deploy.py --review
"""

import io
import os
import shutil
import subprocess
import sys
import zipfile

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(SITE)
DIST = ".next-deploy"
OUT = os.path.join(REPO, "deploy")
BUNDLE = os.path.join(OUT, "majorcontent")
ZIP = os.path.join(OUT, "majorcontent-godaddy-node.zip")
REVIEW = "--review" in sys.argv

APP_JS = """/* Startup file for GoDaddy / cPanel "Setup Node.js App".
 *
 * The site is the Next.js standalone server in ./app. It lives one folder
 * down because cPanel's Node selector wants to own `node_modules` in this
 * folder, and the server's bundled node_modules would collide with it here.
 *
 * Nothing needs installing: do not run "NPM Install". Point the application
 * at this file and restart it.
 */
const path = require("path");

process.env.NODE_ENV = "production";
// Linux shells export HOSTNAME as the machine's own name, and Next would try
// to bind to that. (Under Passenger the socket is Passenger's anyway.)
process.env.HOSTNAME = "0.0.0.0";

process.chdir(path.join(__dirname, "app"));
require("./app/server.js");
"""

PACKAGE_JSON = """{
  "name": "major-content",
  "version": "1.0.0",
  "private": true,
  "description": "MAJOR CONTENT - prebuilt Next.js standalone server. Dependencies are bundled in app/node_modules; nothing to install.",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "engines": {
    "node": ">=18.18.0"
  }
}
"""

README = """MAJOR CONTENT - GoDaddy Node.js upload
======================================

This zip is the finished site, already built. Nothing gets compiled or
installed on the server.


UPLOAD (GoDaddy cPanel)

1. cPanel > Software > "Setup Node.js App" > Create Application
     Node.js version ........ 20 or newer   (18.18 is the minimum; 22 is fine)
     Application mode ....... Production
     Application root ....... majorcontent
     Application URL ........ the domain (leave the path after it empty)
     Application startup file  app.js
   Click Create.

2. cPanel > File Manager > open the "majorcontent" folder (it is in your home
   folder, NOT inside public_html).
   Settings (top right) > tick "Show Hidden Files" so you can see everything.

3. Upload majorcontent-godaddy-node.zip into that folder, select it, Extract.
   If it asks about overwriting app.js, say yes.
   You should now see, directly inside "majorcontent":
       app.js   package.json   README-DEPLOY.txt   app/
   (If instead you see a single folder holding those, move its contents up.)

4. Back in "Setup Node.js App": click RESTART on the application.
   Do NOT click "Run NPM Install" - there is nothing to install.

5. Open the domain.


IF IT DOES NOT COME UP

- "503" or "Incomplete response": open stderr.log in the majorcontent folder
  (or the app's log in Setup Node.js App). The first lines say why.
- "Unsupported engine" / syntax errors on startup: the Node.js version is too
  old. Edit the app, pick 20 or newer, Save, Restart.
- A cPanel starter page ("It works!"): the startup file is not app.js, or the
  zip was extracted into a subfolder. Check step 3.
- Pages load but look unstyled: the hidden folder app/.next-deploy did not
  extract. Turn on "Show Hidden Files" and extract the zip again.
- You clicked "Run NPM Install" and it complained: ignore it and Restart.


UPDATING THE SITE LATER

Upload the new zip to the same folder, Extract (overwrite), Restart.


WHAT IS INSIDE

    app.js            startup file
    app/server.js     the Next.js server
    app/node_modules  its dependencies, bundled (pure JavaScript, no binaries)
    app/.next-deploy  the built pages
    app/public        images, the logo film, icons

Runs anywhere Node 18.18+ runs:   node app.js   (then http://localhost:3000)
"""


def run(cmd, env):
    print("  $ " + cmd)
    r = subprocess.run(cmd, shell=True, cwd=SITE, env=env)
    if r.returncode != 0:
        sys.exit("build failed")


def size(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            total += os.path.getsize(os.path.join(root, f))
    return total


def main():
    env = dict(os.environ)
    env.update(
        NEXT_DIST_DIR=DIST,
        NEXT_OUTPUT="standalone",
        NEXT_IMAGES_UNOPTIMIZED="1",
        NEXT_PUBLIC_REVIEW="true" if REVIEW else "false",
        NEXT_PUBLIC_SHOW_TODOS="true" if REVIEW else "false",
    )

    print("1. build (%s)" % ("REVIEW build: watermark and variant switch ON" if REVIEW else "hosting build: review chrome off"))
    shutil.rmtree(os.path.join(SITE, DIST), ignore_errors=True)
    run("npm run build", env)

    standalone = os.path.join(SITE, DIST, "standalone")
    if not os.path.isfile(os.path.join(standalone, "server.js")):
        sys.exit("no standalone/server.js - is NEXT_OUTPUT honoured in next.config.ts?")

    print("2. assemble")
    shutil.rmtree(BUNDLE, ignore_errors=True)
    app = os.path.join(BUNDLE, "app")
    shutil.copytree(standalone, app)
    # the two things `next build` deliberately leaves out of standalone
    shutil.copytree(os.path.join(SITE, DIST, "static"), os.path.join(app, DIST, "static"))
    shutil.copytree(os.path.join(SITE, "public"), os.path.join(app, "public"))

    # sharp is traced in as the build machine's binary (Windows here). The
    # hosting build never resizes images, so it goes rather than ship a
    # library that cannot load on the host.
    for name in ("sharp", "@img"):
        shutil.rmtree(os.path.join(app, "node_modules", name), ignore_errors=True)

    io.open(os.path.join(BUNDLE, "app.js"), "w", encoding="utf-8", newline="\n").write(APP_JS)
    io.open(os.path.join(BUNDLE, "package.json"), "w", encoding="utf-8", newline="\n").write(PACKAGE_JSON)
    io.open(os.path.join(BUNDLE, "README-DEPLOY.txt"), "w", encoding="utf-8", newline="\n").write(README)

    native = []
    for root, _dirs, files in os.walk(BUNDLE):
        for f in files:
            if f.lower().endswith((".node", ".dll", ".exe", ".so", ".dylib")):
                native.append(os.path.relpath(os.path.join(root, f), BUNDLE))
    if native:
        sys.exit("compiled binaries in the bundle - they will not run on the host:\n  " + "\n  ".join(native))

    print("3. zip")
    if os.path.exists(ZIP):
        os.remove(ZIP)
    count = 0
    # written by hand, not with Compress-Archive: Windows PowerShell 5.1 writes
    # backslashes into the entry names, and a Linux unzip then creates files
    # literally called "app\\server.js" instead of folders
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for root, dirs, files in os.walk(BUNDLE):
            dirs.sort()
            for f in sorted(files):
                full = os.path.join(root, f)
                arc = os.path.relpath(full, BUNDLE).replace(os.sep, "/")
                info = zipfile.ZipInfo.from_file(full, arc)
                info.create_system = 3  # unix, so the mode below is honoured
                info.external_attr = (0o100644 & 0xFFFF) << 16
                info.compress_type = zipfile.ZIP_DEFLATED
                with open(full, "rb") as fh:
                    z.writestr(info, fh.read(), compresslevel=9)
                count += 1

    with zipfile.ZipFile(ZIP) as z:
        names = z.namelist()
        bad = [n for n in names if "\\" in n]
        if bad:
            sys.exit("backslashes in zip entry names: " + bad[0])
        for must in ("app.js", "package.json", "README-DEPLOY.txt", "app/server.js",
                     "app/%s/BUILD_ID" % DIST, "app/node_modules/next/package.json"):
            if must not in names:
                sys.exit("missing from the zip: " + must)
        if z.testzip() is not None:
            sys.exit("the zip failed its own integrity check")

    print("\n  bundle  %s  (%.1f MB unpacked, %d files)" % (BUNDLE, size(BUNDLE) / 1048576, count))
    print("  zip     %s  (%.1f MB)" % (ZIP, os.path.getsize(ZIP) / 1048576))


if __name__ == "__main__":
    main()
