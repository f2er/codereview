<?php
class UserModel extends Model {

	protected $_fields = array(
		'email',
	);

	protected $_auto = array(
	);
	
	protected $_validate = array(
		array('username','require','用户名不能为空！',Model::MUST_VALIDATE),
		array('email','email','邮箱格式不正确！',Model::MUST_VALIDATE),
		array('email','','这个邮箱已经被使用！',Model::MUST_VALIDATE, 'unique',Model::MODEL_INSERT),
	);
}
?>