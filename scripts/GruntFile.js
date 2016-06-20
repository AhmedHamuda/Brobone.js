module.exports = function (grunt) {

    var StaticServe = require('serve-static');
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        concat: {
            brobone: {
                src: ["brobone/intro.js", "brobone/controllers/controller.js", "brobone/controllers/controller-manager.js", "brobone/models/model.js", "brobone/models/collection.js", "brobone/views/template-cache.js",
                    "brobone/views/view.js", "brobone/views/item-view.js", "brobone/views/list-item-view.js", "brobone/views/list-view.js",
                    "brobone/views/wrapper-view.js", "brobone/views/form-view.js", "brobone/outro.js"],
                dest: "libs/brobone.js"
            },
            broboneFull: {
                src: ["brobone/intro.js", "brobone/controllers/controller.js", "brobone/controllers/controller-manager.js", "brobone/models/model.js", "brobone/models/collection.js", "brobone/views/template-cache.js",
                    "brobone/views/view.js","brobone/views/item-view.js", "brobone/views/list-item-view.js", "brobone/views/list-view.js", "brobone/views/wrapper-view.js",
                    "brobone/views/form-view.js",
                    "brobone/views/common/common.js", "brobone/views/common/error-view.js", "brobone/views/common/filter-view.js",
                    "brobone/views/common/pager-view.js", "brobone/views/common/sort-view.js", "brobone/outro.js"],
                dest: "libs/brobone.js"
            }
        },
        open: {
            all: {
                // Gets the port from the connect configuration
                path: 'http://localhost:<%= connect.server.options.port%>'
            }
        },
        connect: {
             server: {
                options: {
                    port: 8002,
                    hostname: 'localhost',
                    //keepalive: true,
                    // Livereload needs connect to insert a cJavascript snippet
                    // in the pages it serves. This requires using a custom connect middleware
                    base: ".",
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
                files: ['index.cshtml'],
                // This configures the task that will run when the file change
                tasks: ['livereload']
            }
        }
    });

    grunt.registerTask('build', "", function () {
        grunt.task.run("concat:brobone");
    });

    grunt.registerTask('server', [
    'open',
    'livereload-start',
    'connect',
    'regarde'
    ]);
};