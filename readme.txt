by Jerry Qu - http://www.imququ.com

1、创建建一个名为codereview的mysql库，把codereview.sql导进去；
2、给启web的帐号赋予Public/upload及App/Home/Runtime两个目录及子目录的读写权限；
3、修改App/Home/Conf/config.php文件里的数据库用户密码相关设置、其它设置。

apache配置参考：

<VirtualHost 127.0.0.1:80>
    ServerName cr
    DocumentRoot "c:/users/jerry/work/Php/codereview/"

    Alias /public c:/users/jerry/work/Php/codereview/Public
    <Location "/public/">  
        SetHandler None  
    </Location>  

    <Directory "c:/users/jerry/work/Php/codereview/">
        Options Indexes FollowSymLinks
        AllowOverride All
        Order allow,deny
        Allow from all

	RewriteEngine on
	RewriteCond %{REQUEST_FILENAME} !-d
	RewriteCond %{REQUEST_FILENAME} !-f
	RewriteRule ^(.*)$ index.php/$1 [QSA,PT,L]
    </Directory>
</VirtualHost>
