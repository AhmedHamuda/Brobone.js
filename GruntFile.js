module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            brobone: {
                src: ["brobone/intro.js", "brobone/controllers/controller.js", "brobone/controllers/controller-manager.js", "brobone/models/model.js", "brobone/models/collection.js", "brobone/views/template-cache.js",
                    "brobone/views/view.js", "brobone/views/item-view.js", "brobone/views/list-item-view.js", "brobone/views/list-view.js",
                    "brobone/views/wrapper-view.js", "brobone/views/form-view.js", "brobone/outro.js"],
                dest: "brobone.js"
            },
            brobone_example: {
                src: ["brobone/intro.js", "brobone/controllers/controller.js", "brobone/controllers/controller-manager.js", "brobone/models/model.js", "brobone/models/collection.js", "brobone/views/template-cache.js",
                   "brobone/views/view.js", "brobone/views/item-view.js", "brobone/views/list-item-view.js", "brobone/views/list-view.js", "brobone/views/wrapper-view.js",
                   "brobone/views/form-view.js",
                   "brobone/views/common/common.js", "brobone/views/common/error-view.js", "brobone/views/common/filter-view.js",
                   "brobone/views/common/pager-view.js", "brobone/views/common/sort-view.js", "brobone/outro.js"],
                dest: "example/scripts/libs/brobone.js"
            },
            broboneFull: {
                src: ["brobone/intro.js", "brobone/controllers/controller.js", "brobone/controllers/controller-manager.js", "brobone/models/model.js", "brobone/models/collection.js", "brobone/views/template-cache.js",
                    "brobone/views/view.js", "brobone/views/item-view.js", "brobone/views/list-item-view.js", "brobone/views/list-view.js", "brobone/views/wrapper-view.js",
                    "brobone/views/form-view.js",
                    "brobone/views/common/common.js", "brobone/views/common/error-view.js", "brobone/views/common/filter-view.js",
                    "brobone/views/common/pager-view.js", "brobone/views/common/sort-view.js", "brobone/outro.js"],
                dest: "brobone-full.js"
            }
        },
        uglify: {
            target: {
                options: {
                    sourceMap: true,
                },
                files: {
                    'brobone.min.js': ['brobone.js']
                }
            },
            target_full: {
                options: {
                    sourceMap: true,
                },
                files: {
                    'brobone-full.min.js': ['brobone-full.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('build', ["concat", "uglify"]);
}