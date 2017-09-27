# issoseva.org
Issoseva.org website

### Building Locally

- Install Node
  - `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash`
  - `bash -l`
  - `nvm install node`
  - Check node version => `node --version`
- Install yarn & dependencies
  - `npm install -g yarn`
  - `yarn`
- Config file
  - Create new file `config.json` => `touch config.json`
  - Enter followingjson in `config.json` with keys/fields replaced
    ```json
    {
      "port": 9000,
      "fieldbook": {
        "book": "<FIELDBOOK_KEY>",
        "username": "<FIELDBOOK_USERNAME>",
        "password": "<FIELDBOOK_PASSWORD>"
      },
      "smtp": {
        "host": "smtp.zoho.com",
        "port": 465,
        "secure": true,
        "auth": {
          "user": "<ZOHO_USERNAME>",
          "pass": "<ZOHO_PASSWORD>"
        }
      }
    }
    ```

- Fieldbook Sync
  - Create new directory fieldbook
    - `mkdir fieldbook`
  - Run `yarn sync_fieldbook`

- Running Server
  - `node server.js`
  - open `http://localhost:9000/` in browser