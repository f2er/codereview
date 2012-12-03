<?php
return array(
	'APP_DEBUG'			=> false,

	'URL_DISPATCH_ON'	=> true,
	'URL_MODEL'			=> 2,

	'TOKEN_ON'		=> true,
	'TOKEN_NAME'	=> '__hash__',
	'TOKEN_TYPE'	=> 'md5',

	'DB_TYPE'	=> 'mysql',  
	'DB_HOST'	=> '127.0.0.1',
	'DB_NAME'	=> 'codereview',  
	'DB_USER'	=> 'root', 
	'DB_PWD'	=> 'zhujie', 
	'DB_PORT'	=> '3306',
	'DB_PREFIX'	=> 'think_',

	'DEFAULT_THEME'			=> 'Default',
	'URL_CASE_INSENSITIVE'	=> true,

	'TMPL_ENGINE_TYPE'		=> 'smarty',
	'TMPL_FILE_DEPR'		=> '_',
	'TMPL_TEMPLATE_SUFFIX'	=> '.tpl',
	'TMPL_ENGINE_CONFIG'	=> array(    
		'caching'			=> false,    
		'debugging'			=> false,
		'config_dir'		=> TMPL_PATH . 'Conf',
		'left_delimiter'	=> '{%',
		'right_delimiter'	=> '%}',
		'template_dir'		=> TMPL_PATH,    
		'compile_dir'		=> CACHE_PATH,    
		'cache_dir'			=> TEMP_PATH,
	),
);