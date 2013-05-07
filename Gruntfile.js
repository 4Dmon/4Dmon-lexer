'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    simplemocha: {
      src: ['test/**/*_test.js'],
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'nodeunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'nodeunit']
      },
    },
  });

  // These plugins provide necessary tasks.
  require('matchdep').filterDev('grunt-*').map(grunt.loadNpmTasks);

  grunt.registerTask('test', [
    'jshint',
    'simplemocha'
  ]);

  // Default task.
  grunt.registerTask('default', ['test']);

};
