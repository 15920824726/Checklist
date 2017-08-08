module.exports = function () {
    var trunk_path = './www';
    var config = {
        path: trunk_path,
        scssPath: '/scss',
        imagesPath: '/content/img',
        stylesPath: '/content/css',
        scriptsPath: '/content/js',
        authPath: '/auth',
        corePath: '/core',
        modulePath: '/module'
    };
    config.libJsPath = [
        config.path + '/lib' + '/*.js',  
    ];
    config.coreJsPath = [
        config.path + config.corePath + '/*.js',  
        config.path + config.corePath + "/**/*.js"
    ];
    config.moduleJsPath =[
        config.path + '/app.js', 
        config.path + config.modulePath + "/**/*.js"
    ];
    config.jsPath = [
        config.path + config.corePath + "/*.js",
        config.path + config.corePath + "/**/*.js",
        config.path + config.modulePath + "/**/*.js",
        config.path + '/app.js'
    ];
    config.cssPath = [        
        config.path + config.stylesPath +  '/*.min.css'
    ];
    return config;
};