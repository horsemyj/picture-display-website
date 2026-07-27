# Image Display Static Webpage

## Introduction

> ATTENTION! It is recommended to see the fully translated version [Click here](https://github.com/horsemyj/picture-display-website-en-.git)

This is a static webpage that provides image display, offering basic login protection as well as preview and download functionality. The login feature uses local hash comparison, so it is not recommended for use in a production environment. It is intended only for simple image display and should not be used to display content involving confidential or private information. Be cautious of asset leaks and privacy violations.

> Users bear full responsibility for any losses caused by ignoring warnings when using this project.

> This project uses fetch; therefore, please use LiveServer or a local server for mounting tests, otherwise it may fail. If absolutely necessary, please refer to the solutions at the end of the page.

> For the project's effect, see [example](https://pdsite-example.pages.dev/)

## Instructions for Use

### 1. Image Storage

Images are stored in the assets folder. You must run generate-images.js to write the image information dataset into images.json.

```
node generate-images.js
```

### 2. Login Settings

The related scripts are stored in the encrypt folder and can be deleted when deploying the website. Run generate_credentials.js to write several sets of parameter usernames and passwords. Example:

```
node generate_credentials.js admin:password user:password
```

The script will write the hash array into credentials.json. Simply copy the content into credentials.json in the root directory (this action can prevent accidental overwriting).

> The server.js and index.html in the encrypt folder are the graphical versions of the credential generation script. Run server.js first, and then follow the output instructions of server.js to access localhost:3000.

### 3. Login Animation

You can replace 1.ico with the image you want, but it must be in ico format and named 1.ico.

> This project comes with a demo account: username 'admin', password 'admin'

### 4. Notes (Methods for Local Debugging)

> Not verified by the author

Place the following section into index.html, before the main script:

```
<script id="credentials-data" type="application/json">
（insert the content of 'credentials.json' here）
</script>
```

Then replace the original `loadCredentials()` with the version below: (make a backup)

```
let credentials = null;
const credentialsDataEl = document.getElementById('credentials-data');

async function loadCredentials() {
  if (credentials) return credentials;
  try {
    const res = await fetch(CREDENTIALS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Unable to load credentials file');
    credentials = await res.json();
    return credentials;
  } catch (e) {
    console.warn('loadCredentials failed, fallback to inline credentials', e);
    try {
      credentials = JSON.parse(credentialsDataEl?.textContent || '[]');
    } catch (parseErr) {
      console.error('inline credentials parse failed', parseErr);
      credentials = [];
    }
    return credentials;
  }
}
```

