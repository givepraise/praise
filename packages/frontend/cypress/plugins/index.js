/// <reference types="cypress" />

// eslint-disable-next-line no-unused-vars
import { startDevServer } from '@cypress/webpack-dev-server';
require('dotenv').config();

module.exports = (on, config) => {
  return config;
};
