# Fetching the minified node image on apline linux
FROM node:16

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /server

RUN apt-get update && apt-get install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libc6 libcairo2  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0   libgtk-3-0  libnspr4  libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6  libx11-6  libx11-xcb1  libxcb1   libxcomposite1  libxcursor1  libxdamage1  libxext6 libxfixes3  libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget  xdg-utils

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
# ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init
# RUN chmod +x /usr/local/bin/dumb-init
# ENTRYPOINT ["dumb-init", "--"]

# Uncomment to skip the chromium download when installing puppeteer. If you do,
# you'll need to launch puppeteer with:
#     browser.launch({executablePath: 'google-chrome-stable'})
# ENV PUPPETEER_SKIP_DOWNLOAD true

# Install puppeteer so it's available in the container.
#RUN npm init -y &&  \
#    npm i puppeteer \
#    # Add user so we don't need --no-sandbox.
#    # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
#    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#    && mkdir -p /home/pptruser/Downloads \
#    && chown -R pptruser:pptruser /home/pptruser \
#    && chown -R pptruser:pptruser /node_modules \
#    && chown -R pptruser:pptruser /package.json \
#    && chown -R pptruser:pptruser /package-lock.json

# Run everything after as non-privileged user.


CMD ["google-chrome-stable"]
# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

# Starting our application
CMD [ "node", "index.js" ]

# Exposing server port
EXPOSE 3000



