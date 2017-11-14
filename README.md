# Contentful / Metalsmith Boilerplate

An opinionated boilerplate template for creating a statically-generated site, using content managed in [Contentful](https://contentful.org), with a build system backed by [Metalsmith](http://www.metalsmith.io/).

The build system builds a static site to the `/build` folder, which can be deployed on your static host of choice. It's geared towards use on [Netlify](https://www.netlify.com), but you can serve the files from any host that serves static content, including [GitHub Pages](https://help.github.com/articles/using-a-static-site-generator-other-than-jekyll/).

This is still pretty new, so we're still working out some kinks, however we're using it on a number of production sites and it's been very robust.

## Requirements

**Node.js** 4+ (developed against v6.2 so YMMV). You're using `nvm` right? Great — the repo is initialized with an `.nvmrc` file so run `nvm use` and you should be golden

## Installing

### 1. Install the boilerplate:
```sh
# clone the repo
git clone https://github.com/centre-for-effective-altruism/contentful-metalsmith-boilerplate your_project_name
cd your_project_name
# rename default origin to upstream to pull in updates in future
git remote rename origin upstream
# create a new repo on github, and add it as your 'origin' remote
git remote add origin https://github.com/yourhandle/your_project_name
git push -u origin master
# install packages
npm install
```

### 2. Add your environment variables

Link the build system to Contentful by adding API keys to a `.env` file.  Run the following and create API keys (instructions below) as necessary.

```sh
npm run tools
# ? What do you want to do? (Use arrow keys)
# ...
# ❯ Create an Environment Variables file (.env)
```

- Create a new, empty [Contentful](https://app.contentful.com) space
- Go to the APIs tab and generate a new set of keys (or just use the default ones)
- You'll also need a content management token, which is under a tab on the APIs page. Click generate personal token.  _You could also create a new App and generate an OAuth Token and use that instead..._

_(Sensitive data like API keys should never be checked into source control. The `.env` file is excluded by `.gitignore`, so you should be fine, but you should be aware that that's where this data is being stored so you don't inadvertently check it in...)_

#### 3a. Add default Content Types and content

To get started, it's a good idea to populate your Contentful Space with default Content Types and some Entries

Add default Content Types:
```sh
npm run tools
# ? What do you want to do? (Use arrow keys)
# ...
# ❯ Create default Content Types
```

Add default content:
```sh
npm run tools
# ? What do you want to do? (Use arrow keys)
# ...
# ❯ Add default content to space
```

#### 3b. Add a custom Content Type

Add a new Content Type:
```sh
npm run tools
# ? What do you want to do? (Use arrow keys)
# ...
# ❯ Create new Content Type
```

Then go to Contentful and add a few entries.

#### 3c. Edit site.json

In `config/site.json`, there will be a bunch of metadata set to a default that you will want to change.


### 4. Build the site!

Once you've got the site installed, you just have to build it!

```sh
npm run build
# builds static site to /build
```

_(This command bundles scripts with Browserify, compiles SCSS partials into a single CSS file, then runs the Metalsmith build (see **Build commands** below for info on running these commands individually)_

### 5. Serve the site locally

The static site is just a collection of HTML files, so any simple web server will do. We just use `http-server`:

```
npm install -g http-server
```

- Open a new Terminal tab
- Run `cd build` (i.e. the build directory)
- Run `http-server` (serves files at http://localhost:8080 by default)

Open up a browser and look at what you've done!

## Build commands

- `npm run build` — build everything (by default in `development` mode)
- `npm run scripts` — just rebuild styles
- `npm run styles` — just rebuild scripts
- `npm run metalsmith` — rebuild static site using Metalsmith, skip rebuilding styles/scripts
- `npm run staging` - run the build in `staging` mode (essentially the same as `production` but with more debugging). Alias for `NODE_ENV=staging npm run build`
- `npm run production` - run the build in `production` mode (enables minification, file concatenation, CSS purification). Alias for `NODE_ENV=production npm run build`

## Command line tools

To access the tools, run:
```sh
npm run tools
```

This will give you several options:

```sh
? What do you want to do? (Use arrow keys)
❯ Create new Metalsmith plugin
  Create new Content Type
  Delete Content Types
  ──────────────
  Create default Content Types
  Add default content to space
  ──────────────
  Create an Environment Variables file (.env)
```

### Create new Metalsmith plugin

Creates a file with Metalsmith plugin boilerplate under `lib/metalsmith/plugins`, and will helpfully print a `require` call to the REPL that you can add to the main `metalsmith.js` task file (located in `tasks/metalsmith`).

Remember to also add the `.use()` call to the Metalsmith build where you want your plugin to appear:

```js
const insertEmojiRandomly = require(paths.lib('metalsmith/plugins/insert-emoji-randomly'))
...
metalsmith
  .source('../src/metalsmith')
  .destination('../build')
  ...
  .use(insertEmojiRandomly())
```

_(remember to actually call the plugin, and not just pass in the variable — the plugin boilerplate returns a function, so `use(myPlugin)` won't work, you'll need `.use(myPlugin())`)_

The plugin boilerplate adds an options argument, which you can use to easily filter the type of files that will be passed to the plugin (using minimatch glob patterns)

```
const defaults = {
  // set some default options here
  filter: '**/*.html'
}
```

### Create new Content Type

Uses the Contentful Content Management API to create a new Content Type in your Contentful Space, and adds the necessary local data to the build system to make sure that Entries will be included in the build. (If you want to hack around with these files, look in `tasks/metalsmith/content-types`)

Setting the apperance of Contentful field types (like setting a Short Text field to `Slug` or a List field to `Radio`) is not possible over the API, so you'll need to do it manually throught the Contentful web interface.

### Delete Content Types

If you've got a Content Type on Contentful you don't need any more, remove it using this command (which also removes local build files). This is a non-undoable, destructive action, so use this carefully!

### Create default Content Types

Most sites use the same few basic Content Types over and over again. If you want to get up and running quickly, you can use this tool to add some defaults to Contentful. This runs the same script as `Create new Content Type` under the hood, so will add the necessary local info to add each Content Type to the Metalsmith build.

The Content Types are:
- `Page` - static pages
- `Post` - regularly updated content like a blog post
- `Link` - a link to internal or external content. Useful if you want to have multiple Links in a Series (e.g. an external link in your navigation menu etc)
- `Series` - It's often useful to be able to group content into an ordered series, and this is easy with Contentful's powerful relational model. For example, the default navigation menu is a `Series` containing a list of `Pages` and `Links`

The default Content Types are all pretty basic, but are great for getting started. You can then run `Add default content to Space` (see below) to populate the site with some dummy content

### Add default content to Space

Assuming you've added the default Content Types (as above), you might also want to add some dummy content to see how the boilerplate works. It's also a good place to start if you want to repurpose some of it (e.g. it will create a Main Navigation Menu `Series` which you can reuse with your own pages)

## Deploying to Netlify

We love using [Netlify](https://www.netlify.com) to serve our static sites. It's really simple to set up a new site, and they handle continuous integration by linking to your Github repo.

Once you've created a new site and linked your repo, you'll need to tell Netlify how to build your site. This just means adding the build command and setting environment vars:

### Site settings

#### Basic settings tab
**Branch** - probably `master` (the default), unless you're committing production code to a different branch
**Dir** - `build` (default)
**Build command** - `npm run build`

#### Advanced settings tab

You can add environment vars on the Advanced Settings tab. The ones you want are:

`NODE_ENV` => `production`
`CONTENTFUL_SPACE` => `your_contentful_space_id` (get from `.env`)
`CONTENTFUL_DELIVERY_ACCESS_TOKEN` => `your_contentful_delivery_access_token` (get from `.env`)

#### Add publish webhooks to Contentful

It's useful to get the Netlify site to rebuild every time you publish or unpublish content. To do this you'll need to create a new **build hook** in Netlify, then add it to your Contentful space

- Go to your Netlify site settings, and look for the _Build Hooks_ pane under the _Build and Deploy_ tab in the sidebar
- Generate a new build hook ('Contentful' is probably a good name...) and copy it
- Go to your Contentful space, and look for the _Webhooks_ menu item under the _Space settings_ dropdown menu
- Add the webhook
- Choose the events that will fire the webhook. For typical use, you'll just want to check the `Publish` and `Unpublish` fields next to _Entry_.

_(If you've already got the site building and you're happy re-using the same API key in development and production, you can copy these values from your `.env` file. Otherwise generate a new API key in Contentful and copy the details from there. You won't be using the management tools on the server, so you won't need Contentful Preview or Management API keys)_

That's it! Click 'build your site', wait for the site to build/deploy, and bask in the warm glow of how easy that all was.
