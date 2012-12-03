<?php
class UserAction extends BaseAction{
	function index() {
		$this->redirect('/user/login');
	}

    function reg() {
		$retu = U('/index/index');
		if($this->isGet()) {
			if($this->isLogin()) {
				$this->redirect($retu);
			} else {
				$this->display();
			}
		} else {
			$User = D('User');
			if($User->create()) {
				$User->password = md5(trim($User->password));
				$user_id = $User->add();
				if($user_id) {
					$ses = new Session();
					$ses->set('id',$user_id);
					$ses->set('email',$User->email);
					$ses->set('username',$User->username);

					$this->ajaxReturn(array('retu' => $retu), '注册成功！', 1);
				} else {
					$this->ajaxReturn(null, '注册失败！', 0);
				}
			} else {
				$this->ajaxReturn(null, $User->getError(), 0);
			}
		}
	}

	function login() {
		$retu = trim($_POST['retu']);
		$retu = empty($retu) ? U('/index/index') : base64_decode($retu);

		if($this->isGet()) {
			if($this->isLogin()) {
				$this->redirect($retu);
			} else {
				$this->display();
			}
		} else {
			$User = M('User');
			$email = trim($_POST['email']);
			$password = md5(trim($_POST['password']));


			$user = $User->where(array('email' => $email))->find();
			if(!$user || $user['password'] != $password) {
				$this->ajaxReturn(null, '用户名或密码不对！', 0);
			} else {
				$ses = new Session();
				$ses->set('id',$user['id']);
				$ses->set('email',$user['email']);
				$ses->set('username',$user['username']);
				$this->ajaxReturn(array('retu' => $retu), null, 1);
			}
		}
	}

	function logout() {
		$ses = new Session();
		$ses->destroy();
		$this->redirect('/index/');
	}

	function edit() {
		$this->needLogin();
		if($this->isGET()) {
			$this->display();
		} else {
			$oldpass = trim($_POST['oldpass']);
			$password = trim($_POST['password']);
			$username = trim($_POST['username']);
			$User = M('User');
			$user_id = $this->_user['id'];
			if($oldpass != '' && $password != '') {
				$user = $User->find($user_id);
				if(!$user || $user['password'] != md5($oldpass)) {
					$this->ajaxReturn(null, '原密码不对！', 0);
				}
			}
			if($User->create()) {
				$User->id = $user_id;
				if($password == '') {
					unset($User->password);
				} else {
					$User->password = md5($password);
				}
				$User->save();
				$ses = new Session();
				$ses->set('username',$username);
				$this->ajaxReturn(array('retu' => U('index/index')), '修改成功', 1);
			} else {
				$this->ajaxReturn(null, $User->getError(), 0);
			}
		}
	}
}