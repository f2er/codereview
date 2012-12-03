<?php
class BaseAction extends Action{
    function _initialize() {
		$urls = explode('?', __SELF__);
		$url = strtolower(rtrim($urls[0], '/'));
		$this->_env = array(
				'uri'	=> __SELF__,
				'url'	=> $url,
				'get'	=> $_GET,
			);
		$this->_loadUser();
	}

	private function _loadUser() {
        $session = new Session();
		if($session->is_set('id')) {
			$user_info = array(
				'id'		=> $session->get('id'),
				'email'		=> $session->get('email'),
				'username'	=> $session->get('username'),
				'login'	=> true,
			);
		} else {
			$user_info = array(
				'id'		=> 0,
				'email'		=> '',
				'username'	=> '',
				'login'	=> false,
			);
		}
		$this->_user = $user_info;
	}

	function isLogin() {
		return $this->_user['login'] === true;
	}

	function needLogin() {
		if(!$this->isLogin()) {
			if($this->isGet()) {
				$this->redirect('user/login?retu='.base64_encode(__SELF__));
			} else {
				$this->ajaxReturn(null, 'not_login', 0);
			}
		}
	}

	function callbackReturn($data, $cb_name = "callback") {
        if(C('LOG_RECORD')) Log::save();
		if (false === preg_match('/^[a-zA-Z_][a-zA-Z_0-9]{0,32}$/',$cb_name)) {
			throw new Exception('callback name error');
		}
		header("Content-Type:text/html; charset=utf-8");
		exit($cb_name .'('. json_encode($data) .');');
	}
}

