module.exports = function (grunt) {

    var StaticServe = require('serve-static');
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        open: {
            all: {
                // Gets the port from the connect configuration
                path: 'http://localhost:<%= connect.server.options.port%>'
            }
        },
        connect: {
             server: {
                options: {
                    port: 9995,
                    hostname: 'localhost',
                    //keepalive: true,
                    // Livereload needs connect to insert a cJavascript snippet
                    // in the pages it serves. This requires using a custom connect middleware
                    base: "../",
                    middleware: function (connect, options) {

                        return [

                          // Load the middleware provided by the livereload plugin
                          // that will take care of inserting the snippet
                          require('grunt-contrib-livereload/lib/utils').livereloadSnippet,

                          // Serve the project folder
                          StaticServe(options.base[0], { 'index': ['index.html', 'index.cshtml'] })
                        ];
                    }
                }
            }
        },
        regarde: {
            server: {
                // This'll just watch the index.html file, you could add **/*.js or **/*.css
                // to watch Javascript and CSS files too.
                files: ['index.html'],
                // This configures the task that will run when the file change
                tasks: ['livereload']
            }
        }
    });

    grunt.registerTask('serve', [
    'open',
    //'livereload-start',
    'connect',
    'regarde'
    ]);
};