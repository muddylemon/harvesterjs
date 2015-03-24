---
layout: page
title: "documentation"
category: dev
date: 2015-03-23 17:11:28
order: 10
---

Harvester.js documentation is hosted on GitHub pages and is handled by Jekyll. 
This page contains guidelines on document writing (the why, the what and the how).

## Why

Harvester.js has been created with broad adoption in mind. There's no point in making
an API great (and it is great) and failing to help people learn how to use it.

## What

Every non-evident feature in harvester.js should be documented. Even evident ones 
should be considered, as people who are new to the stack might have a different
perception of what is evident.

## How

Our documents are based on the popular [Jekyll docs template](http://bruth.github.io/jekyll-docs-template/) 
and you can find detailed descriptions about the tool on its github doc pages.

### Recipe: starting a new GitHub pages site for an existing project

#### What you will need

* A new repo;
* A 'gh-pages' branch in it 
    - you can create one in GitHub itself by typing the name in the text field and choosing 'Create branch:gh-pages';
    - please keep in mind that this branch will be updated outside the traditional git branching flow -- but chances are you will never need to branch/merge it;

### How to do it

Follow the 'Install & Setup' instructions on the [Jekyll docs template website](http://bruth.github.io/jekyll-docs-template/doc/install-setup.html).

### Recipe: creating a new page

#### What you will need

A previously set up jekyll doc site (see recipe above).

### How to do it

The high-level process is the same no matter the tool you pick. For convenience, this recipe assumes 
you are using [prose.io](http://prose.io).

1. *Make sure you are working on the gh-pages branch*;
2. Open directory _posts;
3. Create a new file, using the following pattern: YYYY-MM-DD-title-of-page.md;
4. Fill in the [front-matter](http://jekyllrb.com/docs/frontmatter/) at the top of the page. For example, this page contains the following front-matter:

  ```
  ---
  layout: page
  title: "documentation"
  category: dev
  date: 2015-03-23 17:11:28
  order: 10
  ---
  ```
5. The remaining contents are pure markdown -- check the next section for structure and language guidelines;
