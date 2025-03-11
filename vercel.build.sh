#!/bin/bash

# Install dependencies
npm install

# Build the application
npm run build

# Move necessary files to the correct location
mkdir -p public
cp -r dist/news-aggregator-ui/browser/* public/ 