<?php 

// 定义ThinkPHP框架路径(相对于入口文件)
define('THINK_PATH', 'ThinkPHP');

//定义项目名称和路径
define('APP_NAME', 'Home');
define('APP_PATH', 'App/Home');
define('APP_PUBLIC_PATH', 'Public'); //静态文件

// 加载框架入口文件 
require(THINK_PATH."/ThinkPHP.php");

//实例化一个网站应用实例
App::run();
?>