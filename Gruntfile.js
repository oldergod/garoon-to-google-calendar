'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    gjslint: {
      options: {
        flags: ['--flagfile .gjslintrc'],
        reporter: {
          name: 'console'
        }
      },
      lib: {
        src: ['javascript/*.js']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['javascript/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-gjslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['gjslint', 'jshint']);
};
